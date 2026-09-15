import { getSearchDataset } from "@/lib/search-data";
import FavoritesPageClient from "./favorites-page-client";

export default async function FavoritesPage() {
  const { trips, photos } = await getSearchDataset();

  return <FavoritesPageClient trips={trips} photos={photos} />;
}
