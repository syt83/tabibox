import type { Trip } from "@/types/trip";
import { getSupabaseBrowserClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";
import { getCurrentUserId } from "./demo-user";
import { saveDemoTrip, removeDemoTrip } from "./demo-trips";

const PHOTOS_BUCKET = "photos";

export interface CreateTripInput {
  title: string;
  country: string;
  cities: string[];
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
}

export interface CreateTripResult {
  success: boolean;
  trip?: Trip;
  message?: string;
}

// ASCII-only by design: the result becomes a URL path segment (/trip/[id]),
// and non-ASCII characters there round-trip through encode/decode in a way
// that broke the very next client-side navigation to it (confirmed with a
// Korean-only title — the id never resolved after the redirect). Titles
// with no ASCII survive as "trip", disambiguated by the caller's ID suffix.
function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "trip"
  );
}

export function validateTripInput(input: CreateTripInput): string | undefined {
  if (!input.title.trim()) return "여행 이름을 입력해주세요.";
  if (!input.startDate || !input.endDate) return "여행 날짜를 입력해주세요.";
  if (input.startDate > input.endDate) return "종료일이 시작일보다 빠를 수 없어요.";
  return undefined;
}

/**
 * Demo Mode has no "create trip" path against the static mock dataset, and
 * there was previously no Supabase path for it either (see the seed-data
 * comment in supabase/schema.sql) — this is that missing flow. Demo Mode
 * persists to localStorage (see demo-trips.ts); real mode inserts into
 * Supabase's `trips` table.
 */
export async function createTrip(input: CreateTripInput): Promise<CreateTripResult> {
  const validationError = validateTripInput(input);
  if (validationError) return { success: false, message: validationError };

  const year = new Date(input.startDate).getFullYear();

  if (!isSupabaseConfigured()) {
    const trip: Trip = {
      id: `demo-${slugify(input.title)}-${Date.now().toString(36)}`,
      userId: "demo",
      title: input.title.trim(),
      country: input.country,
      year,
      startDate: input.startDate,
      endDate: input.endDate,
      cities: input.cities,
      coverImageUrl: input.coverImageUrl,
      createdAt: new Date().toISOString(),
    };
    saveDemoTrip(trip);
    return { success: true, trip };
  }

  const userId = getCurrentUserId();
  if (!userId) return { success: false, message: "로그인이 필요해요." };

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, message: "여행을 추가하지 못했어요. 다시 시도해주세요." };

  const id = `${slugify(input.title)}-${Date.now().toString(36)}`;
  const { data, error } = await supabase
    .from("trips")
    .insert({
      id,
      user_id: userId,
      title: input.title.trim(),
      country: input.country,
      year,
      start_date: input.startDate,
      end_date: input.endDate,
      cities: input.cities,
      cover_image_url: input.coverImageUrl ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Failed to create trip:", error);
    return { success: false, message: "여행을 추가하지 못했어요. 다시 시도해주세요." };
  }

  const trip: Trip = {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    country: data.country,
    year: data.year,
    startDate: data.start_date,
    endDate: data.end_date,
    cities: data.cities ?? [],
    coverImageUrl: data.cover_image_url ?? undefined,
    createdAt: data.created_at,
  };
  return { success: true, trip };
}

export interface DeleteTripResult {
  success: boolean;
  message?: string;
}

/**
 * Deletes a trip and everything in it. In real mode: Storage files first
 * (a `delete from trips` cascades the `photos` rows via the FK, but never
 * touches Storage — those would otherwise leak, as found the hard way while
 * cleaning up test data), then the trip row itself. In Demo Mode: just the
 * localStorage entry (isMock tells the caller which path a trip is on,
 * same signal PhotoViewer already uses for photos).
 */
export async function deleteTrip(trip: { id: string; isMock: boolean }): Promise<DeleteTripResult> {
  if (trip.isMock) {
    removeDemoTrip(trip.id);
    return { success: true };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, message: "Supabase is not configured." };

  const { data: photoRows, error: listError } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("trip_id", trip.id);

  if (listError) {
    console.error("Failed to list photos before deleting trip:", listError);
    return { success: false, message: "여행을 삭제하지 못했어요. 다시 시도해주세요." };
  }

  const storagePaths = (photoRows ?? []).map((row) => row.storage_path).filter(Boolean);
  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from(PHOTOS_BUCKET).remove(storagePaths);
    if (storageError) {
      // Storage cleanup failing shouldn't block the delete — a leftover
      // file under a deleted trip's id is invisible and harmless, same
      // tradeoff as the single-photo delete flow.
      console.error("Failed to clean up trip's Storage files (continuing with delete):", storageError);
    }
  }

  const { error: deleteError } = await supabase.from("trips").delete().eq("id", trip.id);
  if (deleteError) {
    console.error("Failed to delete trip:", deleteError);
    return { success: false, message: "여행을 삭제하지 못했어요. 다시 시도해주세요." };
  }

  return { success: true };
}
