"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Map as MapIcon, Play } from "lucide-react";
import { useState } from "react";
import { BillboardCardHorizontal } from "@/components/listing/billboard-card";
import { TierChips } from "@/components/listing/listing-view";
import { CategoryIcon } from "@/components/site/category-icon";
import { Logo } from "@/components/site/logo";
import { type Billboard, lumeNetwork, steps } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ---------------- Transform ---------------- */

export function TransformSection() {
  return (
    <section className="relative mx-auto mt-24 max-w-[1512px] overflow-hidden px-10">
      <Image
        src="/img/asterisk.png"
        alt=""
        width={300}
        height={466}
        className="pointer-events-none absolute -top-10 right-0 w-[240px] opacity-80"
      />
      <h2 className="font-anton text-[52px] leading-[0.95] uppercase">
        Check Out Our New
        <br />
        <span className="text-[#4caf5f]">Transform</span>
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
        <p className="font-urbanist text-[17px] leading-snug font-extrabold uppercase">
          We&apos;re <span className="text-[#4caf5f]">transforming outdoor advertising</span> with innovation and simplicity.
        </p>
        <div className="relative h-[460px] overflow-hidden rounded-[32px] rounded-tr-none">
          <Image src="/img/transform.jpg" alt="Loky Media billboard on a mall facade" fill sizes="1100px" className="object-cover" />
          <div className="absolute inset-y-0 right-0 w-[72px] bg-[linear-gradient(180deg,#2e9a5a,#0f3d24)]" />
          <button type="button" className="absolute bottom-8 left-14 flex flex-col items-start gap-3 text-white">
            <span className="grid size-14 place-items-center rounded-full bg-white/85 text-[#4caf5f]">
              <Play className="size-6 fill-current" />
            </span>
            <span className="font-mono text-[13px] underline underline-offset-4">Play Video</span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_560px]">
        <div>
          <p className="font-urbanist max-w-[720px] text-[22px] leading-snug font-bold">
            Loky Media Is India&apos;s First Digital DOOH (Digital Out-Of-Home) Platform, Designed For Brands That Demand
            Visibility And Impact. With Cutting-Edge Digital Screens Placed In High-Traffic Urban Locations,
          </p>
          <Link
            href="#"
            className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-[#62c974] px-9 text-[13px] font-extrabold tracking-wide text-[#0d3b1f]"
          >
            KNOW MORE ABOUT LOKY MEDIA
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="text-right">
          <p className="font-urbanist text-[18px] leading-tight font-extrabold uppercase">
            Single-Stop Platform To
            <br />
            <span className="text-[#4caf5f]">Book, Manage, And Monitor Screens.</span>
          </p>
          <p className="font-urbanist mt-5 text-[14px] leading-relaxed text-ink-soft">
            Loky Media Is India&apos;s First Digital DOOH (Digital Out-Of-Home) Platform, Designed For Brands That Demand
            Visibility And Impact. With Cutting-Edge Digital Screens Placed In High-Traffic Urban Locations,
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- LUME network ---------------- */

export function LumeNetworkSection() {
  const [page, setPage] = useState(0);
  return (
    <section className="mt-20 bg-[radial-gradient(ellipse_at_10%_10%,#1d3a24_0%,#060a07_45%,#0b0a05_100%)] py-16 text-white">
      <div className="mx-auto max-w-[1512px] px-10">
        <h2 className="font-anton text-center text-[54px] leading-none">
          Reach Millions Through Our <span className="text-[#5fd57c]">LUME Network</span>
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {lumeNetwork.map((c) => (
            <article key={c.n} className="flex flex-col rounded-2xl border border-white/15 bg-black/80 p-4">
              <div className="flex items-center gap-3 border-b border-white/15 pb-3">
                <span className="font-mono text-[18px] font-bold">{c.n}</span>
                <span className="h-5 w-px bg-white/30" />
                <CategoryIcon icon={c.icon} className="size-4" />
                <span className="text-[13px]">{c.title}</span>
              </div>
              <div className="relative mt-4 h-[200px] overflow-hidden rounded-lg">
                <Image src={c.image} alt={c.title} fill sizes="400px" className="object-cover" />
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-x-2 gap-y-2.5 text-[12px] text-white/90">
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className={cn("mt-6 text-[13px] leading-snug text-white/85", c.italic && "italic")}>{c.body}</p>
              <Link href="/listing" className="mt-6 flex items-center gap-2 text-[12px] font-medium tracking-wide">
                EXPLORE MORE <ArrowRight className="size-3.5" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="grid size-11 place-items-center rounded-full border border-white/40"
            aria-label="Previous"
          >
            <ArrowLeft className="size-4" />
          </button>
          <span className="h-px flex-1 bg-white/20" />
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1 w-16 rounded-full", i === page ? "bg-white" : "bg-white/25")} />
            ))}
          </div>
          <span className="h-px flex-1 bg-white/20" />
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(3, p + 1))}
            className="grid size-11 place-items-center rounded-full border border-white/40"
            aria-label="Next"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Top DOOH billboards ---------------- */

export function TopBillboardsSection({ billboards }: { billboards: Billboard[] }) {
  const [tier, setTier] = useState("all");
  const items = (tier === "all" ? billboards : billboards.filter((b) => b.tier === tier)).slice(0, 4);
  return (
    <section className="mx-auto mt-20 max-w-[1512px] px-10">
      <h2 className="font-anton text-[48px] leading-none uppercase">
        Loky Lume Top <span className="text-[#4caf5f]">DOOH Billboard</span>
      </h2>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-[20px]">All Top Trending DOOH Billboards Across India</h3>
            <div className="mt-4">
              <TierChips value={tier} onChange={setTier} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <p className="text-[13px] font-bold text-green">
              Create Campaign Using <Link href="#" className="text-sky-500 underline">LOKY AI</Link> ✨
            </p>
            <Link href="/listing" className="flex items-center gap-2 text-[15px] font-bold">
              <MapIcon className="size-4" />
              Explore Screens
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {items.map((b, i) => (
            <BillboardCardHorizontal key={`${b.id}-${i}`} b={b} compact cta="green" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Steps + You're live ---------------- */

export function StepsSection() {
  return (
    <section className="mx-auto mt-24 max-w-[1512px] px-10">
      <div className="mx-auto h-px max-w-[1100px] border-t border-dashed border-ink/25" />
      <h2 className="font-poppins mt-12 text-center text-[36px] leading-tight font-semibold">
        No Hassle. No Delays. Just Results.
        <br />
        From Idea To LED In Minutes
      </h2>

      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-3">
            <Image src={s.icon} alt="" width={60} height={60} className="size-[60px] object-contain" />
            <div>
              <p className="flex items-baseline gap-2">
                <span className="font-poppins text-[34px] leading-none font-bold text-[#4caf5f]">{s.n}</span>
                <span className="font-poppins text-[17px] font-semibold">{s.title}</span>
              </p>
              <p className="font-urbanist mt-2 text-[13px] leading-snug text-ink-soft">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* billboard */}
      <div className="relative mx-auto mt-12 w-full max-w-[740px]">
        <div className="rounded-[18px] border-[8px] border-[#1b1b1b] bg-[linear-gradient(135deg,#6ad17f,#4caf5f)] px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <p className="font-anton text-[46px] leading-none">5. YOU&apos;RE LIVE!</p>
          <p className="font-urbanist mt-4 text-[14px] font-semibold text-[#0d2a16]">
            Your Ad Shines Bright On Premium Locations — Your Audience Can&apos;t Miss It.
          </p>
          <Link
            href="/listing"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-coral bg-ink px-6 text-[13px] text-white"
          >
            Book Your Slot <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="flex justify-between px-[14%]">
          <span className="h-[130px] w-[44px] bg-[linear-gradient(90deg,#1f1f1f,#4a4a4a,#1f1f1f)]" />
          <span className="h-[130px] w-[44px] bg-[linear-gradient(90deg,#1f1f1f,#4a4a4a,#1f1f1f)]" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Loky AI / Loky Lab + marquee ---------------- */

function Ribbon({ reverse = false, dark = false }: { reverse?: boolean; dark?: boolean }) {
  const items = Array.from({ length: 8 });
  return (
    <div
      className={cn(
        "flex w-[200%] items-center gap-12 overflow-hidden py-3 whitespace-nowrap",
        dark ? "bg-[#2a2a2a] text-[#3f3f3f]" : "bg-white text-ink",
        reverse ? "-rotate-2" : "rotate-2",
      )}
    >
      <div className={cn("animate-marquee flex shrink-0 items-center gap-12", reverse && "[animation-direction:reverse]")}>
        {items.map((_, i) => (
          <span key={i} className="font-poppins flex items-center gap-3 text-[26px] font-bold">
            {dark ? (
              "DESIGN ADS WITH LOKY MEDIA"
            ) : (
              <>
                <Logo height={28} />
                DIGITAL OUT-OF-HOME INDIA
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function AiBlock({ title, flip = false }: { title: string; flip?: boolean }) {
  return (
    <div className={cn("mx-auto grid max-w-[1512px] items-center gap-10 px-10 py-20 lg:grid-cols-2", flip && "lg:[&>*:first-child]:order-2")}>
      <div className="max-w-[520px]">
        <h2 className="font-anton text-[64px] leading-none text-[#5fd57c]">{title}</h2>
        <p className="font-urbanist mt-6 text-[20px] leading-snug text-white">
          {title.replace("LOKY ", "Loky ")} Is Transforming{" "}
          <u className="underline-offset-4">The Future Of Out-Of-Home (OOH) Media</u> With Intelligent, Data-Powered
          Solutions. Our Platform Enables Advertisers To <u>Launch</u>, <u>Manage</u>, And <u>Optimize Campaigns</u> Across
          Digital Billboards With Precision And Scale — <u>All Powered By AI.</u>
        </p>
        <button type="button" className="mt-8 h-11 rounded-full bg-coral-600 px-6 text-[14px] font-medium text-white">
          Launch Sooon
        </button>
      </div>
      <div className="relative aspect-[1.28] w-full">
        <Image src="/img/ai-dashboard.png" alt="Loky AI dashboard preview" fill sizes="700px" className="object-contain" />
      </div>
    </div>
  );
}

export function AiLabSection() {
  return (
    <section className="relative mt-24 overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full bg-[radial-gradient(circle,#7a3a2a_0%,transparent_60%)] opacity-70" />
      <div className="pointer-events-none absolute top-[20%] -right-40 size-[520px] rounded-full bg-[radial-gradient(circle,#1c4a2a_0%,transparent_60%)] opacity-70" />

      <AiBlock title="LOKY AI" />

      <div className="relative -mx-6 h-[150px]">
        <div className="absolute inset-x-0 top-6">
          <Ribbon dark reverse />
        </div>
        <div className="absolute inset-x-0 top-10">
          <Ribbon />
        </div>
      </div>

      <AiBlock title="LOKY LAB" flip />

      <div className="relative -mx-6 h-[150px]">
        <div className="absolute inset-x-0 top-6">
          <Ribbon dark reverse />
        </div>
        <div className="absolute inset-x-0 top-10">
          <Ribbon />
        </div>
      </div>
    </section>
  );
}
