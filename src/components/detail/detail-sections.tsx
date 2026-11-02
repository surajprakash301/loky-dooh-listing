"use client";

import Image from "next/image";
import { ChevronRight, Gem, MonitorSmartphone, Plane, ShoppingBag, Utensils } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/site/logo";
import { creativeSpecs, industries, sopSpecs } from "@/lib/data";
import { cn } from "@/lib/utils";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.5 3.9 1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
    </svg>
  );
}

export function WhatsappBanner() {
  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="grid md:grid-cols-[1fr_38%]">
        <div className="p-8 md:p-10">
          <Logo height={40} />
          <h2 className="font-anton mt-4 text-[40px] leading-[0.95] uppercase">
            Still Confuse ?
            <br />
            <span className="text-[32px]">Get a Customized Plan</span>
          </h2>
          <p className="font-urbanist mt-3 text-[14px] text-ink-soft">
            Custom Strategies for Maximum Billboard Impact and Ad Design
          </p>
          <button
            type="button"
            className="mt-6 flex h-11 items-center gap-2 rounded-full bg-coral px-5 text-[14px] font-bold text-white"
          >
            <span className="grid size-6 place-items-center rounded-full bg-white text-whatsapp">
              <WhatsAppGlyph className="size-5" />
            </span>
            Contact Us On Whatsapp
          </button>
        </div>
        <div className="relative min-h-[260px]">
          <Image src="/img/whatsapp-banner.jpg" alt="" fill sizes="40vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}

function SpecTable({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div>
      <h3 className="text-[13px] font-medium uppercase tracking-wide">{title}</h3>
      <ul className="mt-3 overflow-hidden rounded-md border border-line bg-white">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2 border-b border-line px-4 py-3 text-[13px] last:border-b-0">
            <span className="text-ink-soft">{r.label}</span>
            <b className="font-bold">{r.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExecutionDetails({ specs = creativeSpecs }: { specs?: { label: string; value: string }[] }) {
  return (
    <section className="mt-8 rounded-2xl border border-line bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <h2 className="font-urbanist text-[22px] font-bold">Execution Details</h2>
      <p className="font-urbanist mt-1 text-[14px] text-ink-soft">
        Everything You Need to Know About Ad Display &amp; Content Guidelines
      </p>
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,380px)_minmax(0,540px)]">
        <SpecTable title="Creative Specs" rows={specs} />
        <SpecTable title="SOP" rows={sopSpecs} />
      </div>
    </section>
  );
}

const INDUSTRY_ICON = {
  bag: ShoppingBag,
  plane: Plane,
  devices: MonitorSmartphone,
  food: Utensils,
  gem: Gem,
} as const;

export function LokyLabSection() {
  const [active, setActive] = useState<string>("ecommerce");
  return (
    <section className="mt-10 rounded-[28px] bg-black px-6 py-12 text-white md:px-16">
      <h2 className="font-urbanist text-center text-[34px] font-bold">Try-Out Our Loky Lab</h2>
      <p className="font-urbanist mt-1 text-center text-[14px] text-white/85">
        Browse currently active high-impact digital campaigns across our premium urban network.
      </p>

      <div className="relative mx-auto mt-8 aspect-[1.6] max-w-[1180px] overflow-hidden rounded-2xl md:aspect-[1.9]">
        <Image src="/img/lokylab.jpg" alt="Live DOOH campaigns" fill sizes="1180px" className="object-cover" />
        {/* frosted band hides the artwork's baked-in controls; our own controls render on top */}
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-black/55 backdrop-blur-xl [mask-image:linear-gradient(180deg,transparent_0%,#000_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.55)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-7">
          <span className="relative mb-6 block h-px w-[55%] bg-white/30">
            <span className="absolute inset-y-0 left-0 w-[20%] bg-mint" />
          </span>
          <p className="text-[12px] font-medium tracking-wide">INDUSTRIES WE TRANSFORM</p>
          <ul className="mt-5 flex flex-wrap items-start justify-center gap-7">
            {industries.map((it) => {
              const Icon = INDUSTRY_ICON[it.icon];
              const on = active === it.id;
              return (
                <li key={it.id}>
                  <button type="button" onClick={() => setActive(it.id)} className="flex w-[104px] flex-col items-center gap-2">
                    <span
                      className={cn(
                        "grid size-11 place-items-center rounded-lg border",
                        on ? "border-mint bg-[#6bbd4a] text-white" : "border-white/40 bg-white/20 text-white backdrop-blur-sm",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className={cn("text-[12px] font-bold whitespace-nowrap", on && "text-mint underline underline-offset-4")}>
                      {it.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="relative z-10 -mt-6 flex justify-center">
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-full bg-[#2fa84f] px-8 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(47,168,79,0.45)]"
        >
          Upload Your Own Media
          <ChevronRight className="size-4" />
        </button>
      </div>
      <p className="mx-auto mt-5 max-w-[520px] text-center text-[12px] text-white/90">
        Ready to see your brand live? Join 500+ global brands delivering high-impact visual stories on our premium DOOH
        network.
      </p>
    </section>
  );
}
