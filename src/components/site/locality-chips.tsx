"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { popularLocalities } from "@/lib/data";
import { cn } from "@/lib/utils";

export function LocalityChips({ items = popularLocalities, active }: { items?: { name: string; count?: number }[]; active?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[15px] text-link">Popular localities</span>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-white text-muted-ink/50"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div ref={ref} className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
        {items.map((l) => (
          <Link
            key={l.name}
            href={active === l.name ? "/listing" : `/listing?locality=${encodeURIComponent(l.name)}`}
            className={cn("flex h-8 shrink-0 items-center gap-2 rounded-full border bg-white px-3.5 text-[13px] hover:border-ink/30", active === l.name ? "border-green font-bold text-green" : "border-line text-ink-soft")}
          >
            {l.name}
            {l.count && (
              <span className="grid size-4 place-items-center rounded-full border border-link/40 text-[10px] text-link">
                {l.count}
              </span>
            )}
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="grid size-7 shrink-0 place-items-center rounded-full border border-ink/40 bg-white text-ink"
      >
        <ChevronRight className="size-4" />
      </button>
      <Link href="/listing" className="shrink-0 text-[15px] font-bold text-indigo-brand">
        Reset filters
      </Link>
    </div>
  );
}
