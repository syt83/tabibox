import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Photo } from "@/types/photo";
import { getDemoFavorites, applyDemoFavoriteOverrides } from "./demo-favorites";

/**
 * Demo-mode favorite toggles live in localStorage (no server to read them
 * from) — apply them once after mount so server and first client render
 * stay identical, then the merge flows through the caller's own setPhotos.
 */
export function useDemoFavoriteSync(setPhotos: Dispatch<SetStateAction<Photo[]>>) {
  useEffect(() => {
    const overrides = getDemoFavorites();
    if (Object.keys(overrides).length === 0) return;
    setPhotos((prev) => applyDemoFavoriteOverrides(prev, overrides));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
