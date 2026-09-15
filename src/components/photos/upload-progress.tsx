interface UploadProgressProps {
  total: number;
  completed: number;
  succeededCount: number;
  failedCount: number;
  uploading: boolean;
}

export default function UploadProgress({ total, completed, succeededCount, failedCount, uploading }: UploadProgressProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-ink">
        {uploading ? "사진을 추가하고 있어요..." : "추가 완료"}
      </p>
      <p className="mb-3 text-sm text-subtext">
        {completed} / {total} 완료
      </p>

      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-primary transition-all duration-200" style={{ width: `${percent}%` }} />
      </div>

      {!uploading && (
        <p className="text-sm text-subtext">
          <span className="font-semibold text-secondary">{succeededCount}장 성공</span>
          {failedCount > 0 && <span className="font-semibold text-primary"> · {failedCount}장 실패</span>}
        </p>
      )}
    </div>
  );
}
