/**
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS or
 * localhost) — testing over a plain-HTTP LAN IP from a phone doesn't
 * qualify, so it's undefined there and throws. Falls back to a manual
 * RFC4122 v4 id built on the always-available `crypto.getRandomValues`.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
