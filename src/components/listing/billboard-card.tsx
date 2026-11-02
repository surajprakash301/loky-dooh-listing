"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Info, MapPin, Store } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryIcon } from "@/components/site/category-icon";
import { type Billboard, TIER_LABEL, formatINR } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ---------- small building blocks shared by both card layouts ---------- */

function TierBadge({ tier, className }: { tier: Billboard["tier"]; className?: string }) {
  return (
    <span
      className={cn(
        "absolute top-2.5 left-2.5 rounded-full border-[3px] border-white/80 bg-ink px-3 py-1 text-[12px] text-white",
        className,
      )}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

function ImageArrows() {
  return (
    <>
      <span className="absolute top-1/2 left-2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white">
        <ChevronLeft className="size-3.5" />
      </span>
      <span className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white">
        <ChevronRight className="size-3.5" />
      </span>
    </>
  );
}

function Dots() {
  return (
    <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={cn("size-1.5 rounded-full bg-white/60", i === 1 && "bg-white")} />
      ))}
    </span>
  );
}

export function LokySensePill({
  enabled,
  className,
  overlay = false,
}: {
  enabled: boolean;
  className?: string;
  overlay?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md border px-3",
        overlay
          ? "border-transparent bg-black/35 backdrop-blur-[2px]"
          : enabled
            ? "border-green/60 bg-white"
            : "border-line bg-white",
        className,
      )}
    >
      <span
        className={cn("font-anton text-[15px] tracking-wide", enabled ? "text-green" : overlay ? "text-white" : "text-muted-ink/70")}
      >
        LokySense
      </span>
      <span className={cn("text-[14px] tracking-wide", enabled ? "text-green/80" : overlay ? "text-white/80" : "text-muted-ink/60")}>
        Enabled
      </span>
      <Info className={cn("size-3.5", enabled ? "text-green" : overlay ? "text-white/80" : "text-muted-ink/60")} />
    </span>
  );
}

function CategoryPill({ b }: { b: Billboard }) {
  const exclusive = b.tier === "exclusive";
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border bg-white px-2.5 text-[12px]",
        exclusive ? "border-plum/70 text-plum" : "border-sky-tier/60 text-sky-tier",
      )}
    >
      {b.category === "Shopping Complex" ? (
        <Store className="size-3.5" />
      ) : (
        <CategoryIcon icon="road" className="size-3.5" />
      )}
      {b.category}
      <Info className="size-3" />
    </span>
  );
}

