import { formatCount } from "@/lib/format-utils";

interface OverallStatsProps {
  photoCount: number;
  tripCount: number;
  yearCount: number;
}

export default function OverallStats({ photoCount, tripCount, yearCount }: OverallStatsProps) {
  const stats: { label: string; value: number; icon: string; tone: string }[] = [
    { label: "사진", value: photoCount, icon: "📷", tone: "bg-primary/15" },
    { label: "여행", value: tripCount, icon: "🧳", tone: "bg-secondary/15" },
    { label: "연도", value: yearCount, icon: "📅", tone: "bg-[#9db3c4]/30" },
  ];

  return (
    <div className="mb-12 md:mb-16 grid grid-cols-3 gap-3 md:gap-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-2xl bg-card px-3 py-4 shadow-sm ring-1 ring-black/[0.03] md:px-5 md:py-5"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base md:h-12 md:w-12 md:text-lg ${stat.tone}`}
            aria-hidden
          >
            {stat.icon}
          </span>
          <div className="min-w-0">
            <div className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold text-ink">
              {formatCount(stat.value)}
            </div>
            <div className="text-xs md:text-sm font-medium text-subtext">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
