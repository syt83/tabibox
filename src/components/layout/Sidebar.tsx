"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { getDemoTrips } from "@/lib/demo-trips";

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-ink/70 hover:bg-black/[0.04] hover:text-ink"
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export interface SidebarTrip {
  id: string;
  title: string;
}

interface SidebarProps {
  trips: SidebarTrip[];
}

export default function Sidebar({ trips }: SidebarProps) {
  const pathname = usePathname();
  const [demoTrips, setDemoTrips] = useState<SidebarTrip[]>([]);

  useEffect(() => {
    // Demo Mode trips (created via /trip/new when Supabase isn't
    // configured) live in localStorage — read after mount so server and
    // first client render stay identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDemoTrips(getDemoTrips().map((trip) => ({ id: trip.id, title: trip.title })));
  }, []);

  const allTrips = useMemo(() => [...trips, ...demoTrips], [trips, demoTrips]);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6">
      <Link href="/" className="flex items-center gap-2 px-2 mb-8">
        <span className="text-2xl">📸</span>
        <span className="font-display font-extrabold text-lg tracking-tight">TabiBox</span>
      </Link>

      <nav className="flex flex-col gap-1">
        <NavLink href="/" label="홈" icon="🏠" active={pathname === "/"} />
        <NavLink href="/timeline" label="타임라인" icon="🕰️" active={pathname.startsWith("/timeline")} />
        <NavLink href="/years" label="여행의 기록" icon="🗓️" active={pathname.startsWith("/years") || pathname.startsWith("/year/")} />
        <NavLink href="/search" label="검색" icon="🔍" active={pathname.startsWith("/search")} />
        <NavLink href="/favorites" label="즐겨찾기" icon="♥" active={pathname.startsWith("/favorites")} />
        <NavLink href="/collections" label="컬렉션" icon="🗂️" active={pathname.startsWith("/collections")} />
      </nav>

      <div className="mt-4">
        <Link
          href="/trip/new"
          className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          <span aria-hidden>+</span> 새 여행 추가
        </Link>
      </div>

      {allTrips.length > 0 && (
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-subtext">내 여행</p>
          <div className="flex flex-col gap-1">
            {allTrips.map((trip) => {
              const href = `/trip/${trip.id}`;
              const active = pathname === href;
              return (
                <Link
                  key={trip.id}
                  href={href}
                  title={trip.title}
                  className={clsx(
                    "truncate rounded-xl px-3 py-2 text-sm transition-colors",
                    active ? "bg-primary/10 text-primary font-semibold" : "text-ink/70 hover:bg-black/[0.04] hover:text-ink"
                  )}
                >
                  {trip.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto pt-6">
        <NavLink href="/settings" label="설정" icon="⚙️" active={pathname.startsWith("/settings")} />
      </div>
    </aside>
  );
}
