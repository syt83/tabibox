"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Trip } from "@/types/trip";
import { getDemoTripById } from "@/lib/demo-trips";
import TripDetailView from "@/components/trips/trip-detail-view";
import EmptyState from "@/components/EmptyState";

interface TripDetailFallbackProps {
  id: string;
}

/**
 * The server couldn't find this trip in the mock dataset or Supabase — the
 * last place it could still exist is a Demo Mode trip created via
 * /trip/new, which lives only in this browser's localStorage and is
 * invisible server-side. Checked after mount so server and first client
 * render stay identical; "checked" distinguishes a genuine not-found from
 * the brief window before that check runs.
 */
export default function TripDetailFallback({ id }: TripDetailFallbackProps) {
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrip(getDemoTripById(id) ?? null);
  }, [id]);

  if (trip === undefined) return null;

  if (trip === null) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <EmptyState
          icon="🧳"
          title="見つかりません"
          description={"여행을 찾을 수 없어요.\n삭제되었거나 잘못된 링크일 수 있어요."}
          action={
            <Link href="/" className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
              홈으로
            </Link>
          }
        />
      </div>
    );
  }

  return <TripDetailView trip={trip} photos={[]} photoSource="demo" />;
}
