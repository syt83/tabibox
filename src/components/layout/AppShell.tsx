import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import SakuraField from "@/components/decor/sakura-field";
import { getSearchDataset } from "@/lib/search-data";

export default async function AppShell({ children }: { children: ReactNode }) {
  const { trips } = await getSearchDataset();
  const sidebarTrips = trips
    .slice()
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((trip) => ({ id: trip.id, title: trip.title }));

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar trips={sidebarTrips} />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="relative isolate flex-1 pb-20 md:pb-0">
          <SakuraField count={18} seed={42} minOpacity={0.05} maxOpacity={0.1} className="-z-10" />
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
