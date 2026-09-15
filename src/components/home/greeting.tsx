"use client";

import { useEffect, useState } from "react";

function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return "좋은 아침이에요";
  if (hour >= 12 && hour < 18) return "안녕하세요";
  return "좋은 저녁이에요";
}

export default function Greeting() {
  // Server and the first client render can't know the visitor's local clock,
  // so both render this neutral fallback; the real greeting swaps in right
  // after mount, avoiding a hydration mismatch.
  const [greeting, setGreeting] = useState("안녕하세요");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return <>{greeting}</>;
}
