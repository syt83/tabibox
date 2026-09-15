import { JAPAN_CITIES } from "./japan-cities";

/**
 * Trip/photo city data is stored in English (e.g. "Tokyo") — mock data and
 * whatever a real upload's reverse-geocoding returns. A Korean-speaking
 * user searching "도쿄" would get zero results against that without this:
 * maps common Japanese destination names typed in Korean to the English
 * form actually stored, so search-service.ts can try both. Derived from
 * the same city list /trip/new's picker offers, so the two never drift.
 */
export const CITY_ALIASES_KO_TO_EN: Record<string, string> = Object.fromEntries(
  JAPAN_CITIES.map((city) => [city.ko, city.en.toLowerCase()])
);

/** Returns the query plus a city-translated variant when one applies (same string twice when no alias matches — callers just dedupe via Set semantics if needed). */
export function expandCityAliases(normalizedQuery: string): string[] {
  let translated = normalizedQuery;
  for (const [ko, en] of Object.entries(CITY_ALIASES_KO_TO_EN)) {
    if (translated.includes(ko)) translated = translated.split(ko).join(en);
  }
  return translated === normalizedQuery ? [normalizedQuery] : [normalizedQuery, translated];
}
