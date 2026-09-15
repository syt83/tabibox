import SakuraFlower from "./sakura-icon";

interface SakuraFieldProps {
  count?: number;
  /** Fixed seed so server- and client-rendered output match exactly. */
  seed?: number;
  minOpacity?: number;
  maxOpacity?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

// Deterministic PRNG (Lehmer/Park-Miller) — Math.random() would produce a
// different scatter on the server vs. the client and break hydration.
function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export default function SakuraField({
  count = 12,
  seed = 1,
  minOpacity = 0.08,
  maxOpacity = 0.16,
  minSize = 30,
  maxSize = 60,
  className = "",
}: SakuraFieldProps) {
  const next = seededRandom(seed);
  const petals = Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${(next() * 100).toFixed(2)}%`,
    left: `${(next() * 100).toFixed(2)}%`,
    size: minSize + next() * (maxSize - minSize),
    rotate: Math.round(next() * 360),
    opacity: Number((minOpacity + next() * (maxOpacity - minOpacity)).toFixed(2)),
  }));

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {petals.map((p) => (
        <SakuraFlower
          key={p.id}
          className="absolute"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotate}deg)`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
