export default function TripDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:py-12 animate-pulse">
      <div className="h-4 w-16 rounded bg-border" />
      <div className="mt-4 h-56 md:h-72 w-full rounded-3xl bg-border" />
      <div className="mt-5 h-4 w-2/3 rounded bg-border" />

      <p className="mt-8 text-center text-sm text-subtext">사진을 불러오는 중...</p>
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-border" />
        ))}
      </div>
    </div>
  );
}
