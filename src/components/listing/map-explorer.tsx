"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Expand, FileText, Info, MapPin, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AddToCampaignButton } from "@/components/campaign/add-button";
import { FilterMenu } from "@/components/listing/filter-menu";
import type { Bounds, MapSite } from "@/components/listing/leaflet-map";
import { useCampaign } from "@/lib/campaign-store";
import { type Billboard, formatINR } from "@/lib/data";
import { formatImpressions } from "@/lib/format";
import { cn } from "@/lib/utils";

const LeafletMap = dynamic(() => import("@/components/listing/leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="grid h-full w-full place-items-center bg-[#eef2ee] text-[14px] text-ink-soft">Loading map…</div>,
});

type Located = Billboard & { lat: number; lng: number; code: string };

function hasCoords(b: Billboard): b is Located {
  return typeof b.lat === "number" && typeof b.lng === "number" && !!b.code;
}

/** Screens at a site, read from names like "( Dual side Screen - 10 )" or "24 screen"; one otherwise. */
export function screenCount(name: string): number {
  const m = name.match(/screen\s*[-–]\s*(\d+)/i) ?? name.match(/(\d+)\s*screens?/i);
  return m ? Math.max(1, Number(m[1])) : 1;
}
const screensLabel = (n: number) => `${n} screen${n === 1 ? "" : "s"}`;

const TIER_SHORT: Record<Billboard["tier"], string> = { exclusive: "EXCLUSIVE", partner: "PARTNER", operated: "OPERATED" };

function Chips({ b }: { b: Billboard }) {
  const n = screenCount(b.name);
  const chip = "inline-flex h-[22px] items-center rounded-md px-2 text-[11px] font-bold whitespace-nowrap";
  return (
    <div className="flex flex-wrap items-center gap-1">
      {b.sizeFt && <span className={cn(chip, "bg-[#f2f4f7] text-[#344054]")}>{b.sizeFt}</span>}
      {b.screenType && <span className={cn(chip, "bg-[#f2f4f7] text-[#344054]")}>{b.screenType}</span>}
      <span className={cn(chip, n > 1 ? "bg-[#fdecea] text-[#b42318]" : "bg-[#f2f4f7] text-[#344054]")}>{screensLabel(n)}</span>
    </div>
  );
}

function Price({ b, size = "md" }: { b: Billboard; size?: "sm" | "md" }) {
  const day = b.perDay ?? (b.perMonth ? Math.round(b.perMonth / 30) : null);
  if (!day && !b.perMonth) return <span className="text-[12px] text-ink-soft">Rates on request</span>;
  if (size === "sm")
    return (
      <span className="text-[14px] font-bold whitespace-nowrap">
        {formatINR(day ?? b.perMonth ?? 0)}
        <span className="text-[10.5px] font-normal text-ink-soft">/{day ? "day" : "mo"} · 20s</span>
      </span>
    );
  return (
    <span className="text-[18px] font-bold">
      {formatINR(day ?? b.perMonth ?? 0)} <span className="text-[11px] font-normal text-ink-soft">{day ? "per day" : "per month"} · 20-second slot</span>
    </span>
  );
}

/** Live map view: pins for every approved billboard with coordinates; the side panel follows the viewport. */
export function MapExplorer({ items }: { items: Billboard[] }) {
  const selected = useCampaign();
  const located = useMemo(() => items.filter(hasCoords), [items]);
  const [area, setArea] = useState<string[]>([]);
  const [display, setDisplay] = useState<string[]>([]);
  const [tier, setTier] = useState<string[]>([]);
  const [size, setSize] = useState<string[]>([]);
  const [keyOpen, setKeyOpen] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [fitKey, setFitKey] = useState(0);

  const areas = useMemo(() => Array.from(new Set(located.map((b) => b.locality))).sort(), [located]);
  const sizes = useMemo(() => Array.from(new Set(located.map((b) => b.sizeFt ?? ""))).filter(Boolean).sort(), [located]);
  const displays = useMemo(() => Array.from(new Set(located.map((b) => b.screenType ?? ""))).filter(Boolean).sort(), [located]);
  const filtered = useMemo(
    () => located.filter((b) => (!area.length || area.includes(b.locality)) && (!display.length || display.includes(b.screenType ?? "")) && (!tier.length || tier.includes(b.tier)) && (!size.length || size.includes(b.sizeFt ?? ""))),
    [located, area, display, tier, size],
  );
  const sites: MapSite[] = useMemo(() => filtered.map((b) => ({ code: b.code, name: b.name, locality: b.locality, lat: b.lat, lng: b.lng, reach: b.reach ?? 0, screens: screenCount(b.name) })), [filtered]);
  const inView = useMemo(() => {
    const list = bounds ? filtered.filter((b) => b.lat <= bounds.north && b.lat >= bounds.south && b.lng <= bounds.east && b.lng >= bounds.west) : filtered;
    return [...list].sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0));
  }, [filtered, bounds]);
  const activeSite = filtered.find((b) => b.code === active) ?? null;
  const city = located[0]?.city ?? "India";
  const screens = filtered.reduce((n, b) => n + screenCount(b.name), 0);
  const screensInView = inView.reduce((n, b) => n + screenCount(b.name), 0);

  return (
    <div className="relative h-[calc(100vh-60px)] min-h-[560px] overflow-hidden bg-[#eef2ee]" data-testid="map-explorer">
      <div className="absolute inset-0">
        <LeafletMap sites={sites} selected={selected} active={active} onActive={setActive} onBounds={(b) => setBounds(b)} fitKey={fitKey} focus={focus} />
      </div>

      {/* floating filter bar */}
      <div className="absolute inset-x-3 top-3 z-[550] flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/95 px-3 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.10)] backdrop-blur">
        <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-page px-4 text-[13px] whitespace-nowrap">
          <MapPin className="size-3.5 text-coral" /> <b>{city}</b> <span className="text-ink-soft">· {filtered.length} site{filtered.length === 1 ? "" : "s"} · {screens} screens</span>
        </span>
        <FilterMenu label="Area" options={areas.map((a) => ({ id: a, label: a, hint: `${located.filter((b) => b.locality === a).length} site${located.filter((b) => b.locality === a).length === 1 ? "" : "s"}` }))} selected={area} onChange={setArea} />
        <FilterMenu label="Display" options={displays.map((d) => ({ id: d, label: d, hint: d === "LED" ? "Large outdoor LED" : d === "LCD" ? "Standee and indoor LCD" : undefined }))} selected={display} onChange={setDisplay} />
        <FilterMenu label="Size" options={sizes.map((d) => ({ id: d, label: d }))} selected={size} onChange={setSize} />
        <FilterMenu label="Partner" options={[{ id: "exclusive", label: "Loky Exclusive", hint: "Owned and run by Loky" }, { id: "partner", label: "Loky Partner", hint: "Verified partner screens" }, { id: "operated", label: "Loky Operated", hint: "Operated by Loky for the owner" }]} selected={tier} onChange={setTier} />
        {area.length + display.length + size.length + tier.length > 0 && (
          <button type="button" onClick={() => { setArea([]); setDisplay([]); setSize([]); setTier([]); }} className="shrink-0 px-2 text-[13px] font-bold whitespace-nowrap text-green hover:underline">
            Clear all
          </button>
        )}
        <Link
          href="/quote/new"
          className={cn("ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-bold whitespace-nowrap", selected.length ? "btn-3d bg-brand text-ink" : "border border-line bg-page text-ink-soft hover:border-ink/30")}
          data-testid="campaign-count"
        >
          {selected.length ? <FileText className="size-4" /> : null}
          {selected.length ? "Create quotation" : "Campaign"}
          <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]", selected.length ? "bg-ink text-white" : "bg-white text-ink")}>{selected.length}</span>
        </Link>
      </div>

      {/* floating site list */}
      <aside aria-label="Screens in this view" className="absolute top-[84px] bottom-3 left-3 z-[500] hidden w-[372px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_rgba(16,24,40,0.10)] lg:flex" data-testid="map-panel">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="text-[15px] leading-tight font-bold">
              {inView.length} site{inView.length === 1 ? "" : "s"} · {screensLabel(screensInView)} <span className="font-semibold text-ink-soft">in view</span>
            </p>
            <p className="truncate text-[11.5px] text-ink-soft">Sorted by daily reach</p>
          </div>
          <button type="button" onClick={() => setFitKey((k) => k + 1)} className="shrink-0 text-[12.5px] font-semibold whitespace-nowrap text-green hover:underline">
            Show all
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {inView.length === 0 && <p className="p-6 text-center text-[13px] text-ink-soft">No billboards in this part of the map. Zoom out or press “Show all”.</p>}
          {inView.map((b) => (
            <div
              key={b.code}
              role="button"
              tabIndex={0}
              onClick={() => {
                setActive(b.code);
                setFocus(b.code);
              }}
              onKeyDown={(e) => e.key === "Enter" && setActive(b.code)}
              className={cn("flex cursor-pointer gap-3 border-b border-line px-3.5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-page", active === b.code && "bg-brand/10 shadow-[inset_3px_0_0_#16E17A]")}
              data-testid={`site-${b.code}`}
            >
              <div className="relative h-[76px] w-[88px] shrink-0 overflow-hidden rounded-lg">
                <Image src={b.image} alt="" fill sizes="88px" className="object-cover" />
                <span className="absolute bottom-1 left-1 rounded bg-ink/85 px-1 text-[8.5px] font-bold tracking-wide text-white">{TIER_SHORT[b.tier]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-[13px] leading-tight font-bold">{b.name}</p>
                  <span className="shrink-0 text-[11px] font-semibold whitespace-nowrap text-ink-soft">{formatImpressions(b.reach ?? 0)}/day</span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-ink-soft">{b.locality} · {b.city}</p>
                <div className="mt-1.5">
                  <Chips b={b} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Price b={b} size="sm" />
                  <div className="flex shrink-0 items-center gap-1.5">
                    <AddToCampaignButton code={b.code} size="sm" labels={["Add", "Added"]} />
                    <Link href={`/billboard/${b.code}`} className="grid size-8 place-items-center rounded-lg border border-line text-ink-soft hover:border-ink/40 hover:text-ink" title="View details" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <button type="button" onClick={() => setFitKey((k) => k + 1)} className="absolute top-[84px] right-3 z-[500] inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-[13px] font-bold whitespace-nowrap shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:border-ink/40">
        <Expand className="size-4" /> Show all sites
      </button>

      {/* map key (collapsed by default, like the reference) */}
      <div className="absolute bottom-3 left-3 z-[500] lg:left-[396px]">
        {keyOpen && (
          <div className="anim-pop mb-2 flex flex-col gap-1.5 rounded-xl border border-line bg-white px-3.5 py-3 text-[12px] shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#e5342b]" /> Site (number = screens there)</span>
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-brand" /> In your campaign</span>
            <span className="flex items-center gap-2"><span className="grid size-4 place-items-center rounded-full border-2 border-white bg-[#e5342b] text-[7px] font-black text-white shadow">14</span> Sites close together, click to zoom</span>
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-ink" /> The site you are looking at</span>
          </div>
        )}
        <button type="button" onClick={() => setKeyOpen((v) => !v)} aria-expanded={keyOpen} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-medium whitespace-nowrap shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:border-ink/40">
          <Info className="size-4" /> Map key
        </button>
      </div>

      {activeSite && (
        <div className="anim-pop absolute right-3 bottom-14 z-[500] w-[340px] max-w-[calc(100%-24px)] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_40px_rgba(16,24,40,0.2)] lg:right-[72px] lg:bottom-4" data-testid="site-popup">
          <div className="relative h-[150px]">
            <Image src={activeSite.image} alt={activeSite.name} fill sizes="300px" className="object-cover" />
            <span className="absolute bottom-2 left-2 rounded bg-ink/85 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">{activeSite.locality} corridor</span>
            <button type="button" onClick={() => setActive(null)} className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 text-ink" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="p-3.5">
            <p className="text-[14px] leading-tight font-bold">{activeSite.name}</p>
            <p className="mt-1 line-clamp-2 text-[11.5px] text-ink-soft">{activeSite.address ?? `${activeSite.locality}, ${activeSite.city}`}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chips b={activeSite} />
              <span className="rounded bg-green/10 px-1.5 py-0.5 text-[11px] font-semibold text-green">{formatImpressions(activeSite.reach ?? 0)} daily reach</span>
            </div>
            <div className="mt-3">
              <Price b={activeSite} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <AddToCampaignButton code={activeSite.code} className="flex-1 justify-center" />
              <Link href={`/billboard/${activeSite.code}`} className="btn-3d inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-green text-[14px] font-semibold whitespace-nowrap text-white">
                View details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
