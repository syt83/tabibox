import Image from "next/image";
import type { Photo } from "@/types/photo";
import Greeting from "./greeting";
import AddPhotoCta, { type TripOption } from "./add-photo-cta";
import SakuraField from "@/components/decor/sakura-field";

interface HomeHeroProps {
  trips: TripOption[];
  collagePhotos: Photo[];
}

const COLLAGE_TILE_CLASS = [
  "absolute left-0 top-2 h-48 w-36 rotate-[-6deg] overflow-hidden rounded-2xl shadow-xl ring-4 ring-card",
  "absolute right-2 top-8 h-52 w-40 rotate-[8deg] overflow-hidden rounded-2xl shadow-xl ring-4 ring-card",
  "absolute left-10 bottom-0 h-40 w-36 rotate-[-10deg] overflow-hidden rounded-2xl shadow-xl ring-4 ring-card",
];

export default function HomeHero({ trips, collagePhotos }: HomeHeroProps) {
  const tiles = collagePhotos.slice(0, 3);

  return (
    <div className="relative isolate mb-10 md:mb-14 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card px-6 py-8 md:px-10 md:py-12">
      <SakuraField count={5} seed={3} minOpacity={0.5} maxOpacity={0.8} minSize={46} maxSize={84} className="-z-10" />

      <div className="flex flex-col md:flex-row md:items-center md:gap-12">
        <div className="flex-1">
          <span className="inline-flex items-center rounded-full bg-secondary px-3.5 py-1.5 text-xs font-bold text-white">
            旅の記録
          </span>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-ink">
            나의 일본 여행 기록
          </h1>
          <p className="mt-3 max-w-md text-sm md:text-base text-subtext">
            <Greeting />. 다시 일본으로 떠나볼까요?
          </p>

          <AddPhotoCta trips={trips} />
        </div>

        {tiles.length > 0 && (
          <div className="relative mt-10 hidden h-64 w-full shrink-0 md:mt-0 md:block md:h-72 md:w-72">
            {tiles.map((photo, i) => (
              <div key={photo.id} className={COLLAGE_TILE_CLASS[i]}>
                <Image
                  src={photo.thumbnailUrl ?? photo.imageUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="200px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
