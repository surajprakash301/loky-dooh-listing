"use client";

import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  Grid2x2,
  History,
  Minus,
  PieChart,
  Plus,
  SlidersHorizontal,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { IconTile, OutlineButton, VCard } from "@/components/vendor/ui";
import { currentAds, screens, slotStats, type Screen } from "@/lib/vendor-data";
import { cn } from "@/lib/utils";

const STAT_ICON = { grid: Grid2x2, pie: PieChart, check: CheckCircle2, loop: History } as const;

function LiveBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-v-deep px-2.5 py-1 text-[12px] font-bold text-white",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-white" /> LIVE
    </span>
  );
}

function ScreenCard({ s, onEdit, active }: { s: Screen; onEdit: () => void; active: boolean }) {
  const healthy = s.tone === "green";
  return (
    <VCard className={cn("overflow-hidden", active && "border-v-mint/60")}>
      <div className={cn("flex", active && "bg-v-tint")}>
        <div className="relative h-[196px] w-[216px] shrink-0">
          <Image src={s.image} alt={s.title} fill sizes="216px" className="object-cover" />
          <LiveBadge className="absolute top-4 left-4" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[18px] font-semibold">{s.title}</p>
              <p className="mt-1 text-[14px] text-ink-soft">
                {s.location} • ID: {s.code}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold tracking-wide uppercase">Slot Occupancy</p>
              <p className={cn("text-[22px] font-bold", healthy ? "text-v-green" : "text-v-rust")}>
                {s.used}/{s.total} Fill
              </p>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-wide uppercase">Slot Allocation:</p>
            <div className="flex gap-2">
              {Array.from({ length: s.total }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-3 w-8 rounded-full",
                    i < s.used ? (healthy ? "bg-v-green" : "bg-v-rust") : "bg-[#e5e7eb]",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={cn("flex items-center gap-10 border-t border-v-line px-4 py-4", active && "bg-v-tint")}>
        <div>
          <p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Loop Time</p>
          <p className="text-[20px] font-bold">{s.loop}</p>
        </div>
        {s.activeAds && (
          <div>
            <p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Active Ads</p>
            <p className="text-[20px] font-bold">{s.activeAds}</p>
          </div>
        )}
        {s.alert && (
          <span className="inline-flex h-8 items-center gap-2 self-end rounded-md bg-[#fdecec] px-3 text-[14px] font-semibold text-[#c62828]">
            <AlertCircle className="size-4" /> {s.alert}
          </span>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-md border border-ink/25 bg-v-btn px-5 text-[13px] font-bold tracking-wide uppercase"
        >
          Update Slots <SquarePen className="size-4" />
        </button>
      </div>
    </VCard>
  );
}

function Drawer({ screen, onClose }: { screen: Screen; onClose: () => void }) {
  const [count, setCount] = useState(4);
  return (
    <aside className="w-[440px] shrink-0 self-start rounded-l-2xl border border-v-line bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[26px] font-semibold tracking-tight">Slot Management</h2>
          <p className="mt-1 text-[15px] text-ink-soft">
            Update active ads and loop timing for {screen.title}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-v-panel">
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-v-mint/40 bg-v-tint p-4">
        <p className="text-[11px] font-bold tracking-wide uppercase">Loop Duration (Seconds)</p>
        <div className="mt-3 flex items-center gap-4">
          <span className="relative h-2 flex-1 rounded-full bg-[#dfe6dc]">
            <span className="absolute inset-y-0 left-0 w-[47%] rounded-full bg-[#9ca89a]" />
          </span>
          <span className="text-[18px] font-bold text-v-deep">{screen.loop.split(" ")[0]}s</span>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="relative h-[108px] w-[106px] shrink-0 overflow-hidden rounded-lg">
            <Image src={screen.image} alt="" fill sizes="106px" className="object-cover" />
            <LiveBadge className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px]" />
          </div>
          <div>
            <p className="text-[18px] font-semibold">{screen.title}</p>
            <p className="mt-1 text-[14px] text-ink-soft">
              {screen.location} • ID: {screen.code}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-v-mint/40 bg-v-tint p-5">
        <p className="text-[11px] font-bold tracking-wide uppercase">Loop Duration (Seconds)</p>
        <div className="mt-3 flex items-center gap-4">
          <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label="Decrease" className="text-v-green">
            <Minus className="size-7" strokeWidth={3} />
          </button>
          <span className="flex-1 border-b border-[#b9c7b7] pb-1 text-center text-[36px] font-bold text-v-deep">
            {String(count).padStart(2, "0")}/10
          </span>
          <button type="button" onClick={() => setCount((c) => Math.min(10, c + 1))} aria-label="Increase" className="text-v-green">
            <Plus className="size-7" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[12px] font-bold tracking-wide text-ink-soft uppercase">
          Current Ads ({screen.used}/{screen.total} Slots)
        </p>
        <button type="button" className="flex items-center gap-1 text-[15px] font-semibold text-v-green">
          <Plus className="size-4" strokeWidth={3} /> Add Creative
        </button>
      </div>
      <ul className="mt-3 space-y-3">
        {currentAds.map((a) => (
          <li key={a.title} className="flex items-center gap-4 rounded-xl border border-v-line p-3">
            <Image src={a.thumb} alt="" width={56} height={56} className="size-14 rounded-lg object-cover" />
            <div className="flex-1 leading-tight">
              <p className="text-[15px] font-semibold">{a.title}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{a.meta}</p>
            </div>
            <Eye className="size-5" />
            <Trash2 className="size-5 text-[#c62828]" />
          </li>
        ))}
        <li className="flex items-center gap-4 rounded-xl border border-dashed border-v-line p-3 text-ink-soft">
          <span className="grid size-14 place-items-center rounded-lg bg-v-panel">
            <Plus className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold">Vacant Slot</p>
            <p className="mt-0.5 text-[13px]">Available for immediate booking</p>
          </div>
        </li>
      </ul>

      <button type="button" className="mt-6 h-12 w-full rounded-lg bg-v-green text-[14px] font-bold tracking-wide text-white uppercase">
        Save Configuration
      </button>
      <button type="button" onClick={onClose} className="mt-3 w-full text-[12px] font-bold tracking-wide text-v-rust uppercase">
        Cancel Changes
      </button>
    </aside>
  );
}

export function SlotManagement() {
  const [editing, setEditing] = useState<string | null>(screens[0].id);
  const current = screens.find((s) => s.id === editing);

  return (
    <div className="px-8 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[34px] font-bold tracking-tight">Slot Management</h1>
          <p className="mt-1 text-[17px] text-ink-soft">Optimize your loop timings and ad slots across all network screens.</p>
        </div>
        <div className="flex gap-3">
          <OutlineButton className="h-10 border-0 bg-[#eceeea] text-[14px] font-semibold">
            <SlidersHorizontal className="size-4" /> Filter
          </OutlineButton>
          <OutlineButton className="h-10 border-0 bg-[#eceeea] text-[14px] font-semibold">
            <Download className="size-4" /> Export PDF
          </OutlineButton>
        </div>
      </div>

      <div className={cn("mt-6 flex gap-6", current && "xl:pr-0")}>
        <div className="min-w-0 flex-1">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {slotStats.map((s) => {
              const Icon = STAT_ICON[s.icon as keyof typeof STAT_ICON];
              return (
                <VCard key={s.label} className="p-4">
                  <div className="flex items-center gap-3">
                    <IconTile tone={s.tone === "red" ? "red" : "green"} className="size-9 [&_svg]:size-5">
                      <Icon />
                    </IconTile>
                    <p className="text-[14px] font-bold tracking-wide uppercase">{s.label}</p>
                  </div>
                  <p className="mt-4 text-[36px] leading-none font-bold">{s.value}</p>
                  <p className="mt-3 text-[14px] text-ink-soft">{s.sub}</p>
                </VCard>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold">Active Screen Loops</h2>
            <div className="flex gap-3">
              <OutlineButton className="h-9 px-4 text-[12px] font-bold tracking-wide uppercase">Filter: All Regions</OutlineButton>
              <OutlineButton className="h-9 px-4 text-[12px] font-bold tracking-wide uppercase">Sort: Occupancy</OutlineButton>
            </div>
          </div>

          <div className="mt-4 space-y-5">
            {screens.map((s) => (
              <ScreenCard key={s.id} s={s} active={editing === s.id} onEdit={() => setEditing(s.id)} />
            ))}
          </div>
        </div>

        {current && <Drawer key={current.id} screen={current} onClose={() => setEditing(null)} />}
      </div>
    </div>
  );
}
