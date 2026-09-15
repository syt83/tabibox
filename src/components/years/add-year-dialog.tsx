"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { addYear, maxAllowedYear } from "@/lib/year-mutations";

interface AddYearDialogProps {
  existingYears: number[];
  onAdded: (year: number) => void;
}

export default function AddYearDialog({ existingYears, onAdded }: AddYearDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => String(new Date().getFullYear() + 1));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [successYear, setSuccessYear] = useState<number | null>(null);

  function resetAndClose() {
    setOpen(false);
    setError(undefined);
    setSuccessYear(null);
    setValue(String(new Date().getFullYear() + 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const year = Number(value);
    setSubmitting(true);
    setError(undefined);

    const result = await addYear(year, existingYears);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message ?? "연도를 추가하지 못했어요.");
      return;
    }

    setSuccessYear(year);
    onAdded(year);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-primary-dark"
      >
        + 연도 추가
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={resetAndClose}>
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {successYear !== null ? (
              <div className="text-center">
                <p className="text-3xl">🎉</p>
                <p className="mt-3 font-display text-lg font-bold text-ink">{successYear}년을 추가했어요.</p>
                <p className="mt-1 text-sm text-subtext">여행 기록 목록에서 바로 확인할 수 있어요.</p>
                <button
                  onClick={resetAndClose}
                  className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  확인
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-subtext">新しい年</p>
                    <h2 className="font-display text-lg font-bold text-ink">연도 추가</h2>
                  </div>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    aria-label="닫기"
                    className="text-subtext hover:text-ink"
                  >
                    ✕
                  </button>
                </div>
                <p className="mb-4 text-sm text-subtext">새로운 여행 연도를 추가합니다.</p>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-subtext">연도</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    min={1900}
                    max={maxAllowedYear()}
                    autoFocus
                    className="rounded-xl border border-border bg-bg px-3 py-2.5 text-lg font-semibold text-ink outline-none focus:border-primary"
                  />
                </label>

                {error && <p className="mt-2 text-sm text-primary">{error}</p>}

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-ink hover:bg-black/[0.04]"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
                  >
                    {submitting ? "추가 중..." : "추가"}
                  </button>
                </div>
              </form>
            )}
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
