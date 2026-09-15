import type { CSSProperties } from "react";

interface SakuraFlowerProps {
  className?: string;
  style?: CSSProperties;
}

// A single stylized cherry blossom: 5 notched petals around a center stamen.
const PETAL_D =
  "M-18,-8 C-20,-18 -14,-30 -6,-32 L0,-26 L6,-32 C14,-30 20,-18 18,-8 C15,2 8,6 0,4 C-8,6 -15,2 -18,-8 Z";
const PETAL_ANGLES = [0, 72, 144, 216, 288];

export default function SakuraFlower({ className, style }: SakuraFlowerProps) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} style={style} aria-hidden focusable="false">
      <g fill="#f3b8c6">
        {PETAL_ANGLES.map((deg) => (
          <path key={deg} d={PETAL_D} transform={`rotate(${deg})`} />
        ))}
      </g>
      <circle cx="0" cy="0" r="6" fill="#e8935f" />
    </svg>
  );
}
