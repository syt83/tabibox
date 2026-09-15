"use client";

import { useRef, useState } from "react";
import { ACCEPTED_FILE_INPUT_ACCEPT } from "@/lib/upload-constraints";

interface PhotoDropzoneProps {
  onFilesSelected: (files: FileList) => void;
}

export default function PhotoDropzone({ onFilesSelected }: PhotoDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) onFilesSelected(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "border-border bg-bg"
      }`}
    >
      <span className="text-4xl">📥</span>
      <div>
        <p className="text-sm font-semibold text-ink">写真を追加</p>
        <p className="mt-1 text-sm text-subtext">사진을 이곳에 끌어다 놓거나</p>
      </div>
      <span className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
        사진 선택
      </span>
      <p className="text-xs text-subtext">JPG, PNG, WebP 지원 · HEIC는 준비 중이에요 · 최대 20MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_INPUT_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFilesSelected(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
