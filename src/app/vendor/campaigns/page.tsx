import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CloudUpload,
  Download,
  EllipsisVertical,
  Eye,
  FileText,
  MapPin,
  Monitor,
  PenLine,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Target,
  Timer,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { OutlineButton, PrimaryButton, VCard } from "@/components/vendor/ui";
import { campaignJourney, newOrder as o, orderHealth, secondOrder } from "@/lib/vendor-data-2";
import { cn } from "@/lib/utils";

export const metadata = { title: "Campaign Orders — Loky Media Vendor" };

const HEALTH_ICON = { trend: TrendingUp, calendar: Calendar, store: Store, proof: Calendar, check: CheckCircle2 } as const;
const JOURNEY_ICON = { edit: PenLine, eye: Eye, approve: UserCheck, cloud: CloudUpload, play: Play, file: FileText, shield: ShieldCheck, sparkle: Sparkles } as const;

export default function CampaignsListPage() {
  return (
    <>
      <div className="flex items-center justify-between border-b border-v-line bg-white px-8 py-6">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight">Check The New Campaign Order</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Track ads running across your screens</p>
        </div>
        <div className="flex gap-3">
          <OutlineButton className="h-9 border-0 bg-v-filter text-[13px] font-semibold"><SlidersHorizontal className="size-4" /> Filter</OutlineButton>
          <OutlineButton className="h-9 border-0 bg-v-filter text-[13px] font-semibold"><Download className="size-4" /> Export PDF</OutlineButton>
        </div>
      </div>

      <div className="space-y-6 px-8 py-6">
        <div className="flex items-center gap-5 rounded-xl border border-v-red/20 bg-v-red-tint p-5">
          <span className="grid size-12 place-items-center rounded-full bg-v-red text-white"><AlertTriangle className="size-5" /></span>
          <div className="flex-1">
            <p className="text-[18px] font-semibold text-v-red">Action Required: 4 Overdue Tasks</p>
            <p className="text-[14px] text-ink-soft">Missing Proof of Play for &apos;Summer Refresh&apos; campaign (3 screens).</p>
          </div>
          <button type="button" className="h-12 rounded-lg bg-v-red px-6 text-[15px] font-semibold text-white">View Alerts</button>
        </div>

        <section>
          <h2 className="text-[22px] font-semibold">Order Health Overview</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-5">
            {orderHealth.map((h) => {
              const Icon = HEALTH_ICON[h.icon as keyof typeof HEALTH_ICON];
              return (
                <div key={h.label} className="rounded-xl p-5 text-white" style={{ background: h.bg }}>
                  <p className="text-[16px] font-bold tracking-wide uppercase">{h.label}</p>
                  <p className="mt-2 text-[44px] leading-none font-bold">{h.value}</p>
                  <p className="mt-5 flex items-center gap-2 text-[13px]"><Icon className="size-4" /> {h.foot}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold">New Order Requests</h2>
            <Link href="#" className="text-[15px] text-v-green">View All Requests (12)</Link>
          </div>

          <VCard className="mt-4 grid gap-6 p-5 lg:grid-cols-[224px_1fr]">
            <div className="relative h-[376px] overflow-hidden rounded-xl bg-v-panel">
              <Image src={o.proof} alt="Campaign proof" fill sizes="224px" className="object-cover opacity-60" />
              <span className="absolute top-4 left-0 rounded-r-full bg-v-key px-4 py-1.5 text-[12px] font-semibold">Campaign Proof</span>
              <span className="absolute top-[170px] left-7 rounded-full bg-[#dcd6f0] px-3 py-1.5 text-[11px] font-semibold">Upload Campaign Proof</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <Image src={o.logo} alt="Samsung" width={88} height={88} className="size-[88px] rounded-lg border border-v-line object-cover" />
                  <div>
                    <p className="text-[22px] font-semibold">{o.brand}</p>
                    <p className="text-[14px] text-ink-soft">{o.hq}</p>
                    <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-ink-soft">
                      <span className="flex items-center gap-1.5"><Calendar className="size-4" /> Starts: {o.starts}</span>
                      <span className="flex items-center gap-1.5"><Timer className="size-4" /> Duration: {o.duration}</span>
                      <span className="flex items-center gap-1.5"><Monitor className="size-4" /> Screen: {o.screens}</span>
                      <span className="flex items-center gap-1.5"><Target className="size-4" /> Slot: {o.slot}</span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-[#fef8cc] px-4 py-1.5 text-[13px] text-[#8a6d00]">{o.chip}</span>
                  <p className="mt-2 text-[12px] text-ink-soft">{o.category}</p>
                </div>
              </div>

              <p className="mt-4 flex items-center gap-2 text-[14px] text-v-rust"><MapPin className="size-4" /> No. Of Booking : {o.bookings}</p>

              <div className="mt-3 rounded-xl bg-v-panel p-5">
                <p className="text-[14px] font-bold tracking-wide uppercase">Campaign Order Journey</p>
                <div className="relative mt-4 flex justify-between">
                  <span className="absolute top-5 right-10 left-10 h-px bg-v-line" />
                  <span className="absolute top-5 left-10 h-px w-[28%] bg-v-green" />
                  {campaignJourney.map((j) => {
                    const Icon = JOURNEY_ICON[j.icon as keyof typeof JOURNEY_ICON];
                    const on = j.state === "done" || j.state === "active";
                    return (
                      <div key={j.label} className="relative flex w-[84px] flex-col items-center text-center">
                        <span className={cn("grid size-11 place-items-center rounded-full border-2 bg-white", j.state === "active" ? "border-v-green bg-v-green text-white" : on ? "border-v-green text-v-green" : "border-v-line text-ink")}><Icon className="size-4" /></span>
                        <p className={cn("mt-2 text-[11px] leading-tight font-semibold whitespace-pre-line", on && "text-v-green")}>{j.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto flex items-center gap-4 pt-4">
                <div className="flex flex-1 items-center justify-between rounded-lg bg-v-panel px-3 py-2">
                  <div className="flex items-center gap-3"><Image src={o.contact.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" /><div className="leading-tight"><p className="text-[14px] font-semibold">{o.contact.name}</p><p className="text-[12px] text-ink-soft">{o.contact.role}</p></div></div>
                  <EllipsisVertical className="size-5" />
                </div>
                <Link href="/vendor/campaigns/01020" className="inline-flex h-12 items-center rounded-lg bg-v-green px-8 text-[15px] font-semibold text-white">Manage Campaign</Link>
                <OutlineButton className="h-12 px-8 text-[15px]">View Reports</OutlineButton>
              </div>
            </div>
          </VCard>

          <VCard className="mt-5 flex w-full max-w-[590px] gap-5 p-6">
            <Image src={secondOrder.logo} alt="" width={126} height={126} className="size-[126px] rounded-lg bg-v-panel object-cover" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div><p className="text-[19px] font-semibold">{secondOrder.title}</p><p className="text-[14px] text-ink-soft">{secondOrder.agency}</p></div>
                <span className="rounded bg-v-orange-tint px-3 py-1.5 text-[13px] tracking-wide text-[#c2410c] uppercase">New Request</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-y-3 text-[13px] text-ink-soft">
                <span className="flex items-center gap-1.5"><Calendar className="size-4" /> Starts: {secondOrder.starts}</span>
                <span className="flex items-center gap-1.5"><Timer className="size-4" /> Duration: {secondOrder.duration}</span>
                <span className="flex items-center gap-1.5"><Monitor className="size-4" /> Screen: {secondOrder.screen}</span>
                <span className="flex items-center gap-1.5"><Target className="size-4" /> Slot: {secondOrder.slot}</span>
              </div>
            </div>
          </VCard>
          <div className="mt-4 grid w-full max-w-[590px] grid-cols-2 gap-4">
            <PrimaryButton className="h-14">Approve Order</PrimaryButton>
            <button type="button" className="h-14 rounded-lg border border-v-line bg-white text-[15px] font-medium text-v-red">Reject</button>
          </div>
        </section>
      </div>
    </>
  );
}
