"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUserId } from "@/lib/demo-user";
import { validateFile } from "@/lib/upload-constraints";
import { uploadPhotoToSupabase } from "@/lib/photo-upload";

interface CameraCaptureButtonProps {
  tripId: string;
}

type CaptureStatus = "idle" | "uploading" | "success" | "error";

/**
 * "capture" makes mobile browsers open the camera directly instead of the
 * file/photo picker — this is the whole feature, no native plugin needed.
 * The captured shot uploads immediately on selection (no preview/confirm
 * step of our own), since the OS camera UI already made the user confirm
 * the shot before handing the file back.
 */
export default function CameraCaptureButton({ tripId }: CameraCaptureButtonProps) {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const userId = getCurrentUserId();

  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  let disabledReason: string | null = null;
  if (!configured) disabledReason = "카메라로 추가하려면 Supabase 설정이 필요해요.";
  else if (!userId) disabledReason = "사진을 추가하려면 로그인이 필요해요.";

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId) return;

    const result = validateFile(file);
    if (!result.valid) {
      setStatus("error");
      setErrorMessage(result.message ?? "이 사진은 추가할 수 없어요.");
      return;
    }

    setStatus("uploading");
    setErrorMessage(null);

    try {
      await uploadPhotoToSupabase({ file, tripId, userId });
      setStatus("success");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setErrorMessage("사진을 추가하지 못했어요. 다시 시도해주세요.");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={Boolean(disabledReason) || status === "uploading"}
        title={disabledReason ?? undefined}
        onClick={() => inputRef.current?.click()}
        aria-label="카메라로 바로 촬영해서 추가"
        className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-border bg-card text-lg text-ink transition-opacity hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "uploading" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
        ) : (
          <span aria-hidden>📷</span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleCapture(e)}
      />

      {status === "success" && (
        <div className="absolute top-full right-0 mt-2 whitespace-nowrap rounded-lg bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary">
          사진을 추가했어요
        </div>
      )}
      {status === "error" && errorMessage && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-lg bg-primary/10 px-3 py-1.5 text-xs text-primary">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
