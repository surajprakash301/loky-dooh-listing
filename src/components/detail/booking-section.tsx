"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { bookingDetails, slots } from "@/lib/data";
import { PACKAGE_LABEL, PACKAGE_MONTHS, type Package } from "@/lib/domain";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PricingRow = { slotSeconds: number; package: Package; listPrice: number; offerPrice: number };

type Pkg = { id: string; name: string; months: number; unit: string; was: string; off?: string; price: string; per: string; disabled?: boolean };

const PKG_ORDER: Package[] = ["day", "month", "quarter", "half_year", "year"];
const inr = (n: number) => formatINR(n, { space: true });

/** Builds the five package cards for one slot length from the billboard's pricing rows. */
function packagesFor(pricing: PricingRow[], slot: number): Pkg[] {
  return PKG_ORDER.map((pkg) => {
    const row = pricing.find((p) => p.slotSeconds === slot && p.package === pkg);
    const day = pkg === "day";
    if (!row) return { id: pkg, name: day ? "COMING SOON" : PACKAGE_LABEL[pkg], months: PACKAGE_MONTHS[pkg], unit: day ? "Day" : "Months", was: "", price: "—", per: "", disabled: true };
    const off = row.listPrice > row.offerPrice ? `${Math.round((1 - row.offerPrice / row.listPrice) * 100)}% Off` : undefined;
    return { id: pkg, name: PACKAGE_LABEL[pkg], months: PACKAGE_MONTHS[pkg], unit: day ? "Day" : "Months", was: `${inr(row.listPrice)}${day ? "/Per Day" : "/Month"}`, off, price: inr(row.offerPrice), per: day ? "/Per Day" : "/Month" };
  });
}

const STEPS = [
  { n: 1, label: "Choose Your Ad Format\n& Durations" },
  { n: 2, label: "Select Your Start & End\nDate Of Your Campaign" },
  { n: 3, label: "Upload Ads\nCreative" },
];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-center gap-6 border-b border-line px-6 py-4">
      {STEPS.map((s, i) => {
        const active = s.n === current;
        return (
          <li key={s.n} className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "relative pb-1 text-[14px] whitespace-nowrap",
                  active ? "font-bold text-green" : "text-muted-ink",
                )}
              >
                Step&nbsp;&nbsp;{s.n}
                {active && <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-green" />}
              </span>
              <span className={cn("h-7 w-px", active ? "bg-ink/40" : "bg-line")} />
              <span
                className={cn(
                  "text-[11px] leading-tight whitespace-pre-line",
                  active ? "font-bold text-ink" : "text-muted-ink",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className="h-0 w-40 border-t-2 border-dashed"
                style={{ borderColor: i === 0 ? "#d9c23a" : "#7fbf3a" }}
              />
            )}
          </li>
        );
      })}
      <span className="h-7 w-px bg-line" />
    </ol>
  );
}

function SlotPicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-[13px] text-coral">Step 01</p>
      <h3 className="mt-1 text-[24px] font-bold leading-tight">Book Your Ad Slot Now!</h3>
      <p className="text-[13px] text-muted-ink">Choose Your slot for your video ads on loky LUME billboards</p>

      <div role="radiogroup" className="mt-6 space-y-4">
        {slots.map((s) => {
          const selected = value === s.seconds;
          return (
            <button
              key={s.seconds}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(s.seconds)}
              className={cn(
                "relative flex w-full items-end justify-between rounded-xl border px-5 py-4 text-left transition-colors",
                selected
                  ? "border-brand border-b-[6px] bg-[#111] text-white"
                  : "border-line bg-white text-ink hover:border-ink/30",
              )}
            >
              <span>
                <span className="block text-[64px] leading-[0.9] font-thin tracking-tight">{s.seconds}</span>
                <span className="mt-1 block text-[22px]">sec. slot</span>
              </span>
              <span className="text-right text-[22px] leading-tight whitespace-pre-line">{s.label}</span>
              <span
                className={cn(
                  "absolute top-4 right-4 grid size-5 place-items-center rounded-full border",
                  selected ? "border-brand" : "border-line",
                )}
              >
                {selected && <span className="size-3 rounded-full bg-brand" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PreviewPanel({ image }: { image: string }) {
  return (
    <div className="grid-dark relative overflow-hidden rounded-t-2xl p-7 text-white md:grid md:grid-cols-[260px_1fr] md:gap-6">
      <div>
        <h3 className="text-[24px] font-bold leading-tight">
          Book this loaction
          <br />
          for advertisement
        </h3>
        <p className="mt-5 text-[14px]">Details :</p>
        <ul className="mt-2 space-y-2 text-[14px]">
          {bookingDetails.map((it) => (
            <li key={it.text} className="flex items-center gap-2">
              <span className="w-8 text-[12px]">{it.icon}</span>
              {it.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative mt-6 md:mt-0">
        <div className="relative aspect-[1.85] overflow-hidden rounded-xl border-[6px] border-[#2b2b2b] shadow-[0_0_0_2px_#3a3a3a]">
          <Image src={image} alt="Billboard preview" fill sizes="700px" className="object-cover" unoptimized={image.startsWith("/api/")} />
        </div>
        {/* billboard legs */}
        <div className="mx-auto flex w-[60%] justify-between">
          <span className="h-10 w-10 bg-[linear-gradient(90deg,#1a1a1a,#333,#1a1a1a)]" />
          <span className="h-10 w-10 bg-[linear-gradient(90deg,#1a1a1a,#333,#1a1a1a)]" />
        </div>
      </div>
    </div>
  );
}

function Packages({
  slot,
  value,
  onChange,
  packages,
}: {
  slot: number | null;
  value: string | null;
  onChange: (v: string) => void;
  packages: Pkg[];
}) {
  return (
    <div className="rounded-b-2xl bg-white p-6">
      <h3 className="text-[24px] font-bold">Package Pricing As For {slot ?? 20} Sec Slot</h3>
      <div role="radiogroup" className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {packages.map((p) => {
          const selected = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={p.disabled}
              onClick={() => onChange(p.id)}
              className={cn(
                "rounded-lg border p-3 text-left",
                p.disabled
                  ? "border-line bg-page text-muted-ink"
                  : selected
                    ? "border-green bg-[#f6fff8] shadow-[0_0_0_1px_#2bb24c]"
                    : "border-line bg-white hover:border-ink/30",
              )}
            >
              <div className="flex items-center gap-2 text-[12px]">
                {p.disabled ? (
                  <span className="w-full text-center font-bold tracking-wide text-[#e08a1e]">{p.name}</span>
                ) : (
                  <>
                    <span className={cn("grid size-4 place-items-center rounded-full border", selected ? "border-green" : "border-line")}>
                      {selected && <span className="size-2.5 rounded-full bg-green" />}
                    </span>
                    <span className="font-medium text-[#2f5fb3]">{p.name}</span>
                  </>
                )}
              </div>
              <p className="mt-3 flex items-baseline gap-1 leading-none">
                <span className="text-[34px] font-bold">{p.months}</span>
                <span className="text-[18px]">{p.unit}</span>
              </p>
              <p className="mt-3 flex items-center gap-2 text-[11px]">
                <s>{p.was}</s>
                {p.off && <span className="rounded-sm bg-[#d7f5c9] px-1 text-[11px] text-green">{p.off}</span>}
              </p>
              <p className={cn("mt-1 leading-none", p.disabled ? "text-muted-ink" : "text-green")}>
                <span className="text-[22px] font-bold">{p.price}</span>
                <span className="text-[12px]">{p.per}</span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingSection({ pricing, previewImage, code }: { pricing: PricingRow[]; previewImage: string; code: string }) {
  const [slot, setSlot] = useState<number | null>(20);
  const [pkg, setPkg] = useState<string | null>(null);
  const packages = packagesFor(pricing, slot ?? 20);
  const selectedPkg = packages.find((p) => p.id === pkg && !p.disabled);
  const days = selectedPkg ? (selectedPkg.id === "day" ? 1 : selectedPkg.months * 30) : null;

  return (
    <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[22px] font-bold">Book this loaction for advertisement</h2>
        <div className="flex items-center gap-3">
          <span className="flex h-10 items-center rounded-full border-2 border-brand bg-ink px-6 text-[14px] font-bold text-white">
            Booking
          </span>
          <Link href="#" className="flex h-10 items-center rounded-full border border-ink/50 bg-white px-5 text-[13px] font-bold">
            Create Campaign Using&nbsp;<span className="underline">LOKY AI</span>
          </Link>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-line">
        <Stepper current={1} />

        <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
          <SlotPicker value={slot} onChange={setSlot} />

          <div className="overflow-hidden rounded-2xl border border-line shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <PreviewPanel image={previewImage} />
            <Packages slot={slot} value={pkg} onChange={setPkg} packages={packages} />
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-page px-6 py-3">
              <p className="flex items-center gap-4 text-[15px]">
                <span className="font-bold">YOU SELECTED</span>
                <span className="text-ink-soft">
                  {slot ? slot : "__"} Sec. Slot
                </span>
                <span className="h-5 w-px bg-ink/40" />
                <span className="text-ink-soft">
                  {selectedPkg ? selectedPkg.months : "__"} {selectedPkg?.id === "day" ? "Day" : "Months"} ( {days ?? "__"} Days)
                </span>
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(`/billboard/${code}`)}`}
                className="flex h-11 items-center gap-1 rounded-full bg-coral px-6 text-[15px] font-bold text-white shadow-[0_2px_6px_rgba(255,107,71,0.4)]"
                title="Sign in to request this booking"
              >
                Confirm Your Booking
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
