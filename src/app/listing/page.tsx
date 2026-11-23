import { Suspense } from "react";
import { ListingView, type ViewMode } from "@/components/listing/listing-view";
import { CategoryNav, SearchFilters } from "@/components/ref/listing-chrome";
import { CampaignBar } from "@/components/campaign/campaign-bar";
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
  const heading = `All DOOH Billboards In ${where.replace(",", " ,")}`;

  return (
    <>
      <SiteHeader variant="listing" />
      <CampaignBar />

      {view !== "map" && (
        <Suspense>
          <SearchFilters localities={localities} selected={filters.locality} />
          <CategoryNav active={filters.category ?? "all"} view={view} />
        </Suspense>
      )}

      <Suspense>
        <ListingView items={items} initialView={view} heading={heading} crumb={filters.locality ? `${filters.locality}, Patna` : where} />
      </Suspense>
    </>
  );
}
