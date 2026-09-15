interface PhotoActionsProps {
  isFavorite: boolean;
  isDemoMode: boolean;
  favoriteBusy: boolean;
  errorMessage?: string;
  onToggleFavorite: () => void;
  onRequestDelete: () => void;
}

export default function PhotoActions({
  isFavorite,
  isDemoMode,
  favoriteBusy,
  errorMessage,
  onToggleFavorite,
  onRequestDelete,
}: PhotoActionsProps) {
  const deleteTitle = isDemoMode ? "데모 모드에서는 사진 삭제를 사용할 수 없어요." : undefined;

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={onToggleFavorite}
          disabled={favoriteBusy}
          aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          aria-pressed={isFavorite}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-semibold text-ink hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>{isFavorite ? "♥" : "♡"}</span>
          {isFavorite ? "즐겨찾기됨" : "즐겨찾기"}
        </button>

        <button
          onClick={onRequestDelete}
          disabled={isDemoMode}
          title={deleteTitle}
          aria-label="사진 삭제"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>🗑</span>
          삭제
        </button>
      </div>

      {isDemoMode && (
        <p className="mt-2 text-xs text-subtext">
          즐겨찾기는 이 브라우저에 저장돼요. 데모 모드에서는 사진 삭제를 사용할 수 없어요.
        </p>
      )}
      {errorMessage && <p className="mt-2 text-xs text-primary">{errorMessage}</p>}
    </div>
  );
}
