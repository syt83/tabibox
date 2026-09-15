"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Trip } from "@/types/trip";
import { formatCount, formatTripDateRange } from "@/lib/format-utils";

export interface TripOption {
  trip: Trip;
  photoCount: number;
}

interface AddPhotoCtaProps {
  trips: TripOption[];
}

const BUTTON_CLASS =
  "mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-primary-dark";

export default function AddPhotoCta({ trips }: AddPhotoCtaProps) {
  const [open, setOpen] = useState(false);

  if (trips.length === 0) return null;

  // Only one trip exists — skip the picker and go straight there.
  if (trips.length === 1) {
    return (
      <Link href={`/trip/${trips[0].trip.id}`} className={BUTTON_CLASS}>
        <span aria-hidden>+</span> 사진 추가
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={BUTTON_CLASS}>
        <span aria-hidden>+</span> 사진 추가
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center"
            onClick={() => setOpen(false)}
          >
            <div
              className="max-h-[70vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-card p-5 shadow-2xl md:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-subtext">旅を選ぶ</p>
                  <h2 className="font-display text-lg font-bold text-ink">어느 여행에 추가할까요?</h2>
                </div>
                <button onClick={() => setOpen(false)} aria-label="닫기" className="text-subtext hover:text-ink">
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {trips.map(({ trip, photoCount }) => (
                  <Link
                    key={trip.id}
                    href={`/trip/${trip.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-black/[0.04]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{trip.title}</p>
                      <p className="truncate text-xs text-subtext">
                        {trip.cities.join(" · ")} · {formatTripDateRange(trip.startDate, trip.endDate)}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs font-semibold text-secondary">
                      {formatCount(photoCount)}장
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
