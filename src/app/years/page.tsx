import { getSearchDataset } from "@/lib/search-data";
import { getManualYears } from "@/lib/year-data";
import YearsPageClient from "./years-page-client";

export default async function YearsPage() {
  const [{ trips, photos }, manualYears] = await Promise.all([getSearchDataset(), getManualYears()]);

  return <YearsPageClient trips={trips} photos={photos} manualYears={manualYears} />;
}
