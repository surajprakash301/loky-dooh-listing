"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Expand } from "lucide-react";
import { useMemo } from "react";
import type { MapSite } from "@/components/listing/leaflet-map";
import { screenCount } from "@/components/listing/map-explorer";
import { useCampaign } from "@/lib/campaign-store";
import type { Billboard } from "@/lib/data";
import { cn } from "@/lib/utils";

const LeafletMap = dynamic(() => import("@/components/listing/leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="grid h-full w-full place-items-center bg-[#eef2ee] text-[13px] text-ink-soft">Loading map…</div>,
});

/** Small sticky map beside the list: the same pins as the map page; a pin opens that billboard. */
export function SideMap({ items, className }: { items: Billboard[]; className?: string }) {
  const router = useRouter();
  const selected = useCampaign();
  const sites: MapSite[] = useMemo(
    () => items.flatMap((b) => (typeof b.lat === "number" && typeof b.lng === "number" && b.code ? [{ code: b.code, name: b.name, locality: b.locality, lat: b.lat, lng: b.lng, reach: b.reach ?? 0, screens: screenCount(b.name) }] : [])),
    [items],
  );
  if (sites.length === 0) return null;
  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]", className)} data-testid="side-map">
      <LeafletMap sites={sites} selected={selected} active={null} onActive={(code) => code && router.push(`/billboard/${code}`)} onBounds={() => {}} fitKey={sites.length} focus={null} floatingPanel={false} />
      <Link href="/listing?view=map" className="absolute top-3 right-3 z-[500] inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12px] font-bold whitespace-nowrap shadow-[0_4px_12px_rgba(16,24,40,0.12)] hover:border-ink/40">
        <Expand className="size-3.5" /> Open full map
      </Link>
    </div>
  );
}
