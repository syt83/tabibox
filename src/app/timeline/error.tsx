"use client";

import { useEffect } from "react";

export default function TimelineError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Timeline failed to load:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <p className="text-4xl">🕰️</p>
      <h1 className="mt-3 font-display text-lg font-bold text-ink">Couldn&apos;t load your timeline.</h1>
      <p className="mt-1 text-sm text-subtext">Please try again.</p>

      <button
        onClick={reset}
        className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Try Again
      </button>
    </div>
  );
}