function SpecPills({ specs, size = "md" }: { specs: string[]; size?: "sm" | "md" }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {specs.map((s) => (
        <span
          key={s}
          className={cn(
            "pill-3d inline-flex items-center px-3 text-ink",
            size === "md" ? "h-8 text-[13px]" : "h-7 text-[11px]",
          )}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function StatTiles({ b, compact = false }: { b: Billboard; compact?: boolean }) {
  const exclusive = b.tier === "exclusive";
  const tone = exclusive
    ? "border-plum/60 border-b-plum bg-plum-tint"
    : "border-sky-tier/60 border-b-sky-tier bg-sky-tint";
  const { stats } = b;
  const tiles = [
    { label: ["Daily", "Impression"], value: <><b>{stats.dailyImpression}</b><span className="text-[11px]">/per day.</span></> },
    { label: ["Loop", "Time"], value: <><b>{stats.loopTime.m}</b><span className="text-[11px]">m</span> : <b>{stats.loopTime.s}</b><span className="text-[11px]">s</span></> },
    { label: ["Display", "Tech"], value: <><b>{stats.displayTech.value}</b> <span className="text-[11px]">{stats.displayTech.unit}</span></> },
    { label: ["Ad's", "slots,"], value: <span className="font-bold text-green">{stats.adSlots.used}<span className="text-ink">/</span>{stats.adSlots.total}</span> },
  ];
  return (
    <div className={cn("grid gap-2.5", compact ? "grid-cols-4" : "grid-cols-4")}>
      {tiles.map((t) => (
        <div
          key={t.label[0]}
          className={cn(
            "flex rounded-md border border-b-2 px-2 py-1.5",
            tone,
            compact ? "flex-col gap-0.5" : "items-center justify-between gap-2 px-3",
          )}
        >
          <span className={cn("leading-[1.05] text-muted-ink", compact ? "text-[10px]" : "text-[12px]")}>
            {t.label[0]}
            <br />
            {t.label[1]}
          </span>
          <span className={cn("leading-none whitespace-nowrap", compact ? "mt-0.5 text-[14px]" : "text-[18px]")}>
            {t.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PriceBlock({ b, size = "md" }: { b: Billboard; size?: "sm" | "md" }) {
  return (
    <div>
      <p className={cn("font-medium uppercase text-green", size === "md" ? "text-[14px]" : "text-[12px]")}>
        Premium Placement Rate
      </p>
      <p className={cn("flex items-baseline gap-2 leading-none", size === "md" ? "mt-1" : "mt-0.5")}>
        <s className={cn("text-muted-ink", size === "md" ? "text-[17px]" : "text-[13px]")}>{formatINR(b.originalPrice)}</s>
        <span className={cn("font-bold", size === "md" ? "text-[24px]" : "text-[18px]")}>{formatINR(b.price)}/</span>
        <span className={cn("text-green", size === "md" ? "text-[13px]" : "text-[11px]")}>{b.slotLabel}</span>
        <Info className="size-4 self-center text-ink-soft" />
      </p>
    </div>
  );
}

export function GetBestPriceButton({
  className,
  tone = "coral",
}: {
  className?: string;
  tone?: "coral" | "green";
}) {
  return (
    <button
      type="button"
      className={cn(
        "btn-3d rounded-lg px-5 text-[16px] font-medium text-white",
        tone === "coral" ? "bg-coral" : "bg-[#3db55a]",
        className,
      )}
    >
      Get best price
    </button>
  );
}

function Shortlist() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="flex items-center gap-2 text-[14px] text-ink-soft"
    >
      Shortlist
      <Heart className={cn("size-4.5 text-green", on && "fill-green")} />
    </button>
  );
}

/* ---------- horizontal card (list view) ---------- */

export function BillboardCardHorizontal({
  b,
  href = `/billboard/${b.id}`,
  compact = false,
  cta = "coral",
}: {
  b: Billboard;
  href?: string;
  /** smaller type/tiles for the 2-up grid on the home page */
  compact?: boolean;
  cta?: "coral" | "green";
}) {
  return (
    <article className={cn("flex rounded-2xl border border-line bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]", compact ? "gap-4" : "gap-5")}>
      <Link
        href={href}
        className={cn("relative block shrink-0 overflow-hidden rounded-xl", compact ? "h-[232px] w-[240px]" : "h-[232px] w-[290px]")}
      >
        <Image src={b.image} alt={b.name} fill sizes="290px" className="object-cover" />
        <TierBadge tier={b.tier} />
        <ImageArrows />
        <Dots />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col pt-1 pr-1">
        <div className="flex items-start justify-between">
          <div className={cn("flex gap-3", compact ? "flex-col items-start gap-2" : "items-center")}>
            <LokySensePill enabled={b.lokySense} className={cn(compact && "h-8")} />
            <CategoryPill b={b} />
          </div>
          <Shortlist />
        </div>

        <Link
          href={href}
          className={cn("mt-3 block truncate font-bold leading-tight", compact ? "max-w-[300px] text-[17px]" : "max-w-[560px] text-[21px]")}
        >
          {b.name}
        </Link>
        <p className={cn("mt-1 flex items-center gap-1.5 text-muted-ink", compact ? "text-[11px]" : "text-[13px]")}>
          <MapPin className="size-3.5" />
          {b.locality}, {b.city}
        </p>

        <div className="mt-3">
          <SpecPills specs={b.specs} size={compact ? "sm" : "md"} />
        </div>
        <div className="mt-3">
          <StatTiles b={b} compact={compact} />
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <PriceBlock b={b} size={compact ? "sm" : "md"} />
          <GetBestPriceButton tone={cta} className={cn(compact ? "h-10 px-4 text-[14px]" : "h-12")} />
        </div>
      </div>
    </article>
  );
}

/* ---------- vertical card (grid view / home) ---------- */

export function BillboardCardVertical({
  b,
  href = `/billboard/${b.id}`,
  compare = false,
}: {
  b: Billboard;
  href?: string;
  compare?: boolean;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
      <Link href={href} className="relative block h-[224px] w-full overflow-hidden rounded-xl">
        <Image src={b.image} alt={b.name} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
        <TierBadge tier={b.tier} />
        <ImageArrows />
        <LokySensePill enabled={b.lokySense} overlay className="absolute bottom-2 left-2 h-8" />
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <CategoryPill b={b} />
        <div className="flex flex-col items-end gap-1.5">
          <Shortlist />
          {compare && (
            <label className="flex items-center gap-2 text-[13px] text-ink-soft">
              Compare <Checkbox className="size-3.5 rounded-[3px]" />
            </label>
          )}
        </div>
      </div>

      <Link href={href} className="mt-3 block truncate text-[20px] font-bold leading-tight">
        {b.name}
      </Link>
      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-ink">
        <MapPin className="size-3.5" />
        {b.locality}, {b.city}
      </p>

      <div className="mt-3">
        <SpecPills specs={b.specs} size="sm" />
      </div>
      <div className="mt-3">
        <StatTiles b={b} compact />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <PriceBlock b={b} size="sm" />
        <GetBestPriceButton className="h-10 px-4 text-[15px]" />
      </div>
    </article>
  );
}
