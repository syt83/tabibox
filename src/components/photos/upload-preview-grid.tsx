"use client";

import Image from "next/image";
import type { UploadFile } from "@/types/upload";
import { formatFileSize } from "@/lib/upload-constraints";

interface UploadPreviewGridProps {
  files: UploadFile[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onAddMore: () => void;
  locked: boolean;
}

const STATUS_BADGE: Record<UploadFile["status"], { icon: string; className: string } | null> = {
  pending: null,
  uploading: { icon: "⏳", className: "bg-black/50" },
  success: { icon: "✓", className: "bg-secondary" },
  error: { icon: "✕", className: "bg-primary" },
};

export default function UploadPreviewGrid({ files, onRemove, onClearAll, onAddMore, locked }: UploadPreviewGridProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{files.length}장 선택됨</p>
        <div className="flex items-center gap-3">
          {!locked && (
            <button onClick={onAddMore} className="text-sm font-medium text-secondary hover:opacity-70">
              더 추가
            </button>
          )}
          {!locked && (
            <button onClick={onClearAll} className="text-sm font-medium text-subtext hover:text-primary">
              전체 삭제
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
        {files.map((uf) => {
          const badge = STATUS_BADGE[uf.status];
          return (
            <div key={uf.id} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-bg ring-1 ring-black/[0.03]">
                <Image src={uf.previewUrl} alt={uf.file.name} fill unoptimized className="object-cover" />

                {badge && (
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-white text-lg ${badge.className}`}
                    aria-hidden
                  >
                    {badge.icon}
                  </span>
                )}

                {!locked && (
                  <button
                    onClick={() => onRemove(uf.id)}
                    aria-label={`${uf.file.name} 제거`}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80"
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-ink/70" title={uf.file.name}>
                {uf.file.name}
              </p>
              <p className="text-[11px] text-subtext">{formatFileSize(uf.file.size)}</p>
              {uf.status === "error" && uf.error && <p className="text-[11px] text-primary">{uf.error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
