/**
 * Preset city picker for /trip/new — free-text city entry let users typo a
 * name or type one search-service.ts doesn't recognize (see
 * city-aliases.ts). English form matches what's stored on Trip.cities and
 * Photo.city throughout the app (mock data, search).
 */
export interface JapanCity {
  en: string;
  ko: string;
}

export const JAPAN_CITIES: JapanCity[] = [
  { en: "Tokyo", ko: "도쿄" },
  { en: "Osaka", ko: "오사카" },
  { en: "Kyoto", ko: "교토" },
  { en: "Fukuoka", ko: "후쿠오카" },
  { en: "Sapporo", ko: "삿포로" },
  { en: "Nara", ko: "나라" },
  { en: "Yokohama", ko: "요코하마" },
  { en: "Kobe", ko: "고베" },
  { en: "Nagoya", ko: "나고야" },
  { en: "Hiroshima", ko: "히로시마" },
  { en: "Okinawa", ko: "오키나와" },
  { en: "Kanazawa", ko: "가나자와" },
  { en: "Nikko", ko: "닛코" },
  { en: "Hakone", ko: "하코네" },
  { en: "Kamakura", ko: "가마쿠라" },
  { en: "Beppu", ko: "벳푸" },
  { en: "Kumamoto", ko: "구마모토" },
  { en: "Sendai", ko: "센다이" },
];
