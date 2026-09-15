import type { Photo } from "@/types/photo";
import type { TimelineMonthGroup } from "@/lib/timeline";
import { formatCount } from "@/lib/format-utils";
import TimelineDay from "./timeline-day";

interface TimelineMonthProps {
  month: TimelineMonthGroup;
  onPhotoClick: (photo: Photo) => void;
}

export default function TimelineMonth({ month, onPhotoClick }: TimelineMonthProps) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-2 border-b border-border pb-2">
        <h2 className="font-display text-lg font-bold text-ink">{month.label}</h2>
        <span className="text-sm text-subtext">사진 {formatCount(month.photoCount)}장</span>
      </div>

      <div className="flex flex-col gap-6">
        {month.days.map((day) => (
          <TimelineDay key={day.key} day={day} onPhotoClick={onPhotoClick} />
        ))}
      </div>
    </section>
  );
}
