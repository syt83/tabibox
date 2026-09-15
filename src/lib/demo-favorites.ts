const DEMO_FAVORITES_STORAGE_KEY = "tabibox_demo_favorites";

/**
 * Favorite toggles made on mock photos (which have no Supabase row to
 * update) live in this browser's localStorage only — gone if the user
 * clears site data, never shared across devices. Keyed by photo id, only
 * for ids that differ from the photo's baked-in mock isFavorite value.
 */
export function getDemoFavorites(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DEMO_FAVORITES_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function setDemoFavorite(photoId: string, isFavorite: boolean) {
  if (typeof window === "undefined") return;
  const next = { ...getDemoFavorites(), [photoId]: isFavorite };
  window.localStorage.setItem(DEMO_FAVORITES_STORAGE_KEY, JSON.stringify(next));
}

export function applyDemoFavoriteOverrides<T extends { id: string; isFavorite: boolean }>(
  photos: T[],
  overrides: Record<string, boolean>
): T[] {
  if (Object.keys(overrides).length === 0) return photos;
  return photos.map((photo) => (photo.id in overrides ? { ...photo, isFavorite: overrides[photo.id] } : photo));
}
