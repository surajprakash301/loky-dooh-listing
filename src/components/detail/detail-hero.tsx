import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Megaphone, Target } from "lucide-react";
import { offers } from "@/lib/data";
import { cn } from "@/lib/utils";

export type DetailData = {
  code: string;
  title: string;
  address: string;
  gallery: string[];
  lokySense: boolean;
  partner: { logo: string; name: string; board: string; weeklyPrice: string; dailyPrice: string; rating: string; ratingLabel: string };
  quickSpecs: { icon: "megaphone" | "target"; label: string; sub?: string }[];
};

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

function Gallery({ compact, d }: { compact: boolean; d: DetailData }) {
  const pool = d.gallery.length ? d.gallery : ["/img/billboard-day.jpg"];
  const [a, b, c, e, f] = Array.from({ length: 5 }, (_, i) => pool[i % pool.length]);
  return (
    <div className={cn("mt-4 grid gap-3", compact ? "grid-cols-[1fr_1fr_120px]" : "grid-cols-[1fr_1fr_160px]")}>
      {[a, b].map((src, i) => (
        <div key={i} className={cn("relative overflow-hidden rounded-xl", compact ? "h-[300px]" : "h-[408px]")}>
          <Image src={src} alt="" fill sizes="40vw" className="object-cover" />
        </div>
      ))}
      <div className="grid grid-rows-[1fr_1fr_auto] gap-3">
        <div className="relative overflow-hidden rounded-xl">
          <Image src={c} alt="" fill sizes="160px" className="object-cover" />
        </div>
        <div className="relative overflow-hidden rounded-xl">
          <Image src={e} alt="" fill sizes="160px" className="object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={cn("relative overflow-hidden rounded-xl", compact ? "h-[56px]" : "h-[68px]")}>
            <Image src={f} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <button
            type="button"
            className="grid rounded-xl bg-green-deep text-center text-[15px] font-bold leading-tight text-white"
          >
            {d.gallery.length}
            <br />
            photos
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnerRow({ compact, d }: { compact: boolean; d: DetailData }) {
  const p = d.partner;
  const cluster = (
    <div className={cn("flex flex-wrap items-center gap-4", !compact && "self-end pb-2")}>
      <span className="flex h-10 items-center gap-2 rounded-full border border-ink/50 bg-white px-4 text-[13px] whitespace-nowrap">
        <b className="text-[15px]">{p.rating}</b> {p.ratingLabel}
      </span>
      {d.lokySense && (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-anton text-[16px] text-green">LokySense</span>
          <span className="text-[14px] text-green">AI DIVICE Enabled</span>
        </span>
      )}
      <button type="button" className="flex h-10 items-center gap-2 rounded-full border border-ink/50 bg-white px-4 text-[13px] whitespace-nowrap">
        <span className="size-4 rounded-[3px] bg-[linear-gradient(135deg,#2b7cd3,#5ab0f5)]" />
        Download Proposal
        <ChevronDown className="size-4" />
      </button>
    </div>
  );

  return (
    <div className="mt-6">
      <div className="flex items-start gap-5">
        <Image src={p.logo} alt="Loky Lume x Bullz Ad" width={110} height={112} className="size-[110px] shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-bold">
            <span className="underline underline-offset-4 decoration-ink/70">{p.name}</span>
            <span className="text-brand">❖</span>
            <span className="underline underline-offset-4 decoration-ink/70">{p.board}</span>
          </div>
          <p className="mt-3 text-[13px] text-ink-soft">Starting At Just</p>
          <p className="font-urbanist text-[24px] font-bold leading-tight text-coral whitespace-nowrap">{p.weeklyPrice}</p>
          <p className="text-[13px] text-ink-soft">
            <s>{p.dailyPrice}</s>
          </p>
        </div>

        {!compact && cluster}

        <div className="flex shrink-0 gap-2">
          {[0, 1].map((i) => (
            <button key={i} type="button" className="grid size-9 place-items-center rounded-full border border-ink/40 bg-white">
              <Megaphone className="size-4" />
            </button>
          ))}
        </div>
      </div>
      {compact && <div className="mt-4">{cluster}</div>}
    </div>
  );
}

function QuickSpecs({ compact, d }: { compact: boolean; d: DetailData }) {
  return (
    <div className={cn("mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 md:grid-cols-3", !compact && "xl:grid-cols-6")}>
      {d.quickSpecs.map((s, i) => (
        <div key={i} className="flex h-12 items-center justify-center gap-3 rounded-full border border-line bg-white px-4 text-[13px]">
          {s.icon === "megaphone" ? <Megaphone className="size-4 shrink-0" /> : <Target className="size-4 shrink-0" />}
          <span className="leading-tight">
            {s.label}
            {s.sub && <span className="block text-[12px] text-ink-soft">{s.sub}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Offers() {
  return (
    <div className="mt-8">
      <h3 className="text-[15px] font-bold tracking-wide uppercase">Get Exciting Offers On Your Bookings</h3>
      <span className="mt-1.5 block h-[3px] w-14 rounded bg-indigo-brand" />
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {offers.map((o) => (
          <div
            key={o.title + o.body}
            className="relative flex h-[136px] overflow-hidden rounded-xl text-white"
            style={{ background: o.gradient }}
          >
            <div className="flex-1 p-4">
              <p className="font-urbanist text-[16px] font-bold">{o.title}</p>
              <p className="mt-1.5 font-urbanist text-[13px] leading-snug">
                {o.body.split(/(MIDWEEK20|GETWW20|SATURDAYS20|WELCOME)/).map((part, i) =>
                  /^(MIDWEEK20|GETWW20|SATURDAYS20|WELCOME)$/.test(part) ? <b key={i}>{part}</b> : part,
                )}
              </p>
              {o.note && <p className="mt-1 text-[10px] opacity-80">{o.note}</p>}
            </div>
            <div className={cn("relative shrink-0", o.full ? "w-[42%]" : "w-[34%]")}>
              <Image src={o.image} alt="" fill sizes="200px" className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailHero({ showMap, d }: { showMap: boolean; d: DetailData }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className={cn(showMap && "grid gap-6 xl:grid-cols-[1fr_300px]")}>
        <div className="min-w-0">
          <h1 className="font-urbanist text-[22px] font-bold leading-tight">{d.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-soft">
            <PinIcon className="size-5 text-coral" />
            {d.address}
            <Link
              href={showMap ? `/billboard/${d.code}` : `/billboard/${d.code}?map=1`}
              className="ml-2 text-green underline underline-offset-2"
            >
              {showMap ? "Hide map" : "View on map"}
            </Link>
          </p>

          <Gallery compact={showMap} d={d} />
          <PartnerRow compact={showMap} d={d} />
          <QuickSpecs compact={showMap} d={d} />
        </div>

        {showMap && (
          <div className="relative hidden overflow-hidden rounded-xl border border-line xl:block">
            <Image src="/img/map-detail.jpg" alt={`Map near ${d.address}`} fill sizes="300px" className="object-cover object-top" />
          </div>
        )}
      </div>

      <Offers />
    </section>
  );
}
