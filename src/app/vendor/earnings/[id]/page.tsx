import Image from "next/image";
import {
  BarChart3,
  Calendar,
  Check,
  CircleHelp,
  Clock,
  Contact,
  Download,
  FileSpreadsheet,
  FileText,
  LockKeyhole,
  MapPin,
  Receipt,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Hourglass,
  ClipboardCheck,
} from "lucide-react";
import {
  IconTile,
  OutlineButton,
  PrimaryButton,
  SectionTitle,
  StatusChip,
  VCard,
  VendorPageHeader,
} from "@/components/vendor/ui";
import { earnings as e } from "@/lib/vendor-data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Earnings & Payouts — Loky Media Vendor" };

const DOC_ICON = { invoice: Receipt, sheet: FileSpreadsheet, chart: BarChart3 } as const;

export default function EarningsPage() {
  return (
    <>
      <VendorPageHeader
        title="Earnings & Payouts"
        subtitle="Track campaign earnings, payout schedules and settlement history."
        backHref="/vendor/earnings"
        actions={
          <>
            <OutlineButton className="h-11 px-4 text-[15px]">
              <Calendar className="size-4" /> Last 30 Days
            </OutlineButton>
            <PrimaryButton className="h-11 px-5 text-[15px]">
              <Download className="size-4" /> Export Report
            </PrimaryButton>
          </>
        }
      />

      <div className="space-y-8 px-10 py-8">
        {/* campaign summary */}
        <VCard className="flex items-center gap-5 rounded-2xl p-4">
          <Image
            src={e.campaign.tile}
            alt=""
            width={96}
            height={96}
            className="size-24 rounded-lg border border-v-line object-cover p-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <StatusChip tone="green" className="h-6 px-3 text-[11px] text-v-green">
                LIVE
              </StatusChip>
              <span className="text-[13px] text-ink-soft">Agency: {e.campaign.agency}</span>
            </div>
            <p className="mt-1 text-[28px] font-semibold tracking-tight">{e.campaign.name}</p>
            <p className="mt-1 flex items-center gap-2 text-[14px] text-ink-soft">
              <Calendar className="size-4" /> {e.campaign.duration}
              <span className="mx-2 size-1 rounded-full bg-ink/30" />
              <MapPin className="size-4" /> {e.campaign.region}
            </p>
          </div>
          <div className="rounded-xl bg-v-deep px-8 py-4 text-center text-white">
            <p className="text-[12px] tracking-[0.14em] uppercase">Total Revenue</p>
            <p className="mt-1 text-[32px] leading-none font-bold">{e.campaign.total}</p>
          </div>
        </VCard>

        {/* stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {e.stats.map((s) => (
            <VCard
              key={s.label}
              className={cn(
                "p-5",
                s.tone === "green" && "border-2 border-v-mint",
                s.tone === "orange" && "border-2 border-v-orange",
              )}
            >
              <div className="flex items-start justify-between">
                <IconTile tone={s.tone === "orange" ? "orange" : "green"} className="size-12 [&_svg]:size-6">
                  {s.tone === "plain" ? <Wallet /> : s.tone === "green" ? <CheckCircle2 /> : <Hourglass />}
                </IconTile>
                {s.trend ? (
                  <span className="flex items-center gap-1 text-[13px] font-medium text-v-mint">
                    <TrendingUp className="size-4" /> {s.tag}
                  </span>
                ) : (
                  <StatusChip tone={s.tone === "green" ? "green" : "orange"} className="h-6 px-3 text-[11px]">
                    {s.tag}
                  </StatusChip>
                )}
              </div>
              <p className="mt-8 text-[14px] text-ink-soft">{s.label}</p>
              <p className={cn("mt-1 text-[30px] leading-none font-semibold", s.tone === "plain" && "text-v-deep")}>{s.value}</p>
            </VCard>
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_370px]">
          {/* lifecycle */}
          <VCard className="self-start rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <SectionTitle className="text-[20px]">Payout Lifecycle</SectionTitle>
              <span className="text-[13px] text-ink-soft">Update: 2 hrs ago</span>
            </div>
            <ol className="relative mt-8 space-y-6 pl-[72px] before:absolute before:top-4 before:bottom-10 before:left-[19px] before:w-px before:bg-v-line">
              {e.lifecycle.map((it) => (
                <li key={it.title} className="relative">
                  <span
                    className={cn(
                      "absolute top-1/2 -left-[72px] grid size-10 -translate-y-1/2 place-items-center rounded-full ring-4 ring-white",
                      it.state === "done" && "bg-v-mint text-white",
                      it.state === "active" && "bg-v-deep text-white",
                      it.state === "locked" && "bg-v-panel text-ink-soft",
                    )}
                  >
                    {it.state === "done" ? <Check className="size-5" /> : it.state === "active" ? <Clock className="size-5" /> : <LockKeyhole className="size-5" />}
                  </span>
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg px-5 py-4",
                      it.state === "done" ? "border border-v-mint/50 bg-v-tint" : "bg-v-panel",
                      it.state === "locked" && "text-ink-soft",
                    )}
                  >
                    <div>
                      <p className="text-[15px] font-semibold">{it.title}</p>
                      <p className="mt-1 text-[14px] text-ink-soft">{it.body}</p>
                    </div>
                    <span className={cn("text-[14px] font-semibold", it.state === "done" ? "text-v-green" : it.state === "locked" ? "text-ink-soft" : "text-ink")}>
                      {it.amount}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </VCard>

          <div className="space-y-6">
            <VCard className="rounded-2xl p-6">
              <SectionTitle className="text-[20px]">Documents</SectionTitle>
              <ul className="mt-5 space-y-3">
                {e.documents.map((d) => {
                  const Icon = DOC_ICON[d.icon as keyof typeof DOC_ICON];
                  return (
                    <li key={d.title} className="flex items-center gap-4 rounded-lg bg-v-panel p-4">
                      <IconTile tone={d.tone as "green" | "orange" | "grey"}>
                        <Icon />
                      </IconTile>
                      <div className="flex-1 leading-tight">
                        <p className="text-[14px] font-semibold">{d.title}</p>
                        <p className="mt-0.5 text-[12px] text-ink-soft">{d.meta}</p>
                      </div>
                      <Download className="size-5" />
                    </li>
                  );
                })}
              </ul>
            </VCard>

            <VCard className="rounded-2xl bg-[#fbfbfc] p-6">
              <SectionTitle className="text-[20px]">Support</SectionTitle>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <button type="button" className="flex h-[92px] flex-col items-center justify-center gap-2 rounded-lg border border-v-line bg-white text-[13px] font-semibold">
                  <CircleHelp className="size-6 text-v-green" strokeWidth={1.7} /> Raise Query
                </button>
                <button type="button" className="flex h-[92px] flex-col items-center justify-center gap-2 rounded-lg border border-v-line bg-white text-center text-[13px] leading-tight font-semibold">
                  <Contact className="size-6 text-v-green" strokeWidth={1.7} /> Contact
                  <br />
                  Finance
                </button>
              </div>
              <PrimaryButton className="mt-5 h-12 w-full text-[14px] font-semibold">
                <ClipboardCheck className="size-4" /> Request Final Review
              </PrimaryButton>
            </VCard>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <VCard className="rounded-2xl p-6">
            <SectionTitle className="text-[20px]">Payment Policy</SectionTitle>
            <p className="mt-4 max-w-[420px] text-[15px] leading-relaxed text-ink-soft">{e.policy}</p>
          </VCard>
          <VCard className="flex items-center gap-6 rounded-2xl p-6">
            <Image src={e.lead.avatar} alt={e.lead.name} width={80} height={80} className="size-20 rounded-full object-cover" />
            <div>
              <p className="text-[17px] font-semibold">{e.lead.name}</p>
              <p className="text-[14px] text-ink-soft">{e.lead.role}</p>
              <p className="mt-2 flex gap-4 text-[14px] font-semibold text-v-green">
                <a href="#">Send Message</a>
                <a href="#">Book Meeting</a>
              </p>
            </div>
            <FileText className="hidden" />
          </VCard>
        </div>
      </div>
    </>
  );
}
