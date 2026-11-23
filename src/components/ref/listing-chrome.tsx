"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { categories } from "@/lib/data";
import { pageFrame } from "./page-frame";

/** Search row + popular localities, ported from the reference platform. Localities filter through the URL. */
export function SearchFilters({ localities, selected }: { localities: { name: string; count?: number }[]; selected?: string }) {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (n: number) => scroller.current?.scrollBy({ left: n, behavior: "smooth" });
  const nav = "hidden shrink-0 items-center gap-2 rounded-lg border-0 bg-transparent py-2 text-[14px] font-semibold text-black/60 transition-colors hover:bg-[#f3f5f7] hover:text-black sm:flex";
  return (
    <section className="w-full border-b border-[#e7e7e7] bg-white">
      <div className={`${pageFrame} flex flex-col gap-3 py-3`}>
        <div className="flex items-center gap-3 md:gap-4">
          <button type="button" onClick={() => router.back()} className={`${nav} pr-3 pl-0`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/arrow-nav.svg" alt="" width={24} height={24} className="size-6" />
            <span>Back</span>
          </button>
          <div className="hidden h-[18px] w-px shrink-0 bg-[#d0d0d0] sm:block" />
          <div className="flex h-10 min-w-0 flex-1 items-center justify-between rounded-full border border-[#dbdbdb] bg-white pr-3 pl-4">
            <div className="flex min-w-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/search.svg" alt="" width={15} height={15} className="size-[15px] shrink-0" />
              <span className="truncate text-[14px] leading-[1.2] font-semibold text-black">Patna , Bihar</span>
            </div>
            <Link href="/listing" aria-label="Clear location" className="flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#f3f5f7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/clear.svg" alt="" width={17} height={17} className="size-[17px]" />
            </Link>
          </div>
          <div className="hidden h-[18px] w-px shrink-0 bg-[#d0d0d0] sm:block" />
          <button type="button" onClick={() => router.forward()} className={`${nav} pr-0 pl-3`}>
            <span>Next</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/arrow-nav.svg" alt="" width={24} height={24} className="size-6 rotate-180" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden shrink-0 text-[14px] font-semibold tracking-[0.3px] text-lk md:inline">Popular localities</span>
          <button type="button" onClick={() => scrollBy(-220)} aria-label="Scroll localities left" className="hidden size-7 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] bg-white transition-colors hover:border-[#9a9a9a] md:inline-flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/chevron-left.svg" alt="" width={8} height={8} className="size-2" />
          </button>
          <div ref={scroller} className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5">
            {localities.map((item) => {
              const on = selected === item.name;
              return (
                <Link key={item.name} href={on ? "/listing" : `/listing?locality=${encodeURIComponent(item.name)}`} className={`inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-full border border-solid px-4 text-[13px] leading-none font-medium whitespace-nowrap transition-colors ${on ? "border-lk bg-lk/10 text-[#212121]" : "border-[#dcdcdc] bg-white text-[#3d3d3d] hover:border-lk hover:text-[#212121]"}`}>
                  <span>{item.name}</span>
                  {item.count ? <span className={`inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-solid text-[10px] leading-none font-semibold ${on ? "border-lk bg-lk text-white" : "border-[rgba(33,33,33,0.35)] bg-white text-lk"}`}>{item.count}</span> : null}
                </Link>
              );
            })}
          </div>
          <button type="button" onClick={() => scrollBy(220)} aria-label="Scroll localities right" className="hidden size-7 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] bg-white transition-colors hover:border-[#9a9a9a] md:inline-flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/chevron-right.svg" alt="" width={8} height={8} className="size-2" />
          </button>
          <Link href="/listing" className="hidden shrink-0 rounded-lg py-2 pr-0 pl-3 font-[family-name:var(--font-montserrat)] text-[14px] font-semibold whitespace-nowrap text-lk transition-colors hover:bg-lk/10 md:inline">Reset filters</Link>
        </div>
      </div>
    </section>
  );
}

const CAT_ICON: Record<string, string> = { road: "cat-road", railway: "cat-railway", airport: "cat-airport", mall: "cat-mall", shopping: "cat-shopping", fuel: "cat-fuel" };

/** Category row with the glowing active underline, ported from the reference platform. */
export function CategoryNav({ active = "all", view }: { active?: string; view?: string }) {
  const href = (id: string) => {
    const q = new URLSearchParams();
    if (id !== "all") q.set("category", id);
    if (view && view !== "list") q.set("view", view);
    const s = q.toString();
    return s ? `/listing?${s}` : "/listing";
  };
  return (
    <section className="relative z-20 w-full border-b border-[#e7e7e7] bg-white">
      <div className={`${pageFrame} flex h-14 items-center justify-between gap-2 md:gap-6`}>
        <div className="scrollbar-hide flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto overflow-y-visible md:gap-2">
          {categories.map((c) => {
            const on = active === c.id;
            return (
              <Link key={c.id} href={href(c.id)} aria-current={on ? "page" : undefined} className={`relative flex h-14 shrink-0 items-center gap-2 px-3 text-[14px] leading-none font-semibold whitespace-nowrap transition-colors first:pl-0 md:px-4 md:first:pl-0 ${on ? "text-lk" : "text-[#4a5565] hover:text-[#212121]"}`}>
                {on && (
                  <>
                    <span aria-hidden className="cat-active-glow pointer-events-none absolute inset-x-0 bottom-0 h-[22px]" />
                    <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-lk shadow-[0_0_10px_rgba(16,173,93,0.55)]" />
                  </>
                )}
                {c.id === "all" ? (
                  <>
                    <span className="relative z-[1]">ALL</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/icons/lume-wordmark.png" alt="LUME" width={64} height={13} className={`relative z-[1] h-[13px] w-[64px] object-contain object-left ${on ? "" : "opacity-70 grayscale"}`} />
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/assets/icons/${CAT_ICON[c.id] ?? "cat-road"}.svg`} alt="" width={20} height={20} className={`relative z-[1] size-5 ${on ? "" : "opacity-80"}`} />
                    <span className="relative z-[1]">{c.label}</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
        <Link href="/quote/new" className="inline-flex h-10 shrink-0 items-center rounded-full border border-[#d0d5dd] bg-white px-3 font-[family-name:var(--font-montserrat)] text-[13px] font-semibold whitespace-nowrap text-[#212121] transition-colors hover:bg-[#f8f8f8] md:px-4 md:text-[14px]">
          <span className="sm:hidden">LOKY AI</span>
          <span className="hidden sm:inline">Create Campaign Using LOKY AI</span>
        </Link>
      </div>
    </section>
  );
}
