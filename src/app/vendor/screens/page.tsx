import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle2, Clock, ExternalLink, Info, Layers, MapPin, Radio, Wallet, WifiOff, Wrench } from "lucide-react";
import { LiveStatusForm } from "@/components/vendor/live-status-form";
import { VCard } from "@/components/vendor/ui";
import { SlotPills } from "@/components/vendor/widgets";
import { formatNumber } from "@/lib/format";
import { fileUrl } from "@/services/files";
import { loadMyVendor } from "@/services/vendor-portal";
import { cn } from "@/lib/utils";

export const metadata = { title: "My Screens — Loky Media Vendor" };

export default async function MyScreensPage() {
  const { v } = await loadMyVendor();
  const boards = v.billboards ?? [];
  const approved = boards.filter((b) => b.status === "approved");
  const count = (s: string) => approved.filter((b) => b.liveStatus === s).length;
  const kpis = [
    { label: "Network Uptime", value: approved.length ? `${((count("live") / approved.length) * 100).toFixed(1)}%` : "—", icon: CheckCircle2, tone: "solid" },
    { label: "Available Inventory", value: `${approved.reduce((n, b) => n + b.slotsPerLoop, 0)} Slots`, icon: Layers, tone: "plain" },
    { label: "Listed Screens", value: `${approved.length} of ${boards.length}`, icon: Wallet, tone: "outline" },
  ];
  const counts = [
    { value: count("live"), label: "Live Now", icon: Radio, red: false },
    { value: count("offline"), label: "Offline", icon: WifiOff, red: true },
    { value: count("maintenance"), label: "Maintenance", icon: Wrench, red: true },
    { value: count("limited"), label: "Limited", icon: Calendar, red: false },
  ];

  return (
    <>
      <div className="flex items-center justify-between border-b border-v-line bg-white px-8 py-6">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight">My Screens</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Every billboard your Loky representative registered for you, with its review and live status.</p>
        </div>
        <p className="max-w-[300px] text-right text-[12.5px] text-ink-soft">Want to list another screen? Ask your Loky representative; new billboards are added through them and reviewed by Loky.</p>
      </div>

      <div className="space-y-6 px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {kpis.map((k) => (
            <VCard key={k.label} className="flex items-center justify-between p-6">
              <div>
                <p className="text-[12px] font-bold tracking-wide text-ink-soft uppercase">{k.label}</p>
                <p className="mt-3 text-[30px] leading-none font-bold">{k.value}</p>
              </div>
              <span className={cn("grid size-14 place-items-center rounded-xl", k.tone === "solid" ? "bg-v-deep text-white" : k.tone === "outline" ? "border-2 border-v-bright text-v-deep shadow-[0_0_0_4px_#d6f2d2]" : "bg-v-panel text-ink")}>
                <k.icon className="size-6" />
              </span>
            </VCard>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {counts.map((c) => (
            <VCard key={c.label} className="flex items-center gap-4 p-5">
              <span className={cn("grid size-11 place-items-center rounded-lg", c.red ? "bg-v-red-tint text-v-red" : "bg-v-chip text-v-green")}><c.icon className="size-5" /></span>
              <div><p className="text-[18px] font-bold leading-none">{String(c.value).padStart(2, "0")}</p><p className="mt-1 text-[11px] font-bold tracking-wide text-ink-soft uppercase">{c.label}</p></div>
            </VCard>
          ))}
        </div>

        {boards.length === 0 && (
          <VCard className="p-10 text-center text-ink-soft">No billboards registered yet.</VCard>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {boards.map((b) => {
            const cover = b.media?.find((m) => m.isCover) ?? b.media?.[0];
            const url = fileUrl(cover?.file);
            const live = b.status === "approved" && b.liveStatus === "live";
            const review = (v.reviewSections ?? []).find((r) => r.billboardId === b.id);
            const badge =
              b.status === "approved" ? { text: b.liveStatus ?? "approved", cls: live ? "bg-v-bright text-v-deep" : "bg-v-red text-white" }
              : b.status === "changes_requested" ? { text: "Changes requested", cls: "bg-v-orange text-white" }
              : b.status === "rejected" ? { text: "Rejected", cls: "bg-v-red text-white" }
              : { text: "Under review", cls: "bg-amber-400 text-ink" };
            return (
              <VCard key={b.id} className="overflow-hidden">
                <div className="relative h-[300px] bg-v-panel">
                  {url && <Image src={url} alt={b.name} fill sizes="50vw" className="object-cover" unoptimized />}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.8)_100%)]" />
                  <span className={cn("absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase", badge.cls)}>
                    <span className="size-1.5 rounded-full bg-current" /> {badge.text}
                  </span>
                  {b.lokySense && (
                    <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[12px]"><span className="font-anton text-[14px] text-green">LokySense</span><span className="text-green">AI DIVICE Enabled</span><Info className="size-3" /></span>
                  )}
                  <div className="absolute bottom-5 left-5 text-white">
                    <h3 className="text-[22px] font-bold leading-tight">{b.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[13px] text-white/85"><MapPin className="size-3.5" /> {b.locality}, {b.city} · #{b.code}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Slot occupancy</p>
                      <div className="mt-2"><SlotPills used={Math.min(b.slotsPerLoop, (b.bookings ?? []).filter((x) => x.campaign && ["confirmed", "active"].includes(x.campaign.status)).length)} total={b.slotsPerLoop} /></div>
                      <p className="mt-1 text-[12px] text-ink-soft">{(b.bookings ?? []).filter((x) => x.campaign && ["confirmed", "active"].includes(x.campaign.status)).length}/{b.slotsPerLoop} booked</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Loop time</p>
                      <p className="mt-2 text-[18px] font-bold">{b.loopSeconds}s</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">Daily reach</p>
                      <p className="mt-2 text-[18px] font-bold">{formatNumber(b.dailyImpressions)}</p>
                    </div>
                  </div>
                  {review?.remark && <p className="mt-4 rounded-lg bg-v-orange-tint px-3 py-2 text-[12.5px] text-v-rust"><Clock className="mr-1 inline size-3.5" /> Loky asked your representative to change: {review.remark}</p>}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-v-line pt-4">
                    {b.status === "approved" ? <LiveStatusForm billboardId={b.id} value={b.liveStatus} /> : <span className="text-[13px] text-ink-soft">Not yet listed on the marketplace.</span>}
                    {b.status === "approved" && <Link href={`/billboard/${b.code}`} target="_blank" className="inline-flex items-center gap-1 text-[13px] font-semibold text-v-green hover:underline">View listing <ExternalLink className="size-3.5" /></Link>}
                  </div>
                </div>
              </VCard>
            );
          })}
        </div>
      </div>
    </>
  );
}
