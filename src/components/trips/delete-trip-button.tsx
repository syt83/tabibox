"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTrip } from "@/lib/trip-mutations";
import DeleteTripDialog from "./delete-trip-dialog";
import type { TripPhotoSource } from "./trip-detail-view";

interface DeleteTripButtonProps {
  tripId: string;
  tripTitle: string;
  photoSource: TripPhotoSource;
}

export default function DeleteTripButton({ tripId, tripTitle, photoSource }: DeleteTripButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Hardcoded mock trips (src/data/trips.ts) aren't a row anywhere — only
  // reachable when Supabase isn't configured at all, and there's nothing
  // to delete them from.
  const canDelete = photoSource !== "mock";

  async function handleConfirm() {
    setDeleting(true);
    setError(undefined);
    const result = await deleteTrip({ id: tripId, isMock: photoSource === "demo" });
    if (!result.success) {
      setDeleting(false);
      setError(result.message ?? "여행을 삭제하지 못했어요.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={!canDelete}
        title={canDelete ? undefined : "데모 모드에서는 이 여행을 삭제할 수 없어요."}
        aria-label="여행 삭제"
        className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        🗑 여행 삭제
      </button>
      {error && <p className="mt-2 text-xs text-primary">{error}</p>}

      {confirmOpen && (
        <DeleteTripDialog
          tripTitle={tripTitle}
          deleting={deleting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void handleConfirm()}
        />
      )}
    </>
  );
}
