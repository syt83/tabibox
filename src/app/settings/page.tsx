import { getSearchDataset } from "@/lib/search-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SettingsPageClient from "./settings-page-client";

export default async function SettingsPage() {
  const { trips, photos } = await getSearchDataset();

  return <SettingsPageClient tripCount={trips.length} photoCount={photos.length} connected={isSupabaseConfigured()} />;
}
