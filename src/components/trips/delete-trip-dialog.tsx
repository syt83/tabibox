"use client";

import { createPortal } from "react-dom";

interface DeleteTripDialogProps {
  tripTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

export default function DeleteTripDialog({ tripTitle, onCancel, onConfirm, deleting }: DeleteTripDialogProps) {
  // Portalled to <body> — rendered inside <main>'s isolated stacking context,
  // this dialog would otherwise lose taps in BottomNav's screen region to
  // BottomNav itself (see PhotoViewer for the same fix and why).
  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-trip-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={deleting ? undefined : onCancel}
    >
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 id="delete-trip-title" className="font-display text-lg font-bold text-ink">
          &ldquo;{tripTitle}&rdquo; 여행을 삭제할까요?
        </h2>
        <p className="mt-1 text-sm text-subtext">이 여행의 사진도 모두 함께 삭제돼요. 되돌릴 수 없어요.</p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-ink hover:bg-black/[0.04] disabled:opacity-40"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
