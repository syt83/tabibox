import type { Trip } from "@/types/trip";

const MOCK_USER_ID = "user-mock-1";

function cover(id: string): string {
  return `https://picsum.photos/seed/${id}-cover/1200/800`;
}

export const tripSummerJapan2026: Trip = {
  id: "trip-2026-summer-japan",
  userId: MOCK_USER_ID,
  title: "Summer in Japan 2026",
  country: "Japan",
  year: 2026,
  startDate: "2026-08-10",
  endDate: "2026-08-18",
  cities: ["Tokyo", "Kyoto", "Osaka"],
  coverImageUrl: cover("trip-2026-summer-japan"),
  createdAt: "2026-08-20T10:00:00+09:00",
};

export const tripFukuokaWinter2026: Trip = {
  id: "trip-2026-fukuoka-winter",
  userId: MOCK_USER_ID,
  title: "Fukuoka Winter 2026",
  country: "Japan",
  year: 2026,
  startDate: "2026-12-20",
  endDate: "2026-12-24",
  cities: ["Fukuoka"],
  coverImageUrl: cover("trip-2026-fukuoka-winter"),
  createdAt: "2026-12-26T10:00:00+09:00",
};

export const tripTokyoSpring2025: Trip = {
  id: "trip-2025-tokyo-spring",
  userId: MOCK_USER_ID,
  title: "Tokyo Spring 2025",
  country: "Japan",
  year: 2025,
  startDate: "2025-04-10",
  endDate: "2025-04-14",
  cities: ["Tokyo"],
  coverImageUrl: cover("trip-2025-tokyo-spring"),
  createdAt: "2025-04-16T10:00:00+09:00",
};

export const tripOsakaAutumn2025: Trip = {
  id: "trip-2025-osaka-autumn",
  userId: MOCK_USER_ID,
  title: "Osaka Autumn 2025",
  country: "Japan",
  year: 2025,
  startDate: "2025-10-03",
  endDate: "2025-10-08",
  cities: ["Osaka", "Kyoto"],
  coverImageUrl: cover("trip-2025-osaka-autumn"),
  createdAt: "2025-10-10T10:00:00+09:00",
};

export const tripSapporoWinter2025: Trip = {
  id: "trip-2025-sapporo-winter",
  userId: MOCK_USER_ID,
  title: "Sapporo Winter 2025",
  country: "Japan",
  year: 2025,
  startDate: "2025-12-15",
  endDate: "2025-12-19",
  cities: ["Sapporo"],
  coverImageUrl: cover("trip-2025-sapporo-winter"),
  createdAt: "2025-12-21T10:00:00+09:00",
};

export const tripKyotoAutumn2024: Trip = {
  id: "trip-2024-kyoto-autumn",
  userId: MOCK_USER_ID,
  title: "Kyoto Autumn 2024",
  country: "Japan",
  year: 2024,
  startDate: "2024-11-12",
  endDate: "2024-11-17",
  cities: ["Kyoto", "Nara"],
  coverImageUrl: cover("trip-2024-kyoto-autumn"),
  createdAt: "2024-11-19T10:00:00+09:00",
};

export const TRIPS: Trip[] = [
  tripSummerJapan2026,
  tripFukuokaWinter2026,
  tripTokyoSpring2025,
  tripOsakaAutumn2025,
  tripSapporoWinter2025,
  tripKyotoAutumn2024,
];
