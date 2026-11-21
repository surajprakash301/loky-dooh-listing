"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ExternalLink, Expand, FileText, MapPin, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AddToCampaignButton } from "@/components/campaign/add-button";
import type { Bounds, MapSite } from "@/components/listing/leaflet-map";
import { useCampaign } from "@/lib/campaign-store";
import { type Billboard, TIER_LABEL, formatINR } from "@/lib/data";
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

const TIER_SHORT: Record<Billboard["tier"], string> = { exclusive: "EXCLUSIVE", partner: "PARTNER", operated: "OPERATED" };

function Chips({ b }: { b: Billboard }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {b.sizeFt && <span className="rounded border border-line bg-white px-1.5 py-0.5">{b.sizeFt}</span>}
      {b.screenType && <span className="rounded border border-line bg-white px-1.5 py-0.5">{b.screenType}</span>}
      <span className="rounded bg-green/10 px-1.5 py-0.5 font-semibold text-green">{b.stats.adSlots.total} slots</span>
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

function Dropdown({ label, value, options, onChange }: { label: string; value: string; options: { id: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="relative inline-flex h-9 items-center rounded-full border border-line bg-white pr-8 pl-4 text-[13px] font-medium">
      <span className="text-ink-soft">{label}</span>
      {value !== "all" && <span className="ml-1 text-ink">· {options.find((o) => o.id === value)?.label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={label}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 size-4 text-ink-soft" />
    </label>
  );
}

/** Live map view: pins for every approved billboard with coordinates; the side panel follows the viewport. */
export function MapExplorer({ items }: { items: Billboard[] }) {
  const selected = useCampaign();
  const located = useMemo(() => items.filter(hasCoords), [items]);
  const [area, setArea] = useState("all");
  const [display, setDisplay] = useState("all");
  const [tier, setTier] = useState("all");
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [fitKey, setFitKey] = useState(0);

  const areas = useMemo(() => Array.from(new Set(located.map((b) => b.locality))).sort(), [located]);
  const displays = useMemo(() => Array.from(new Set(located.map((b) => b.screenType ?? ""))).filter(Boolean).sort(), [located]);
  const filtered = useMemo(
    () => located.filter((b) => (area === "all" || b.locality === area) && (display === "all" || b.screenType === display) && (tier === "all" || b.tier === tier)),
    [located, area, display, tier],
  );
  const sites: MapSite[] = useMemo(() => filtered.map((b) => ({ code: b.code, name: b.name, locality: b.locality, lat: b.lat, lng: b.lng, reach: b.reach ?? 0 })), [filtered]);
  const inView = useMemo(() => {
    const list = bounds ? filtered.filter((b) => b.lat <= bounds.north && b.lat >= bounds.south && b.lng <= bounds.east && b.lng >= bounds.west) : filtered;
    return [...list].sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0));
  }, [filtered, bounds]);
  const activeSite = filtered.find((b) => b.code === active) ?? null;
  const city = located[0]?.city ?? "India";
  const screens = filtered.reduce((n, b) => n + b.stats.adSlots.total, 0);

  return (
    <div className="flex h-[calc(100vh-60px)] min-h-[560px] flex-col bg-page" data-testid="map-explorer">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-4 py-2.5 md:px-6">
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-page px-4 text-[13px] font-medium">
          <MapPin className="size-3.5 text-coral" /> {city} · {filtered.length} site{filtered.length === 1 ? "" : "s"} · {screens} slots
        </span>
        <Dropdown label="Area" value={area} options={[{ id: "all", label: "All areas" }, ...areas.map((a) => ({ id: a, label: a }))]} onChange={setArea} />
        <Dropdown label="Display" value={display} options={[{ id: "all", label: "All displays" }, ...displays.map((d) => ({ id: d, label: d }))]} onChange={setDisplay} />
        <Dropdown label="Partner" value={tier} options={[{ id: "all", label: "All partners" }, { id: "exclusive", label: TIER_LABEL.exclusive }, { id: "partner", label: TIER_LABEL.partner }, { id: "operated", label: TIER_LABEL.operated }]} onChange={setTier} />
        <span className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-line bg-page px-4 text-[13px] font-semibold" data-testid="campaign-count">
          Campaign <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] text-white">{selected.length}</span>
        </span>
        {selected.length > 0 && (
          <Link href="/quote/new" className="btn-3d inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-[13px] font-bold text-ink" data-testid="map-create-quotation">
            <FileText className="size-4" /> Create quotation ({selected.length})
          </Link>
        )}
      </div>

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-[340px] shrink-0 flex-col border-r border-line bg-white md:flex" data-testid="map-panel">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-tight">
                {inView.length} site{inView.length === 1 ? "" : "s"} <span className="font-normal text-ink-soft">in view</span>
              </p>
              <p className="truncate text-[11.5px] text-ink-soft">By daily reach · move the map to filter</p>
            </div>
            <button type="button" onClick={() => setFitKey((k) => k + 1)} className="shrink-0 rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-green whitespace-nowrap hover:border-green hover:bg-green/5">
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
                className={cn("flex cursor-pointer gap-3 border-b border-line px-3 py-3 text-left transition-colors hover:bg-page", active === b.code && "bg-brand/10 shadow-[inset_3px_0_0_#16E17A]")}
                data-testid={`site-${b.code}`}
              >
                <div className="relative h-[76px] w-[88px] shrink-0 overflow-hidden rounded-lg">
                  <Image src={b.image} alt="" fill sizes="84px" className="object-cover" />
                  <span className="absolute bottom-1 left-1 rounded bg-ink/85 px-1 text-[8.5px] font-bold tracking-wide text-white">{TIER_SHORT[b.tier]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-[13px] leading-tight font-bold">{b.name}</p>
                    <span className="shrink-0 text-[11px] font-semibold text-green">{formatImpressions(b.reach ?? 0)}/day</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-ink-soft">{b.locality} · {b.city}</p>
                  <div className="mt-1.5">
                    <Chips b={b} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Price b={b} size="sm" />
                    <div className="flex shrink-0 items-center gap-1.5">
                      <AddToCampaignButton code={b.code} size="sm" labels={["Add", "Added"]} />
                      <Link href={`/billboard/${b.code}`} className="grid size-8 place-items-center rounded-lg border border-line text-ink-soft hover:text-ink" title="View details" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="relative min-w-0 flex-1">
          <LeafletMap sites={sites} selected={selected} active={active} onActive={setActive} onBounds={(b) => setBounds(b)} fitKey={fitKey} focus={focus} />

          <div className="absolute top-3 left-3 z-[500] flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setFitKey((k) => k + 1)} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-medium shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:border-ink/40">
              <Expand className="size-4" /> Show all sites
            </button>
            <div className="flex h-9 items-center gap-3 rounded-full border border-line bg-white px-3 text-[11.5px] shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
            <span className="font-semibold">Map key</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-[#e5484d]" /> Site</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-brand" /> In campaign</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-ink" /> Several sites</span>
            </div>
          </div>

          {activeSite && (
            <div className="anim-pop absolute right-3 bottom-4 z-[500] w-[300px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_40px_rgba(0,0,0,0.25)]" data-testid="site-popup">
              <div className="relative h-[150px]">
                <Image src={activeSite.image} alt={activeSite.name} fill sizes="300px" className="object-cover" />
                <span className="absolute bottom-2 left-2 rounded bg-ink/85 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">{activeSite.locality} corridor</span>
                <button type="button" onClick={() => setActive(null)} className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 text-ink" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-3.5">
                <p className="text-[14px] leading-tight font-bold">{activeSite.name}</p>
                <p className="mt-1 text-[11.5px] text-ink-soft">{activeSite.address ?? `${activeSite.locality}, ${activeSite.city}`}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Chips b={activeSite} />
                  <span className="rounded bg-green/10 px-1.5 py-0.5 text-[11px] font-semibold text-green">{formatImpressions(activeSite.reach ?? 0)}+ daily reach</span>
                </div>
                <div className="mt-3">
                  <Price b={activeSite} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <AddToCampaignButton code={activeSite.code} className="flex-1 justify-center" />
                  <Link href={`/billboard/${activeSite.code}`} className="btn-3d inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-green text-[14px] font-semibold text-white">
                    View details
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
