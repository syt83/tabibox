"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Photo } from "@/types/photo";
import { updatePhotoFavorite, deletePhoto } from "@/lib/photo-mutations";
import PhotoMetadata from "./photo-metadata";
import PhotoActions from "./photo-actions";
import DeletePhotoDialog from "./delete-photo-dialog";

interface PhotoViewerProps {
  photos: Photo[];
  index: number;
  /** Resolves the trip title shown for whichever photo is current — a
   * plain `() => title` for a single-trip context (Trip Detail), or a
   * per-photo lookup when photos span multiple trips (Search). */
  getTripTitle: (photo: Photo) => string;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onPhotoDeleted: (photoId: string) => void;
  onFavoriteChanged: (photoId: string, isFavorite: boolean) => void;
}

const SWIPE_THRESHOLD_PX = 50;
const LONG_PRESS_MS = 450;
const MOVE_CANCELS_PRESS_PX = 10;

export default function PhotoViewer({
  photos,
  index,
  getTripTitle,
  onClose,
  onNavigate,
  onPhotoDeleted,
  onFavoriteChanged,
}: PhotoViewerProps) {
  const router = useRouter();
  const photo = photos[index];
  // Mock photos never carry a storage_path (only real Supabase uploads do),
  // so this is an exact, always-in-sync signal — even when photos in the
  // same array span both real and mock trips (Search results).
  const isDemoMode = !photo?.storagePath;

  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [loadedPhotoId, setLoadedPhotoId] = useState<string | null>(null);
  const [erroredPhotoId, setErroredPhotoId] = useState<string | null>(null);
  const [shownPhotoId, setShownPhotoId] = useState(photo?.id);
  // Tap-to-view is the whole point on a phone (that's the "확대" — the grid
  // thumbnail already opens straight into this full view); the metadata +
  // favorite/delete controls only used to sit in a permanent side panel,
  // which is what clipped them off-screen on a tall portrait photo. They
  // now live in this on-demand sheet instead, opened by a long-press on
  // the photo (or the "⋯" button, for anyone who can't long-press).
  const [sheetOpen, setSheetOpen] = useState(false);
  // Tracks which photo is on screen *right now*, readable from inside async
  // continuations (state read there would be a stale closure).
  const currentPhotoIdRef = useRef(photo?.id);
  useEffect(() => {
    currentPhotoIdRef.current = photo?.id;
  }, [photo?.id]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const hasPrevious = index > 0;
  const hasNext = index < photos.length - 1;

  function clearLongPressTimer() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }
  useEffect(() => clearLongPressTimer, []);

  // Lock background scroll and manage focus for the lifetime of the viewer.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (deleteConfirmOpen) {
        if (e.key === "Escape") setDeleteConfirmOpen(false);
        return;
      }
      if (sheetOpen) {
        if (e.key === "Escape") setSheetOpen(false);
        return;
      }
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && hasPrevious) onNavigate(index - 1);
      else if (e.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, hasPrevious, hasNext, onClose, onNavigate, deleteConfirmOpen, sheetOpen]);

  if (!photo) return null;

  // Photo-specific transient UI state (errors, in-flight flags, the delete
  // confirmation) belongs to whichever photo is showing — reset it the
  // moment the photo changes so Photo B never inherits Photo A's leftover
  // error banner or a stuck "busy" state. loadedPhotoId/erroredPhotoId
  // don't need this: they're already compared against photo.id below.
  if (photo.id !== shownPhotoId) {
    setShownPhotoId(photo.id);
    setFavoriteError(undefined);
    setDeleteError(undefined);
    setFavoriteBusy(false);
    setDeleteConfirmOpen(false);
    setDeleting(false);
    setSheetOpen(false);
  }

  const tripTitle = getTripTitle(photo);
  const imageReady = loadedPhotoId === photo.id;
  const imageFailed = erroredPhotoId === photo.id;

  async function handleToggleFavorite() {
    if (favoriteBusy) return;
    const targetId = photo.id;
    const targetIsMock = isDemoMode;
    const nextValue = !photo.isFavorite;
    setFavoriteError(undefined);
    setFavoriteBusy(true);
    onFavoriteChanged(targetId, nextValue);

    const result = await updatePhotoFavorite(targetId, nextValue, { isMock: targetIsMock });
    // The viewer may have moved to a different photo while this was in
    // flight — the data correction below must still happen regardless
    // (it's id-keyed, so it can't affect the wrong photo), but the local
    // busy/error UI must not: that would bleed target A's outcome onto
    // whatever photo B is now showing.
    const stillCurrent = currentPhotoIdRef.current === targetId;
    if (stillCurrent) setFavoriteBusy(false);

    if (!result.success) {
      onFavoriteChanged(targetId, !nextValue);
      if (stillCurrent) setFavoriteError(result.message ?? "즐겨찾기를 변경하지 못했어요.");
      return;
    }
    router.refresh();
  }

  async function handleConfirmDelete() {
    const targetId = photo.id;
    const targetStoragePath = photo.storagePath;
    setDeleting(true);
    setDeleteError(undefined);
    const result = await deletePhoto({ id: targetId, storagePath: targetStoragePath });
    // Navigating away while a delete confirmation is open isn't reachable
    // today (Prev/Next is blocked while the dialog is up), but this stays
    // id-scoped anyway rather than relying on that — cheap and correct
    // either way.
    const stillCurrent = currentPhotoIdRef.current === targetId;

    if (!result.success) {
      if (stillCurrent) {
        setDeleting(false);
        setDeleteConfirmOpen(false);
        setDeleteError(result.message ?? "사진을 삭제하지 못했어요.");
      }
      return;
    }

    if (stillCurrent) {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setSheetOpen(false);
    }
    onPhotoDeleted(targetId);
    router.refresh();
  }

  function handlePointerDown(e: React.PointerEvent) {
    swipeStart.current = { x: e.clientX, y: e.clientY };
    longPressTriggered.current = false;
    clearLongPressTimer();
    // Capturing unconditionally here (rather than only once a long-press
    // actually fires) silently broke every ordinary click in the viewer —
    // captured pointers retarget their eventual "click" to the capturing
    // element too, so a tap on the ✕ or ‹/› buttons never reached them at
    // all. Only capture once we know this gesture IS a long-press.
    const target = e.currentTarget;
    const pointerId = e.pointerId;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      // Without this, the sheet that opens mid-press covers the same spot
      // the finger/cursor is still resting on — its release then lands on
      // the sheet's backdrop instead of here, and immediately closes what
      // the long-press just opened. Capturing keeps every remaining event
      // for this gesture routed here regardless of what renders on top.
      target.setPointerCapture(pointerId);
      setSheetOpen(true);
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const start = swipeStart.current;
    if (!start) return;
    if (Math.abs(e.clientX - start.x) > MOVE_CANCELS_PRESS_PX || Math.abs(e.clientY - start.y) > MOVE_CANCELS_PRESS_PX) {
      clearLongPressTimer();
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    clearLongPressTimer();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const start = swipeStart.current;
    swipeStart.current = null;
    // A long-press already opened the sheet for this gesture — don't also
    // treat the release as a swipe.
    if (!start || longPressTriggered.current) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    if (dx < 0 && hasNext) onNavigate(index + 1);
    else if (dx > 0 && hasPrevious) onNavigate(index - 1);
  }

  function handlePointerCancel(e: React.PointerEvent) {
    clearLongPressTimer();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    swipeStart.current = null;
  }

  // Portalled straight to <body>: this is a full-screen overlay that must
  // sit above the mobile BottomNav and desktop Sidebar. Rendered inline it
  // would inherit `<main>`'s stacking context (isolated, for SakuraField's
  // background layer) and lose to those nav elements' explicit z-index
  // regardless of its own — confirmed the hard way when a long-press's
  // release landed on the BottomNav instead of the sheet underneath it.
  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/95" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`사진 보기, 전체 ${photos.length}장 중 ${index + 1}번째`}
        className="relative flex h-full w-full items-center justify-center touch-none select-none"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {!imageFailed ? (
          <>
            {!imageReady && (
              <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
                사진을 불러오는 중...
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- native img needed for onLoad/onError with an arbitrary Storage/mock URL */}
            <img
              key={photo.id}
              src={photo.imageUrl}
              alt={photo.locationName ?? photo.city ?? tripTitle}
              className="max-h-full max-w-full w-auto h-auto object-contain transition-opacity duration-200"
              style={{ opacity: imageReady ? 1 : 0 }}
              onLoad={() => setLoadedPhotoId(photo.id)}
              onError={() => setErroredPhotoId(photo.id)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/70">
            <span className="text-3xl" aria-hidden>
              🖼️
            </span>
            <span className="text-sm">이미지를 불러올 수 없어요</span>
          </div>
        )}

        <div className="absolute top-3 inset-x-0 flex items-center justify-center pointer-events-none">
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white/80">
            {index + 1} / {photos.length}
          </span>
        </div>

        {hasPrevious && (
          <button
            onClick={() => onNavigate(index - 1)}
            aria-label="이전 사진"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            ‹
          </button>
        )}
        {hasNext && (
          <button
            onClick={() => onNavigate(index + 1)}
            aria-label="다음 사진"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            ›
          </button>
        )}

        <button
          onClick={() => setSheetOpen(true)}
          aria-label="사진 정보 및 즐겨찾기·삭제 열기"
          className="absolute bottom-4 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
        >
          ⋯
        </button>

        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="사진 보기 닫기"
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
        >
          ✕
        </button>
      </div>

      {sheetOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 md:items-center"
          onClick={(e) => {
            e.stopPropagation();
            setSheetOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-card p-5 shadow-2xl md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-start justify-between">
              <PhotoMetadata photo={photo} tripTitle={tripTitle} index={index} total={photos.length} />
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="닫기"
                className="text-subtext hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-5">
              <PhotoActions
                isFavorite={photo.isFavorite}
                isDemoMode={isDemoMode}
                favoriteBusy={favoriteBusy}
                errorMessage={favoriteError ?? deleteError}
                onToggleFavorite={handleToggleFavorite}
                onRequestDelete={() => setDeleteConfirmOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <DeletePhotoDialog
          deleting={deleting}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </div>,
    document.body
  );
}
