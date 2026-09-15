"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const ITEMS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/timeline", label: "타임라인", icon: "🕰️" },
  { href: "/search", label: "검색", icon: "🔍" },
  { href: "/trip/new", label: "추가", icon: "➕" },
  { href: "/collections", label: "컬렉션", icon: "🗂️" },
  { href: "/settings", label: "프로필", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="flex items-stretch px-1 py-2">
        {ITEMS.map((item) => {
          // Exact match for "/" and "/trip/new" — a prefix match on "/trip"
          // would also light up while viewing any /trip/[id] detail page.
          const active =
            item.href === "/" || item.href === "/trip/new"
              ? pathname === item.href
              : pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 text-[10px] font-medium",
                active ? "text-primary" : "text-subtext"
              )}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="w-full truncate text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
