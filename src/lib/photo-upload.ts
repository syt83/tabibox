import type { Photo } from "@/types/photo";
import { getSupabaseBrowserClient } from "./supabase/client";
import { mapPhotoRowToPhoto, type PhotoRow } from "./supabase/mappers";
import { extractPhotoMetadata } from "./photo-metadata";
import { extensionForFile } from "./upload-constraints";

const PHOTOS_BUCKET = "photos";

export interface UploadPhotoInput {
  file: File;
  tripId: string;
  userId: string;
}

/**
 * Uploads one photo: Storage first, then a Photos row pointing at it. If
 * the DB insert fails after the file made it to Storage, the orphaned file
 * is cleaned up (best-effort) and the original error is still thrown.
 */
export async function uploadPhotoToSupabase({ file, tripId, userId }: UploadPhotoInput): Promise<Photo> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const photoId = crypto.randomUUID();
  const extension = extensionForFile(file);
  const storagePath = `${userId}/${tripId}/${photoId}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(storagePath, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (uploadError) {
    console.error("Photo storage upload failed:", uploadError);
    throw new Error("storage-upload-failed");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(storagePath);

  const metadata = await extractPhotoMetadata(file);

  const { data, error: insertError } = await supabase
    .from("photos")
    .insert({
      id: photoId,
      trip_id: tripId,
      image_url: publicUrl,
      storage_path: storagePath,
      thumbnail_url: publicUrl,
      taken_at: metadata.takenAt,
      latitude: metadata.latitude ?? null,
      longitude: metadata.longitude ?? null,
      is_favorite: false,
    })
    .select()
    .single<PhotoRow>();

  if (insertError || !data) {
    console.error("Photo metadata insert failed:", insertError);

    const { error: cleanupError } = await supabase.storage.from(PHOTOS_BUCKET).remove([storagePath]);
    if (cleanupError) {
      console.error("Failed to clean up orphaned storage file after DB insert error:", cleanupError);
    }

    throw new Error("db-insert-failed");
  }

  // A freshly-created trip (via /trip/new) has no cover image — give it one
  // from whichever photo happens to land first. `.is("cover_image_url",
  // null)` makes this a no-op once a cover exists, so concurrent uploads in
  // the same batch can't stomp on each other beyond "some photo won" (fine
  // — there's no meaningful "correct" first photo among photos uploaded in
  // the same batch). Best-effort: a failure here shouldn't fail the upload.
  const { error: coverError } = await supabase
    .from("trips")
    .update({ cover_image_url: publicUrl })
    .eq("id", tripId)
    .is("cover_image_url", null);
  if (coverError) {
    console.error("Failed to set trip cover image (non-fatal):", coverError);
  }

  return mapPhotoRowToPhoto(data);
}

export interface BatchUploadItem {
  clientId: string;
  file: File;
  tripId: string;
  userId: string;
}

export interface BatchUploadFailure {
  clientId: string;
  message: string;
}

export interface BatchUploadResult {
  succeeded: Photo[];
  failed: BatchUploadFailure[];
}

export interface BatchUploadCallbacks {
  onItemStart?: (clientId: string) => void;
  onItemSuccess?: (clientId: string, photo: Photo) => void;
  onItemError?: (clientId: string, message: string) => void;
}

const DEFAULT_CONCURRENCY = 3;

/** Uploads a batch of photos with a small worker pool (default 3 at a time). */
export async function uploadPhotosBatch(
  items: BatchUploadItem[],
  callbacks: BatchUploadCallbacks = {},
  concurrency: number = DEFAULT_CONCURRENCY
): Promise<BatchUploadResult> {
  const queue = [...items];
  const succeeded: Photo[] = [];
  const failed: BatchUploadFailure[] = [];

  async function worker(): Promise<void> {
    let item: BatchUploadItem | undefined;
    while ((item = queue.shift())) {
      callbacks.onItemStart?.(item.clientId);
      try {
        const photo = await uploadPhotoToSupabase({ file: item.file, tripId: item.tripId, userId: item.userId });
        succeeded.push(photo);
        callbacks.onItemSuccess?.(item.clientId, photo);
      } catch (err) {
        console.error(`Photo upload failed for ${item.file.name}:`, err);
        const message = "Failed to upload this photo. Please try again.";
        failed.push({ clientId: item.clientId, message });
        callbacks.onItemError?.(item.clientId, message);
      }
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return { succeeded, failed };
}
