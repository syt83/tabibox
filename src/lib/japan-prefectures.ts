/**
 * All 47 Japanese prefectures with an approximate centroid (their capital
 * city's coordinates, close enough for nearest-center classification). Used
 * to auto-label a photo's 도도부현 from its EXIF GPS coords — no external
 * geocoding API, works offline, good enough for grouping a timeline.
 */
export interface JapanPrefecture {
  en: string;
  ko: string;
  lat: number;
  lng: number;
}

export const JAPAN_PREFECTURES: JapanPrefecture[] = [
  { en: "Hokkaido", ko: "홋카이도", lat: 43.06417, lng: 141.34694 },
  { en: "Aomori", ko: "아오모리", lat: 40.82444, lng: 140.74 },
  { en: "Iwate", ko: "이와테", lat: 39.70361, lng: 141.1525 },
  { en: "Miyagi", ko: "미야기", lat: 38.26889, lng: 140.87194 },
  { en: "Akita", ko: "아키타", lat: 39.71861, lng: 140.1025 },
  { en: "Yamagata", ko: "야마가타", lat: 38.24056, lng: 140.36333 },
  { en: "Fukushima", ko: "후쿠시마", lat: 37.75, lng: 140.46778 },
  { en: "Ibaraki", ko: "이바라키", lat: 36.34139, lng: 140.44667 },
  { en: "Tochigi", ko: "도치기", lat: 36.56583, lng: 139.88361 },
  { en: "Gunma", ko: "군마", lat: 36.39111, lng: 139.06083 },
  { en: "Saitama", ko: "사이타마", lat: 35.85694, lng: 139.64889 },
  { en: "Chiba", ko: "지바", lat: 35.60472, lng: 140.12333 },
  { en: "Tokyo", ko: "도쿄", lat: 35.68944, lng: 139.69167 },
  { en: "Kanagawa", ko: "가나가와", lat: 35.44778, lng: 139.6425 },
  { en: "Niigata", ko: "니가타", lat: 37.90222, lng: 139.02361 },
  { en: "Toyama", ko: "도야마", lat: 36.69528, lng: 137.21139 },
  { en: "Ishikawa", ko: "이시카와", lat: 36.59444, lng: 136.62556 },
  { en: "Fukui", ko: "후쿠이", lat: 36.06528, lng: 136.22194 },
  { en: "Yamanashi", ko: "야마나시", lat: 35.66389, lng: 138.56833 },
  { en: "Nagano", ko: "나가노", lat: 36.65139, lng: 138.18111 },
  { en: "Gifu", ko: "기후", lat: 35.39111, lng: 136.72222 },
  { en: "Shizuoka", ko: "시즈오카", lat: 34.97694, lng: 138.38306 },
  { en: "Aichi", ko: "아이치", lat: 35.18028, lng: 136.90667 },
  { en: "Mie", ko: "미에", lat: 34.73028, lng: 136.50861 },
  { en: "Shiga", ko: "시가", lat: 35.00444, lng: 135.86833 },
  { en: "Kyoto", ko: "교토", lat: 35.02139, lng: 135.75556 },
  { en: "Osaka", ko: "오사카", lat: 34.68639, lng: 135.52 },
  { en: "Hyogo", ko: "효고", lat: 34.69139, lng: 135.18306 },
  { en: "Nara", ko: "나라", lat: 34.68528, lng: 135.83278 },
  { en: "Wakayama", ko: "와카야마", lat: 34.22611, lng: 135.1675 },
  { en: "Tottori", ko: "돗토리", lat: 35.50361, lng: 134.23833 },
  { en: "Shimane", ko: "시마네", lat: 35.47222, lng: 133.05056 },
  { en: "Okayama", ko: "오카야마", lat: 34.66167, lng: 133.935 },
  { en: "Hiroshima", ko: "히로시마", lat: 34.39639, lng: 132.45944 },
  { en: "Yamaguchi", ko: "야마구치", lat: 34.18583, lng: 131.47139 },
  { en: "Tokushima", ko: "도쿠시마", lat: 34.06583, lng: 134.55944 },
  { en: "Kagawa", ko: "가가와", lat: 34.34028, lng: 134.04333 },
  { en: "Ehime", ko: "에히메", lat: 33.84167, lng: 132.76611 },
  { en: "Kochi", ko: "고치", lat: 33.55972, lng: 133.53111 },
  { en: "Fukuoka", ko: "후쿠오카", lat: 33.60639, lng: 130.41806 },
  { en: "Saga", ko: "사가", lat: 33.24944, lng: 130.29889 },
  { en: "Nagasaki", ko: "나가사키", lat: 32.74472, lng: 129.87361 },
  { en: "Kumamoto", ko: "구마모토", lat: 32.78972, lng: 130.74167 },
  { en: "Oita", ko: "오이타", lat: 33.23806, lng: 131.6125 },
  { en: "Miyazaki", ko: "미야자키", lat: 31.91111, lng: 131.42389 },
  { en: "Kagoshima", ko: "가고시마", lat: 31.56028, lng: 130.55806 },
  { en: "Okinawa", ko: "오키나와", lat: 26.2125, lng: 127.68111 },
];

/** Nearest-centroid lookup — fine for labeling/grouping, not survey-grade. */
export function getPrefectureForCoords(latitude: number, longitude: number): JapanPrefecture | undefined {
  let closest: JapanPrefecture | undefined;
  let closestDist = Infinity;

  for (const prefecture of JAPAN_PREFECTURES) {
    const dLat = prefecture.lat - latitude;
    const dLng = prefecture.lng - longitude;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < closestDist) {
      closestDist = dist;
      closest = prefecture;
    }
  }

  return closest;
}
