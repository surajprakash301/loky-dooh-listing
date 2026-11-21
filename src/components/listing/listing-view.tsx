"use client";

import { LayoutGrid, List, Map as MapIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BillboardCardHorizontal, BillboardCardVertical } from "@/components/listing/billboard-card";
import { FiltersSidebar } from "@/components/listing/filters-sidebar";
import { MapExplorer } from "@/components/listing/map-explorer";
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
  const [view, setView] = useState<ViewMode>(initialView);
  const [tier, setTier] = useState<string>("all");

  const changeView = (v: ViewMode) => {
    setView(v);
    const next = new URLSearchParams(params.toString());
    next.set("view", v);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const filtered = tier === "all" ? items : items.filter((b) => b.tier === tier);

  if (view === "map") {
    return (
      <div>
        <div className="mx-auto flex max-w-[1512px] items-center justify-between gap-4 px-8 py-3">
          <div className="min-w-0">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Digital OOH", href: "/listing" }, { label: "Map" }]} />
            <h1 className="mt-1 truncate text-[20px] font-medium">{heading}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <TierChips value={tier} onChange={setTier} />
            <ViewToggle value={view} onChange={changeView} />
          </div>
        </div>
        <MapExplorer items={filtered} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1512px] gap-8 px-8 pt-5 pb-16">
      <FiltersSidebar className="hidden lg:block" />

      <div className="min-w-0 flex-1">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Digital OOH", href: "/listing" },
            { label: crumb },
          ]}
        />
        <h1 className="mt-3 text-[24px] font-medium">{heading}</h1>

        <div className="mt-4 flex items-center justify-between">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((b, i) => (
                <BillboardCardVertical key={`${b.id}-${i}`} b={b} compare={i >= 3 && b.tier === "partner"} />
              ))}
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              {filtered.map((b, i) => (
                <BillboardCardHorizontal key={`${b.id}-${i}`} b={b} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
