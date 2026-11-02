"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowRight, BadgeCheck, Clock, CloudUpload, FilePlus, Image as ImageIcon, PlayCircle, SlidersHorizontal, Star, Zap } from "lucide-react";
import { useState } from "react";
import { IconTile, PrimaryButton, VCard, VendorPageHeader } from "@/components/vendor/ui";
import { mediaKpis, mediaTabs, recentProofs, rejectedProof } from "@/lib/vendor-data-2";
import { cn } from "@/lib/utils";

const KPI_ICON = { image: ImageIcon, clock: Clock, badge: BadgeCheck, alert: AlertCircle } as const;

export function MediaLibrary() {
  const [tab, setTab] = useState(0);
  const [rejected, setRejected] = useState(true);

  return (
    <>
      <VendorPageHeader
        title="Media & Proofs"
        subtitle="Manage, verify, and archive execution visuals for your active network."
        back={false}
        actions={<PrimaryButton className="h-12 px-6 text-[15px] font-semibold"><FilePlus className="size-4" /> Upload Proofs</PrimaryButton>}
      />

      <div className="space-y-6 px-6 py-6">
        <div className="grid gap-5 md:grid-cols-4">
          {mediaKpis.map((k) => { const Icon = KPI_ICON[k.icon as keyof typeof KPI_ICON]; return (
            <VCard key={k.label} className="flex items-center gap-4 p-5"><IconTile tone={k.tone as "green" | "orange" | "red"} className="size-11 rounded-full [&_svg]:size-5"><Icon /></IconTile><div><p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">{k.label}</p><p className="mt-0.5 text-[18px] font-bold">{k.value}</p></div></VCard>
          ); })}
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#9fd4a9] bg-v-tint-2 px-6 py-10 text-center">
          <input type="file" multiple className="hidden" />
          <span className="grid size-16 place-items-center rounded-full bg-v-bright text-white"><CloudUpload className="size-7" /></span>
          <p className="mt-6 text-[20px] font-bold">Drag and drop campaign proof photos or videos</p>
          <p className="mt-2 max-w-[440px] text-[15px] text-ink-soft">Upload multiple files at once. Supports High-Res JPG, PNG, and MP4 (Max 50MB per file).</p>
          <span className="mt-5 rounded-full bg-v-filter px-4 py-1.5 text-[11px] font-bold tracking-wide">0/12 ACTIVE UPLOADS</span>
        </label>

        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">{mediaTabs.map((t, i) => <button key={t} type="button" onClick={() => setTab(i)} className={cn("h-10 rounded-lg px-5 text-[14px] font-semibold", i === tab ? "bg-v-green text-white" : "text-ink hover:bg-v-panel")}>{t}</button>)}</div>
              <button type="button" className="flex items-center gap-2 text-[12px] font-bold tracking-wide uppercase"><SlidersHorizontal className="size-4" /> Sort by date</button>
            </div>

            <div className="mt-5 grid grid-cols-[2fr_1fr] gap-4">
              <div className="relative h-[420px] overflow-hidden rounded-xl">
                <Image src="/img/vendor/media-main.jpg" alt="" fill sizes="600px" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_55%,rgba(0,0,0,0.85)_100%)]" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="flex items-center gap-3 text-[12px]"><span className="rounded bg-v-bright px-2 py-0.5 text-[10px] font-bold text-v-deep">APPROVED</span> Nov 12, 2026 • 21:45</p>
                  <p className="mt-2 text-[22px] font-bold">Premium Wall - Cyber Hub (Night View)</p>
                  <p className="text-[14px] text-white/80">Campaign: Rolex Masters &apos;26</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="relative overflow-hidden rounded-xl"><Image src="/img/vendor/media-traffic.jpg" alt="" fill sizes="260px" className="object-cover" /><span className="absolute top-3 left-3 rounded bg-black/70 px-2 py-1 text-[10px] font-bold text-white">TRAFFIC VIDEO</span><PlayCircle className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white" strokeWidth={1.4} /></div>
                <div className="relative overflow-hidden rounded-xl"><Image src="/img/vendor/media-pending.jpg" alt="" fill sizes="260px" className="object-cover" /><span className="absolute top-3 right-3 rounded bg-v-orange px-2 py-1 text-[10px] font-bold text-white">PENDING</span></div>
              </div>
              <div className="relative h-[200px] w-[260px] overflow-hidden rounded-xl"><Image src="/img/vendor/media-welcome.jpg" alt="" fill sizes="260px" className="object-cover" /><span className="absolute bottom-3 left-3 grid size-6 place-items-center rounded-full bg-black/70 text-white"><Star className="size-3 fill-current" /></span></div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-[20px] font-semibold">Recent Execution Proofs</h2><Link href="#" className="text-[11px] font-bold tracking-wide text-v-green">VIEW ALL</Link></div>
            {rejected && (
              <div className="rounded-xl border-l-4 border-v-red bg-v-sage-2 p-5">
                <div className="flex items-start justify-between"><div><p className="text-[11px] font-bold tracking-wide text-v-red uppercase">Proof Rejected</p><p className="mt-1 text-[16px] font-semibold">{rejectedProof.screen}</p></div><AlertCircle className="size-5 text-v-red" /></div>
                <p className="mt-4 rounded-lg border border-[#d6d6c8] bg-[#e4e4d8] p-4 text-[14px] italic leading-relaxed">{rejectedProof.quote}</p>
                <div className="mt-4 flex gap-3"><button type="button" onClick={() => setRejected(false)} className="h-11 flex-1 rounded-lg border border-v-line bg-white text-[14px] font-semibold">Dismiss</button><button type="button" className="h-11 flex-1 rounded-lg bg-v-red text-[14px] font-semibold text-white">Re-upload</button></div>
              </div>
            )}
            {recentProofs.map((p) => (
              <VCard key={p.title} className="flex gap-4 p-4"><Image src={p.thumb} alt="" width={64} height={64} className="size-16 rounded-lg object-cover" /><div className="flex-1"><div className="flex items-start justify-between"><p className="text-[15px] font-semibold">{p.title}</p><span className="rounded bg-[#d6f6e0] px-2 py-0.5 text-[10px] font-bold text-v-green-2">APPROVED</span></div><p className="mt-1 text-[11px] font-bold tracking-wide text-ink-soft">{p.sub}</p><p className="mt-2 text-[13px] text-ink-soft">{p.by}</p></div></VCard>
            ))}
            <div className="relative overflow-hidden rounded-xl border border-v-line bg-v-tint-2 p-5">
              <p className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-v-green-2 uppercase"><Zap className="size-4 fill-current" /> Marketplace Insight</p>
              <p className="mt-3 text-[18px] leading-tight font-bold">Agencies are looking for Night Proofs in South Delhi.</p>
              <p className="mt-3 text-[14px] text-ink-soft">Media with verified night photos see 14% higher engagement from premium luxury brands.</p>
              <Link href="#" className="mt-4 flex items-center gap-1 text-[14px] font-semibold text-v-green-2">Update My Gallery <ArrowRight className="size-4" /></Link>
              <Star className="absolute -right-4 -bottom-4 size-20 text-v-line" strokeWidth={1} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
