"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Photo } from "@/types/photo";
import type { UploadDialogStatus, UploadFile } from "@/types/upload";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUserId } from "@/lib/demo-user";
import { validateFile, ACCEPTED_FILE_INPUT_ACCEPT } from "@/lib/upload-constraints";
import { uploadPhotosBatch, type BatchUploadFailure } from "@/lib/photo-upload";
import { generateId } from "@/lib/uuid";
import PhotoDropzone from "./photo-dropzone";
import UploadPreviewGrid from "./upload-preview-grid";
import UploadProgress from "./upload-progress";

interface UploadPhotosDialogProps {
  tripId: string;
}

function makeUploadFile(file: File): UploadFile {
  return {
    id: generateId(),
    file,
    previewUrl: URL.createObjectURL(file),
    status: "pending",
  };
}

export default function UploadPhotosDialog({ tripId }: UploadPhotosDialogProps) {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const userId = getCurrentUserId();

  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);
  const [status, setStatus] = useState<UploadDialogStatus>("idle");
  const [completedCount, setCompletedCount] = useState(0);
  const [succeeded, setSucceeded] = useState<Photo[]>([]);
  const [failed, setFailed] = useState<BatchUploadFailure[]>([]);

  const filesRef = useRef(files);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Revoke any still-outstanding preview object URLs if the dialog unmounts
  // (e.g. navigation away) while files are still selected.
  useEffect(() => {
    return () => {
      filesRef.current.forEach((uf) => URL.revokeObjectURL(uf.previewUrl));
    };
  }, []);

  function addFiles(fileList: FileList) {
    const nextValid: UploadFile[] = [];
    const nextRejections: string[] = [];

    Array.from(fileList).forEach((file) => {
      const result = validateFile(file);
      if (result.valid) {
        nextValid.push(makeUploadFile(file));
      } else {
        nextRejections.push(`${file.name}: ${result.message}`);
      }
    });

    if (nextValid.length > 0) {
      setFiles((prev) => [...prev, ...nextValid]);
      setStatus("ready");
    }
    setRejections(nextRejections);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((uf) => uf.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((uf) => uf.id !== id);
      if (next.length === 0) setStatus("idle");
      return next;
    });
  }

  function clearAll() {
    files.forEach((uf) => URL.revokeObjectURL(uf.previewUrl));
    setFiles([]);
    setRejections([]);
    setStatus("idle");
  }

  function resetAndClose() {
    files.forEach((uf) => URL.revokeObjectURL(uf.previewUrl));
    setFiles([]);
    setRejections([]);
    setStatus("idle");
    setCompletedCount(0);
    setSucceeded([]);
    setFailed([]);
    setOpen(false);
  }

  async function runUpload(target: UploadFile[]) {
    if (!userId) return;

    setStatus("uploading");
    setCompletedCount(0);

    setFiles((prev) =>
      prev.map((uf) => (target.some((t) => t.id === uf.id) ? { ...uf, status: "uploading", error: undefined } : uf))
    );

    const result = await uploadPhotosBatch(
      target.map((uf) => ({ clientId: uf.id, file: uf.file, tripId, userId })),
      {
        onItemSuccess: (clientId) => {
          setCompletedCount((c) => c + 1);
          setFiles((prev) => prev.map((uf) => (uf.id === clientId ? { ...uf, status: "success" } : uf)));
        },
        onItemError: (clientId, message) => {
          setCompletedCount((c) => c + 1);
          setFiles((prev) => prev.map((uf) => (uf.id === clientId ? { ...uf, status: "error", error: message } : uf)));
        },
      }
    );

    setSucceeded((prev) => [...prev, ...result.succeeded]);
    setFailed(result.failed);
    setStatus(result.failed.length > 0 ? "error" : "success");

    if (result.succeeded.length > 0) {
      router.refresh();
    }
  }

  function retryFailed() {
    const retryTargets = files.filter((uf) => uf.status === "error");
    if (retryTargets.length === 0) return;
    void runUpload(retryTargets);
  }

  const canUpload = status === "ready" && files.length > 0 && Boolean(userId);
  const totalForProgress = files.length;

  let triggerDisabledReason: string | null = null;
  if (!configured) triggerDisabledReason = "사진 추가를 이용하려면 Supabase 설정이 필요해요.";
  else if (!userId) triggerDisabledReason = "사진을 추가하려면 로그인이 필요해요.";

  return (
    <>
      <button
        type="button"
        disabled={Boolean(triggerDisabledReason)}
        title={triggerDisabledReason ?? undefined}
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        + 사진 추가
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={status === "uploading" ? undefined : resetAndClose}
          >
          <div
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">사진 추가</h2>
              {status !== "uploading" && (
                <button onClick={resetAndClose} className="text-subtext hover:text-ink" aria-label="닫기">
                  ✕
                </button>
              )}
            </div>

            {status === "idle" && <PhotoDropzone onFilesSelected={addFiles} />}

            {rejections.length > 0 && status !== "uploading" && (
              <div className="mt-3 rounded-xl bg-primary/5 px-3 py-2 text-xs text-primary">
                {rejections.map((msg) => (
                  <p key={msg}>{msg}</p>
                ))}
              </div>
            )}

            {(status === "ready" || status === "uploading" || status === "success" || status === "error") &&
              files.length > 0 && (
                <div className="mt-1">
                  <UploadPreviewGrid
                    files={files}
                    onRemove={removeFile}
                    onClearAll={clearAll}
                    onAddMore={() => addMoreInputRef.current?.click()}
                    locked={status === "uploading" || status === "success" || status === "error"}
                  />
                  <input
                    ref={addMoreInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_INPUT_ACCEPT}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

            {(status === "uploading" || status === "success" || status === "error") && (
              <div className="mt-5">
                <UploadProgress
                  total={totalForProgress}
                  completed={completedCount}
                  succeededCount={succeeded.length}
                  failedCount={failed.length}
                  uploading={status === "uploading"}
                />
              </div>
            )}

            {status === "success" && (
              <div className="mt-4 rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">
                <p className="font-semibold">사진 {succeeded.length}장을 추가했어요.</p>
                <p className="text-secondary/80">여행의 기억이 안전하게 저장됐어요.</p>
              </div>
            )}

            {status === "error" && failed.length > 0 && (
              <div className="mt-4 rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">
                <p className="font-semibold">
                  {succeeded.length}장 성공 · {failed.length}장 실패
                </p>
                <p className="mt-1 text-primary/80">아래 사진들을 다시 시도해주세요.</p>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              {status === "ready" && (
                <button
                  onClick={() => void runUpload(files)}
                  disabled={!canUpload}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
                >
                  사진 {files.length}장 추가하기
                </button>
              )}

              {status === "error" && failed.length > 0 && (
                <button
                  onClick={retryFailed}
                  className="flex-1 rounded-xl border border-primary py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  실패한 {failed.length}장 다시 시도
                </button>
              )}

              {(status === "success" || status === "error") && (
                <button
                  onClick={resetAndClose}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-ink hover:bg-black/[0.04]"
                >
                  완료
                </button>
              )}
            </div>
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
