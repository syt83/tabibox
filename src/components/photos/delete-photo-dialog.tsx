"use client";

interface DeletePhotoDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

export default function DeletePhotoDialog({ onCancel, onConfirm, deleting }: DeletePhotoDialogProps) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-photo-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={deleting ? undefined : onCancel}
    >
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 id="delete-photo-title" className="font-display text-lg font-bold text-ink">
          이 사진을 삭제할까요?
        </h2>
        <p className="mt-1 text-sm text-subtext">삭제하면 되돌릴 수 없어요.</p>

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
    </div>
  );
}
