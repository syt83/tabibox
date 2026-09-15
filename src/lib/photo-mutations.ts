import { getSupabaseBrowserClient } from "./supabase/client";
import { setDemoFavorite } from "./demo-favorites";

const PHOTOS_BUCKET = "photos";

export interface MutationResult {
  success: boolean;
  message?: string;
}

/**
 * Mock photos (isMock: true) have no Supabase row to update — the toggle is
 * persisted to this browser's localStorage instead (see demo-favorites.ts).
 * Real Supabase-backed photos always go through the database update below.
 */
export async function updatePhotoFavorite(
  photoId: string,
  isFavorite: boolean,
  options: { isMock?: boolean } = {}
): Promise<MutationResult> {
  if (options.isMock) {
    setDemoFavorite(photoId, isFavorite);
    return { success: true };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, message: "Supabase is not configured." };

  const { error } = await supabase.from("photos").update({ is_favorite: isFavorite }).eq("id", photoId);

  if (error) {
    console.error("Favorite update failed:", error);
    return { success: false, message: "즐겨찾기를 변경하지 못했어요. 다시 시도해주세요." };
  }

  return { success: true };
}

export interface DeletePhotoResult extends MutationResult {
  /** DB row was removed but the Storage file could not be cleaned up. */
  storageWarning?: boolean;
}

/**
 * Deletes the database record first, then the Storage file (via its stored
 * storage_path — never inferred from the image URL). If the DB delete
 * fails, nothing is touched and the photo stays visible. If it succeeds
 * but Storage cleanup fails, the photo is already gone from the user's
 * view either way, so that's reported as a soft warning rather than
 * blocking the flow — a leftover Storage file is invisible and harmless.
 */
export async function deletePhoto(photo: { id: string; storagePath?: string }): Promise<DeletePhotoResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, message: "Supabase is not configured." };

  const { error: dbError } = await supabase.from("photos").delete().eq("id", photo.id);
  if (dbError) {
    console.error("Photo delete (database) failed:", dbError);
    return { success: false, message: "사진을 삭제하지 못했어요. 다시 시도해주세요." };
  }

  if (photo.storagePath) {
    const { error: storageError } = await supabase.storage.from(PHOTOS_BUCKET).remove([photo.storagePath]);
    if (storageError) {
      console.error("Photo row deleted but Storage file cleanup failed:", storageError);
      return { success: true, storageWarning: true };
    }
  }

  return { success: true };
}
