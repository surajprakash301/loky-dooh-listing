"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Clock,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { CategoryIcon, LumeMark } from "@/components/site/category-icon";
import { homeCategories, homeCities, stats, trustPoints } from "@/lib/data";
import { cn } from "@/lib/utils";

const TRUST_ICON = { shield: ShieldCheck, clock: Clock, grid: LayoutGrid, play: PlayCircle } as const;

function CategoryPillBar() {
  const [active, setActive] = useState("all");
  return (
    <div className="no-scrollbar mx-auto flex h-14 w-fit max-w-full items-center gap-7 overflow-x-auto rounded-full border border-line bg-white px-3 shadow-[0_6px_24px_rgba(0,0,0,0.12)]">
      {homeCategories.map((c) => {
        const on = c.id === active;
        if (c.icon === "lume") {
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-white"
            >
              <span className="text-[12px] font-bold">ALL</span>
              <LumeMark className="text-[15px] text-brand" />
            </button>
          );
        }
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={cn("flex shrink-0 items-center gap-2 pr-2 text-[14px] text-ink", on && "font-bold text-green")}
          >
            <CategoryIcon icon={c.icon} className="size-4.5" strokeWidth={1.7} />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof MapPin;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-5 py-3", className)}>
      <Icon className="size-4 shrink-0 text-ink-soft" />
      <div className="leading-tight">
        <p className="text-[11px] text-muted-ink">{label}</p>
        <p className="text-[14px] font-bold">{value}</p>
      </div>
    </div>
  );
}

function SearchPanel() {
  return (
    <div className="rounded-[26px] bg-[#f1f1f1] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col overflow-hidden rounded-full bg-[#e6e6e6] md:flex-row md:divide-x md:divide-ink/15">
          <Field icon={MapPin} label="Location" value="Patna, Bihar" className="md:flex-1" />
          <Field icon={CalendarDays} label="campaign start date" value="01, July, 2026" className="md:flex-1" />
          <div className="flex flex-1 items-center justify-between gap-3 px-5 py-3">
            <div className="leading-tight">
              <p className="text-[11px] text-muted-ink">Campaign</p>
              <p className="text-[11px] text-muted-ink">Duration</p>
            </div>
            <p className="text-[14px] font-bold">
              Quarterly <span className="text-[10px] font-normal text-muted-ink underline">(03 Month)</span>
            </p>
            <ChevronDown className="ml-auto size-5" />
          </div>
        </div>
        <span className="hidden h-10 w-px bg-ink/15 lg:block" />
        <Link
          href="/listing"
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#5ecb6f] px-10 text-[16px] font-bold text-white shadow-[0_6px_18px_rgba(94,203,111,0.45)]"
        >
          <MapIcon className="size-5" />
          Explore Screens
        </Link>
      </div>

      <div className="no-scrollbar mt-4 flex items-center gap-3 overflow-x-auto">
        {homeCities.map((c) => (
          <button
            key={c}
            type="button"
            className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 text-[14px] text-ink-soft"
          >
            <Building2 className="size-3.5 text-muted-ink" />
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Geometry follows the Figma frame (scaled to 1512px):
 * hero photo 0–823px, headline at ~268px, category pill bar at 606px,
 * search card at ~709px overlapping the rounded hero bottom, stats at ~920px.
 */
export function HomeHero() {
  return (
    <section className="relative">
      <div className="relative h-[823px] overflow-hidden rounded-b-[40px] bg-[#0d1a2a] text-white">
        <Image
          src="/img/hero.jpg"
          alt="LED billboard on a city high-rise"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_60%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,24,0.6)_0%,rgba(6,12,24,0.25)_40%,rgba(6,12,24,0.7)_100%)]" />
        <div className="relative mx-auto max-w-[1512px] px-10 pt-[268px]">
          <h1 className="font-poppins text-[56px] leading-[1.08] font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            India&apos;s Most Advanced
            <br />
            <span className="text-mint">Digital Billboard Marketplace.</span>
          </h1>
          <p className="mt-5 text-[17px] text-white/90">
            Launch programmatic DOOH campaigns in minutes. Access premium LED inventory across 15+ cities
          </p>
        </div>
      </div>

      {/* floating category bar + search card */}
      <div className="absolute inset-x-0 top-[606px] z-10 mx-auto max-w-[1512px] px-10">
        <CategoryPillBar />
        <div className="mx-auto mt-5 flex max-w-[1180px] items-center justify-between px-5 text-[13px] font-bold">
          <span className="text-white">FIND BILLBOARDS</span>
          <span className="text-white">
            Create Campaign Using{" "}
            <Link href="#" className="text-sky-400 underline">
              LOKY AI
            </Link>{" "}
            ✨
          </span>
        </div>
        <div className="mx-auto mt-2 max-w-[1240px]">
          <SearchPanel />
          <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-4 rounded-b-xl bg-mint-soft px-10 py-3 text-[13px] font-medium md:grid-cols-4">
            {trustPoints.map((t) => {
              const Icon = TRUST_ICON[t.icon as keyof typeof TRUST_ICON];
              return (
                <span key={t.label} className="flex items-center justify-center gap-2">
                  <Icon className="size-4 text-green-deep" />
                  {t.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="mx-auto mt-[150px] grid max-w-[1512px] grid-cols-1 gap-5 px-10 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex h-[118px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
          >
            <div className="flex flex-1 flex-col justify-center bg-[linear-gradient(135deg,#1c3f2a_0%,#2e6f46_100%)] px-5 text-white">
              <p className="font-poppins text-[26px] leading-none font-semibold">{s.value}</p>
              <p className="mt-1 text-[13px] font-bold">{s.label}</p>
              <p className="mt-1 text-[11px] leading-tight text-white/80">{s.body}</p>
            </div>
            <div className="relative w-[46%]">
              <Image src={s.image} alt="" fill sizes="200px" className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
