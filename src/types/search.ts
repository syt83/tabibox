export type SearchTab = "all" | "trips" | "photos";

export interface SearchFilters {
  year?: number;
  city?: string;
  favorite?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export const EMPTY_SEARCH_FILTERS: SearchFilters = {};

export function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.year !== undefined ||
    filters.city !== undefined ||
    filters.favorite !== undefined ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined
  );
}
