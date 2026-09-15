import type { PhotoCategory } from "@/types/photo";

export const CATEGORY_META: Record<PhotoCategory, { koLabel: string; icon: string }> = {
  food: { koLabel: "음식", icon: "🍜" },
  place: { koLabel: "관광지", icon: "🏯" },
  landscape: { koLabel: "풍경", icon: "🌆" },
  people: { koLabel: "사람", icon: "👤" },
  transport: { koLabel: "교통", icon: "🚃" },
  shopping: { koLabel: "쇼핑", icon: "🛍️" },
  other: { koLabel: "기타", icon: "📷" },
};
