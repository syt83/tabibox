"use client";

import { formatCount } from "@/lib/format-utils";

interface SettingsPageClientProps {
  tripCount: number;
  photoCount: number;
  connected: boolean;
}

const LOCAL_STORAGE_KEYS = [
  "tabibox_state_v1",
  "tabibox_recent_searches",
  "tabibox_demo_trips",
  "tabibox_demo_favorites",
  "tabibox_demo_years",
];

export default function SettingsPageClient({ tripCount, photoCount, connected }: SettingsPageClientProps) {
  function resetLocalData() {
    if (typeof window === "undefined") return;
    if (!window.confirm("이 브라우저에 저장된 로컬 데이터를 모두 초기화할까요? (직접 만든 여행, 즐겨찾기, 연도, 검색 기록)")) return;
    LOCAL_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    // Full reload (not router.push) so every reader re-hydrates from cleared storage.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <p className="text-sm font-semibold text-subtext">設定</p>
      <h1 className="mt-1 mb-6 font-display text-2xl font-extrabold tracking-tight text-ink">설정</h1>

      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/[0.03]">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
              connected ? "bg-secondary/15" : "bg-primary/10"
            }`}
            aria-hidden
          >
            {connected ? "☁️" : "🧪"}
          </div>
          <div>
            <div className="font-semibold text-ink">{connected ? "Supabase 연결됨" : "데모 모드"}</div>
            <div className="text-sm text-subtext">
              {connected ? "실제 사진이 저장되고 있어요." : "Supabase 미연결 — 목업 데이터로 둘러보는 중이에요."}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-bg py-3">
            <div className="font-display text-xl font-extrabold text-secondary">{formatCount(tripCount)}</div>
            <div className="text-xs text-subtext">여행</div>
          </div>
          <div className="rounded-xl bg-bg py-3">
            <div className="font-display text-xl font-extrabold text-secondary">{formatCount(photoCount)}</div>
            <div className="text-xs text-subtext">사진</div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/[0.03]">
        <div className="text-sm font-semibold text-ink">TabiBox たびBOX</div>
        <p className="mt-1 text-sm text-subtext">
          일본 여행 사진을 자동으로 정리하고 검색으로 다시 찾는 개인 여행 아카이브입니다.
        </p>
      </div>

      <button
        onClick={resetLocalData}
        className="mt-6 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
      >
        이 브라우저의 로컬 데이터 초기화
      </button>
    </div>
  );
}
