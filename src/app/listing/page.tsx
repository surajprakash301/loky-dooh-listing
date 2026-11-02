import { Suspense } from "react";
import { ListingView, type ViewMode } from "@/components/listing/listing-view";
import { CategoryTabs } from "@/components/site/category-tabs";
import { LocalityChips } from "@/components/site/locality-chips";
import { SearchBar } from "@/components/site/search-bar";
import { SiteHeader } from "@/components/site/site-header";
import { listPublicBillboards, localityCounts, toCard } from "@/services/catalog";

export const metadata = { title: "All DOOH Billboards — Loky Media" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ListingPage(props: PageProps<"/listing">) {
  const sp = await props.searchParams;
  const raw = one(sp.view);
  const view: ViewMode = raw === "grid" || raw === "map" ? raw : "list";
  const filters = { locality: one(sp.locality), city: one(sp.city), category: one(sp.category), q: one(sp.q) };
  const [rows, localities] = await Promise.all([listPublicBillboards(filters), localityCounts()]);
  const items = rows.map(toCard);
  const where = filters.locality ?? filters.city ?? (rows[0] ? `${rows[0].city}, ${rows[0].state}` : "India");
  const heading = `All DOOH Billboards In ${where}`;

  return (
    <>
      <SiteHeader variant="listing" />

      <div className="bg-page">
        <div className="mx-auto max-w-[1512px] space-y-3 px-8 pt-3 pb-3">
          <SearchBar />
          <LocalityChips items={localities} active={filters.locality} />
        </div>
      </div>

      <div className="border-y border-line bg-white">
        <div className="mx-auto max-w-[1512px] px-8">
          <CategoryTabs ctaStyle={view === "grid" ? "text" : "pill"} active={filters.category ?? "all"} view={view} />
        </div>
      </div>

      <Suspense>
        <ListingView items={items} initialView={view} heading={heading} crumb={`${items.length} billboard${items.length === 1 ? "" : "s"}${filters.locality ? ` in ${filters.locality}` : ""}`} />
      </Suspense>
    </>
  );
}
