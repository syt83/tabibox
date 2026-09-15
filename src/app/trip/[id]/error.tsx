"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TripDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Trip Detail failed to load:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <p className="text-4xl">📷</p>
      <h1 className="mt-3 font-display text-lg font-bold text-ink">Couldn&apos;t load photos.</h1>
      <p className="mt-1 text-sm text-subtext">Please try again.</p>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Try Again
        </button>
        <Link href="/" className="text-sm font-medium text-subtext hover:text-ink">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
