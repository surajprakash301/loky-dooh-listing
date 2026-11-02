import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Download, PieChart, TrendingUp, Users, Bot } from "lucide-react";
import { OutlineButton, PrimaryButton, VCard, VendorPageHeader } from "@/components/vendor/ui";
import { Bar } from "@/components/vendor/widgets";
import { analyticsKpis, peakTiming, topScreens, trafficHours, weekly } from "@/lib/vendor-data-2";
import { cn } from "@/lib/utils";

export const metadata = { title: "Analytics — Loky Media Vendor" };

export default function AnalyticsPage() {
  return (
    <>
      <VendorPageHeader
        title="Analytics"
        subtitle="Deep dive into your network performance and audience engagement."
        back={false}
        actions={<><OutlineButton className="h-11 px-4 text-[15px]"><Calendar className="size-4" /> Last 30 Days</OutlineButton><PrimaryButton className="h-11 px-5 text-[15px]"><Download className="size-4" /> Export Report</PrimaryButton></>}
      />

      <div className="grid gap-6 border-b border-v-line px-10 py-8 md:grid-cols-4">
        {analyticsKpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-v-line bg-[#f6faf2] p-6"><p className="text-[14px] font-semibold">{k.label}</p><p className="mt-2 text-[34px] leading-none font-bold">{k.value}</p></div>
        ))}
      </div>

      <div className="space-y-8 px-10 py-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <VCard className="p-6">
            <div className="flex items-start justify-between">
              <div><p className="text-[18px] font-bold tracking-[0.1em] uppercase">Traffic Visibility</p><p className="text-[12px] text-ink-soft">Estimated footfall by hour</p></div>
              <div className="text-right"><p className="text-[16px] font-bold text-v-deep">1.2M</p><span className="mt-1 inline-flex items-center gap-1 rounded-full bg-v-chip px-3 py-1 text-[13px] font-semibold text-v-deep"><TrendingUp className="size-3.5" /> 14% Increase</span></div>
            </div>
            <div className="mt-8 flex h-[200px] items-end gap-3">
              {trafficHours.map((h) => (
                <div key={h.h} className="flex flex-1 flex-col items-center justify-end">
                  <div className={cn("w-full rounded-t-md", h.peak ? "border-t-4 border-v-deep bg-[#ccded6]" : "bg-[#e4eeea]")} style={{ height: `${h.v * 1.8}px` }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-3">{trafficHours.map((h) => <p key={h.h} className={cn("flex-1 text-center text-[11px] text-ink-soft", h.bold && "font-bold text-ink")}>{h.h}</p>)}</div>
          </VCard>
          <div className="rounded-xl bg-[radial-gradient(ellipse_at_80%_90%,#1c4a2a_0%,#161c16_55%)] p-6 text-white">
            <p className="text-[13px] font-bold tracking-wide text-v-bright uppercase">Estimated Reach</p>
            <p className="mt-2 text-[48px] leading-none font-bold">8.4M+</p>
            <p className="mt-4 flex items-center gap-2 text-[14px] text-v-bright"><Users className="size-4" /> Unique Daily Impressions</p>
            <div className="mt-6 flex items-center justify-between text-[15px]"><span className="text-white/80">Engagement Rate</span><b>12.4%</b></div>
            <Bar pct={65} color="#44e272" track="rgba(255,255,255,0.12)" className="mt-3 h-1" />
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between"><h2 className="text-[20px] font-semibold">Top Performing Screens</h2><Link href="/vendor/screens" className="flex items-center gap-1 text-[12px] font-bold tracking-wide text-v-green">SEE ALL <ArrowRight className="size-3.5" /></Link></div>
          <div className="mt-4 space-y-4">
            {topScreens.map((t) => (
              <VCard key={t.rank} className="flex items-center gap-4 p-4">
                <div className="relative size-[92px] shrink-0 overflow-hidden rounded-lg"><Image src={t.image} alt="" fill sizes="92px" className="object-cover" /><span className="absolute right-1 bottom-1 rounded bg-black/70 px-1 text-[9px] font-bold text-white">#{t.rank}</span></div>
                <div className="flex-1"><p className="text-[16px] font-semibold">{t.title}<br />{t.id}</p><p className="mt-2 text-[11px] font-bold tracking-wide text-ink-soft">{t.location}</p></div>
                <div className="text-right"><p className="text-[18px] font-bold text-v-green">{t.revenue}</p><p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Revenue (Month)</p></div>
              </VCard>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <VCard className="p-6">
            <p className="text-[18px] font-semibold">Peak Timing</p><p className="text-[14px] text-ink-soft">Optimal ad delivery windows</p>
            <div className="mt-6 space-y-6">{peakTiming.map((p) => <div key={p.label}><div className="flex items-center justify-between text-[13px]"><span className="max-w-[160px] leading-tight">{p.label}</span><span className="text-right leading-tight">{p.pct}%<br />Density</span></div><Bar pct={p.pct} color={p.tone} className="mt-3" /></div>)}</div>
          </VCard>
          <div className="rounded-xl border border-v-line bg-[#f6faf2] p-6">
            <div className="flex items-center justify-between"><p className="text-[18px] font-semibold">Slot Occupancy Trends</p><span className="text-[11px] font-bold tracking-wide text-v-deep">• LIVE TREND</span></div>
            <div className="mt-5 flex items-center gap-4"><span className="grid size-11 place-items-center rounded-full bg-v-chip text-v-deep"><PieChart className="size-5" /></span><div className="flex-1"><div className="flex items-center justify-between text-[15px]"><b>Network Occupancy</b><b>84%</b></div><Bar pct={84} color="#006e2e" className="mt-2" /></div></div>
            <div className="mt-5 rounded-lg bg-white p-4"><p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Weekly Average</p><div className="mt-4 flex h-[90px] items-end gap-1">{weekly.map((w) => <div key={w.d} className="flex-1 rounded-t-sm" style={{ height: `${w.v}%`, background: w.peak ? "#006e2e" : w.v > 60 ? "#64a67e" : "#c6e0ce" }} />)}</div><div className="mt-2 flex gap-1">{weekly.map((w) => <p key={w.d} className="flex-1 text-center text-[10px] font-bold text-ink-soft">{w.d}</p>)}</div></div>
            <div className="mt-4 grid grid-cols-2 gap-4"><div className="rounded-lg border border-v-line bg-white p-4"><p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Available Slots</p><p className="mt-1 text-[24px] font-bold text-v-rust">18</p></div><div className="rounded-lg border border-v-line bg-white p-4"><p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Pending Bookings</p><p className="mt-1 text-[24px] font-bold text-v-green">04</p></div></div>
          </div>
        </div>

        <div className="grid items-center gap-8 rounded-2xl bg-[linear-gradient(90deg,#bef0ce,#d6f2d2)] p-8 xl:grid-cols-[1fr_420px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-v-green-2 px-4 py-1.5 text-[11px] font-bold tracking-wide text-white uppercase"><Bot className="size-3.5" /> AI Powered Monitoring</span>
            <p className="mt-5 text-[34px] font-bold">Automated Traffic AI</p>
            <p className="mt-3 max-w-[560px] text-[16px] text-ink-soft">Our proprietary LOKY-Edge v2.0 sensors use anonymized computer vision to provide real-time footfall density, gaze tracking, and demographic insights with 99.2% accuracy.</p>
            <div className="mt-6 flex gap-8">{[["99.2%", "Accuracy Rate"], ["Real-time", "Processing"], ["Anonymized", "Privacy First"]].map(([v, l]) => <div key={l}><p className="text-[20px] font-bold text-v-green-2">{v}</p><p className="text-[12px] font-semibold text-ink-soft">{l}</p></div>)}</div>
          </div>
          <div className="relative h-[260px] overflow-hidden rounded-2xl border-[10px] border-[#1a1f1a] bg-black"><Image src="/img/vendor/ai-monitor.jpg" alt="AI traffic monitor" fill sizes="420px" className="object-cover" /></div>
        </div>
      </div>
    </>
  );
}
