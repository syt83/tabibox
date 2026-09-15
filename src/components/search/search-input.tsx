"use client";

import { useEffect, useRef, useState } from "react";

interface SearchInputProps {
  value: string;
  onCommit: (value: string) => void;
}

const DEBOUNCE_MS = 300;

export default function SearchInput({ value, onCommit }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function commitNow(next: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    onCommit(next);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setDraft(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onCommit(next), DEBOUNCE_MS);
  }

  return (
    <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm focus-within:border-primary">
      <span className="text-lg text-subtext" aria-hidden>
        🔍
      </span>
      <input
        value={draft}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && commitNow(draft)}
        placeholder="장소, 여행, 사진을 검색하세요"
        aria-label="장소, 여행, 사진 검색"
        className="flex-1 bg-transparent text-base outline-none placeholder:text-subtext"
      />
      {draft && (
        <button
          onClick={() => {
            setDraft("");
            commitNow("");
          }}
          aria-label="Clear search"
          className="text-subtext hover:text-ink"
        >
          ✕
        </button>
      )}
    </div>
  );
}
