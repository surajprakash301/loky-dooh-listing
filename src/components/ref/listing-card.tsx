"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { campaign, useCampaign } from "@/lib/campaign-store";
import { type Billboard, TIER_LABEL } from "@/lib/data";
import { formatImpressions } from "@/lib/format";

function MetricBox({ label, children, tone }: { label: string; children: ReactNode; tone: "purple" | "blue" }) {
  const styles = tone === "purple" ? "border-[#6600ae] bg-[rgba(195,106,255,0.1)]" : "border-[#007aae] bg-[rgba(0,122,174,0.1)]";
  return (
    <div className={`flex h-[44px] min-w-0 flex-col justify-between rounded border border-b-2 px-2 py-[5px] ${styles}`}>
      <p className="truncate text-[10px] leading-[1.2] font-bold text-[#777] capitalize">{label}</p>
      <div className="truncate leading-none">{children}</div>
    </div>
  );
}

const CATEGORY_ICON: Record<string, string> = { mall: "/assets/icons/shopping-bag.svg", shopping: "/assets/icons/shopping-bag.svg" };

/** Listing card ported from the reference platform; data comes from our catalogue, the button drives our campaign selection. */
export function ListingCard({ b }: { b: Billboard }) {
  const code = b.code ?? b.id;
  const selected = useCampaign().includes(code);
  const [photo, setPhoto] = useState(0);
  const photos = b.images.length ? b.images : [b.image];
  const tone: "purple" | "blue" = b.tier === "exclusive" ? "purple" : "blue";
  const categoryBorder = tone === "purple" ? "border-[#6600ae] text-[#6600ae]" : "border-[#007aae] text-[#007aae]";
  const techBorder = tone === "purple" ? "border-[#6600ae]" : "border-[#007aae]";
  const size = (b.sizeFt ?? "").replace(" ft", "");
  const slot = b.slotLabel.match(/(\d+)s/)?.[1] ?? "20";
  const chips = [b.sizeFt, b.screenType, b.landmark].filter((c): c is string => !!c);

  return (
    <article className={`flex w-full flex-col gap-4 overflow-hidden rounded-2xl border bg-white p-3.5 transition-[border-color,box-shadow] @min-[600px]:flex-row ${selected ? "border-lk shadow-[inset_0_0_0_1px_#10ad5d,0_0_0_3px_rgba(16,173,93,0.12)]" : "border-[#e0e0e0] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)]"}`}>
      <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-lg @min-[600px]:h-auto @min-[600px]:min-h-[232px] @min-[600px]:w-[268px] @min-[600px]:self-stretch">
        <Link href={`/billboard/${code}`} aria-label={b.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[photo] ?? b.image} alt={b.name} className="absolute inset-0 size-full object-cover" />
        </Link>
        <div className="absolute top-[6px] left-0 flex items-center rounded-r-[50px] border border-white bg-black/50 px-2 py-[2px]">
          <span className="text-[11px] leading-[1.2] text-white">{TIER_LABEL[b.tier]}</span>
        </div>
        {photos.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => setPhoto((c) => (c - 1 + photos.length) % photos.length)} className="absolute top-1/2 left-[4px] flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-[12px] leading-none text-white hover:bg-black/55">‹</button>
            <button type="button" aria-label="Next image" onClick={() => setPhoto((c) => (c + 1) % photos.length)} className="absolute top-1/2 right-[4px] flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-[12px] leading-none text-white hover:bg-black/55">›</button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-[3px]">
              {photos.slice(0, 5).map((_, i) => <span key={i} className={i === photo ? "size-1 rounded-full bg-white" : "size-[3px] rounded-full bg-white/70"} />)}
            </div>
          </>
        )}
      </div>

      <div className="@container flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className={`inline-flex h-[26px] w-fit items-center gap-1 rounded border bg-white px-3 ${b.lokySense ? "border-lk opacity-70" : "border-[#c9c9c9] opacity-60"}`}>
              <span className={`font-anton text-[12px] tracking-[0.24px] ${b.lokySense ? "text-lk" : "text-[#8a8a8a]"}`}>LokySense</span>
              <span className={`font-[family-name:var(--font-montserrat)] text-[12px] tracking-[0.5px] ${b.lokySense ? "text-lk" : "text-[#8a8a8a]"}`}>Enabled</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/info.png" alt="" width={11} height={11} className="size-[11px] opacity-60" />
            </div>
            <div className={`inline-flex h-[26px] w-fit items-center gap-1 rounded border bg-white px-2.5 opacity-70 ${categoryBorder}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CATEGORY_ICON[b.categorySlug ?? ""] ?? "/assets/icons/road-side.svg"} alt="" width={10} height={10} className="size-[10px]" />
              <span className="text-[11px] leading-none font-medium">{b.category}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/info.png" alt="" width={8} height={8} className="size-2 opacity-60" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="truncate text-[16px] leading-[1.2] font-bold text-[#212121] md:text-[18px]">
              <Link href={`/billboard/${code}`} className="hover:text-lk">{b.name} #{code}</Link>
            </h2>
            <div className="flex min-w-0 items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/location.svg" alt="" width={8} height={10} className="h-[10px] w-2" />
              <span className="truncate text-[12px] text-[#64748b]">{b.locality}, {b.city}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className={`inline-flex h-5 max-w-full items-center justify-center truncate rounded border-x-[0.5px] border-b-2 bg-white px-2.5 text-[10px] font-medium whitespace-nowrap text-[#212121] ${techBorder}`}>{chip}</span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 @min-[380px]:grid-cols-[1fr_1fr_1fr_1.45fr]">
            <MetricBox label="screen size" tone={tone}>
              <p className="text-[#212121]"><span className="text-[14px] font-extrabold">{size || "—"}</span><span className="text-[10px] font-medium"> ft</span></p>
            </MetricBox>
            <MetricBox label="Display tech" tone={tone}>
              <span className="text-[14px] font-extrabold text-[#212121]">{b.screenType ?? b.stats.displayTech.value}</span>
            </MetricBox>
            <MetricBox label="Ad’s slots," tone={tone}>
              <p className="text-[14px] font-extrabold text-lk"><span>{slot}</span><span className="text-[10px] font-medium">s</span></p>
            </MetricBox>
            <MetricBox label="daily impression" tone={tone}>
              <p className="text-black"><span className="text-[14px] font-extrabold">{b.reach ? formatImpressions(b.reach) : b.stats.dailyImpression}</span><span className="text-[14px] font-medium">/</span><span className="text-[10px] font-medium">per day.</span></p>
            </MetricBox>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2.5 border-t border-dashed border-[#ececec] pt-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[10px] leading-[1.2] font-semibold tracking-[0.04em] text-lk uppercase">Premium placement rate</p>
            <div className="flex items-end gap-1 whitespace-nowrap">
              <span className="font-[family-name:var(--font-montserrat)] text-[16px] leading-none font-semibold text-[#212121]">₹{b.price.toLocaleString("en-IN")}/</span>
              <span className="text-[11px] leading-none font-medium text-lk">{b.slotLabel}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/info.png" alt="" width={12} height={12} className="mb-px size-3 opacity-60" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Link href={`/billboard/${code}`} className="py-1 text-[12px] font-semibold whitespace-nowrap text-lk underline underline-offset-2">check more details</Link>
            <button
              type="button"
              aria-pressed={selected}
              data-testid={`add-${code}`}
              onClick={() => campaign.toggle(code)}
              className={`inline-flex h-9 min-w-[136px] items-center justify-center rounded-lg border border-t-[0.5px] border-b-[3px] px-4 text-[13px] font-semibold whitespace-nowrap capitalize ${selected ? "border-lk bg-lk/10 text-lk" : "btn-loky-cta border-black/80 text-white"}`}
            >
              {selected ? "In campaign" : "Add to campaign"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
