"use client";

import { LayoutGrid, List, Map as MapIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BillboardCardHorizontal, BillboardCardVertical } from "@/components/listing/billboard-card";
import { MapExplorer } from "@/components/listing/map-explorer";
import { SideMap } from "@/components/listing/side-map";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { type Billboard, tierFilters } from "@/lib/data";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "grid" | "map";

const VIEWS: { id: ViewMode; label: string; icon: typeof List }[] = [
  { id: "list", label: "List", icon: List },
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "map", label: "Map", icon: MapIcon },
];

export function TierChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {tierFilters.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "h-8 rounded-full border px-4 text-[13px] whitespace-nowrap transition-colors",
              active
                ? "border-line bg-[#f3f3f3] font-bold text-green shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                : "border-line bg-white text-ink-soft hover:border-ink/30",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-line bg-white text-[14px]">
      {VIEWS.map((v, i) => {
        const active = v.id === value;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v.id)}
            className={cn(
              "flex h-9 items-center gap-2 px-4",
              i > 0 && "border-l border-line",
              active ? "bg-[#f1f1f1] text-green" : "text-ink hover:bg-page",
            )}
          >
            <v.icon className="size-4" />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

export function ListingView({ items, initialView, heading, crumb }: { items: Billboard[]; initialView: ViewMode; heading: string; crumb: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // The view lives in the URL (?view=list|grid|map) so the header's "Map" link, the toggle, back/forward
  // and a refresh all agree; local state would freeze the first render's view on client navigations.
  const raw = params.get("view");
  const view: ViewMode = raw === "grid" || raw === "map" ? raw : raw === "list" ? "list" : initialView;
  const [tier, setTier] = useState<string>("all");

  const changeView = (v: ViewMode) => {
    const next = new URLSearchParams(params.toString());
    next.set("view", v);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const filtered = tier === "all" ? items : items.filter((b) => b.tier === tier);

  if (view === "map") return <MapExplorer items={items} />;

  return (
    <div className="mx-auto max-w-[1512px] px-8 pt-4 pb-16">

      <div className="min-w-0 flex-1">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Digital OOH", href: "/listing" },
            { label: crumb },
          ]}
        />
        <h1 className="mt-2 text-[22px] font-medium">{heading}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <TierChips value={tier} onChange={setTier} />
          <ViewToggle value={view} onChange={changeView} />
        </div>

        <div className="mt-5">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-muted-ink">
              No billboards match these filters yet.
            </div>
          )}
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((b, i) => (
                <BillboardCardVertical key={`${b.id}-${i}`} b={b} compare={i >= 3 && b.tier === "partner"} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-stretch gap-6 min-[1440px]:flex-row min-[1440px]:items-start">
              <div className="flex min-w-0 flex-1 flex-col gap-5">
                {filtered.map((b, i) => (
                  <BillboardCardHorizontal key={`${b.id}-${i}`} b={b} />
                ))}
              </div>
              {filtered.length > 0 && <SideMap items={filtered} className="hidden h-[min(560px,calc(100vh-2rem))] w-[380px] shrink-0 min-[1440px]:sticky min-[1440px]:top-4 min-[1440px]:block min-[1680px]:w-[420px]" />}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
