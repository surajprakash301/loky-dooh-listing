"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MapExplorer } from "@/components/listing/map-explorer";
import { SideMap } from "@/components/listing/side-map";
import { ListingCard } from "@/components/ref/listing-card";
import { pageFrame } from "@/components/ref/page-frame";
import type { Billboard } from "@/lib/data";

export type ViewMode = "list" | "grid" | "map";

const PARTNERS = [
  { id: "all", label: "ALL" },
  { id: "exclusive", label: "Loky Exclusive ✨" },
  { id: "partner", label: "Loky Partner" },
  { id: "operated", label: "Loky Operated" },
];
const VIEWS: { id: ViewMode; label: string; icon: string }[] = [
  { id: "list", label: "List", icon: "view-list" },
  { id: "grid", label: "Grid", icon: "view-grid" },
  { id: "map", label: "Map", icon: "view-map" },
];

/** Listing results in the reference platform's layout: breadcrumb, title, partner pills, view switch, cards + side map. */
export function ListingView({ items, initialView, heading, crumb }: { items: Billboard[]; initialView: ViewMode; heading: string; crumb: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // The view lives in the URL so the header's Map link, the switch, back/forward and refresh all agree.
  const raw = params.get("view");
  const view: ViewMode = raw === "grid" || raw === "map" ? raw : raw === "list" ? "list" : initialView;
  const [partner, setPartner] = useState("all");
  const hrefFor = (v: ViewMode) => {
    const next = new URLSearchParams(params.toString());
    if (v === "list") next.delete("view");
    else next.set("view", v);
    const s = next.toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  if (view === "map") return <MapExplorer items={items} />;
  const visible = partner === "all" ? items : items.filter((b) => b.tier === partner);

  return (
    <main className={`${pageFrame} pt-2.5 pb-8`}>
      <div className="flex w-full flex-col gap-[11px]">
        <p className="truncate text-[12px] leading-[1.2] font-medium text-[rgba(74,85,101,0.6)]">
          <Link href="/" className="hover:text-[#4a5565]">Home</Link>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&gt;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <Link href="/listing" className="hover:text-[#4a5565]">Digital OOH</Link>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&gt;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span className="text-[#4a5565]">{crumb}</span>
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-[22px] leading-[1.2] font-semibold text-[#212121] md:text-[24px]">{heading}</h1>
            <div className="flex flex-wrap items-center gap-2.5">
              {PARTNERS.map((f) => (
                <button key={f.id} type="button" onClick={() => setPartner(f.id)} className={partner === f.id ? "rounded-full border border-t-[0.5px] border-b-[3px] border-[#e0e0e0] bg-lk/10 px-5 py-2 text-[13px] leading-none font-bold whitespace-nowrap text-lk" : "rounded-full border border-[#e0e0e0] bg-white px-5 py-2 text-[13px] leading-none whitespace-nowrap text-[#3d3d3d] transition-colors hover:border-[#bdbdbd]"}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-10 w-full max-w-[270px] overflow-hidden rounded-lg border border-[#e0e0e0] bg-white lg:ml-auto">
            {VIEWS.map((v, i) => (
              <button key={v.id} type="button" onClick={() => router.replace(hrefFor(v.id), { scroll: false })} className={`flex h-full w-1/3 items-center justify-center gap-1.5 text-[14px] ${i > 0 ? "border-l border-[#e0e0e0]" : ""} ${view === v.id ? "border-b-[3px] border-b-lk bg-lk/10 font-semibold text-lk" : "text-[#212121] hover:bg-[#f8f9fb]"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/icons/${v.icon}.svg`} alt="" width={10} height={10} />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-stretch gap-5 xl:flex-row xl:items-start xl:gap-6">
        <section className={view === "grid" ? "grid w-full min-w-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 [&>*]:@container" : "@container flex w-full min-w-0 flex-1 flex-col gap-4"}>
          {visible.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-[#e0e0e0] bg-white px-5 py-10 text-center text-[14px] text-[#64748b]">No screens match these filters. Reset to see every Patna location.</p>
          ) : view === "grid" ? (
            visible.map((b) => <div key={b.id}><ListingCard b={b} /></div>)
          ) : (
            visible.map((b) => <ListingCard key={b.id} b={b} />)
          )}
        </section>
        {visible.length > 0 && <SideMap items={visible} className="h-[300px] w-full shrink-0 xl:sticky xl:top-[88px] xl:h-[min(540px,calc(100vh-7rem))] xl:w-[380px] 2xl:w-[420px]" />}
      </div>
    </main>
  );
}
