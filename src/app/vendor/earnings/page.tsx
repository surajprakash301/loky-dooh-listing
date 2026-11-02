import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Building2,
  Calendar,
  CheckSquare,
  ClipboardList,
  Copy,
  Download,
  FileWarning,
  Landmark,
  MessageSquare,
  Phone,
  Receipt,
  Send,
  ShieldCheck,
  Wallet,
  WalletCards,
} from "lucide-react";
import { OutlineButton, PrimaryButton, VCard, VendorPageHeader } from "@/components/vendor/ui";
import { Bar, GreenRail, PersonRow } from "@/components/vendor/widgets";
import {
  accountManager,
  earningKpis,
  paymentRequests,
  payoutJourney,
  revenueOrders,
  settlements,
  upcomingPayouts,
  wallet,
} from "@/lib/vendor-data-2";
import { cn } from "@/lib/utils";

export const metadata = { title: "Earnings & Payouts — Loky Media Vendor" };

const KPI_ICON = { total: WalletCards, withdraw: Banknote, pending: Send, shield: ShieldCheck, orders: Copy } as const;
const JOURNEY_ICON = { building: Building2, wallet: WalletCards, verify: CheckSquare, schedule: Calendar, settle: Wallet, bank: Landmark } as const;
const REQ_ICON = { report: FileWarning, invoice: Receipt, bank: Landmark } as const;

function Donut() {
  // conic gradient from wallet parts
  const stops = wallet.parts
    .reduce<{ acc: number; out: string[] }>(
      (r, p) => ({ acc: r.acc + p.pct, out: [...r.out, `${p.color} ${r.acc}% ${r.acc + p.pct}%`] }),
      { acc: 0, out: [] },
    )
    .out.join(",");
  return (
    <div className="relative mx-auto size-[150px] rounded-full" style={{ background: `conic-gradient(${stops})` }}>
      <div className="absolute inset-[14px] grid place-items-center rounded-full bg-white text-center">
        <div><p className="text-[18px] font-bold">{wallet.total}</p><p className="text-[10px] font-bold tracking-wide text-ink-soft">TOTAL</p></div>
      </div>
    </div>
  );
}

function RevenueChart() {
  return (
    <svg viewBox="0 0 760 180" className="mt-5 h-[180px] w-full">
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" x2="760" y1={20 + i * 35} y2={20 + i * 35} stroke="#eceeea" />)}
      <path d="M0 150 C 120 140, 180 120, 260 110 S 420 70, 520 60 S 680 40, 760 20" fill="none" stroke="#007a3e" strokeWidth="2.5" />
      <path d="M0 160 C 100 150, 160 150, 240 130 S 340 40, 440 60 S 560 100, 640 70 S 720 30, 760 20" fill="none" stroke="#00d66a" strokeWidth="3.5" />
    </svg>
  );
}

export default function EarningsOverviewPage() {
  return (
    <>
      <VendorPageHeader
        title="Earnings & Payouts"
        subtitle="Track campaign earnings, payout schedules and settlement history."
        back={false}
        actions={<><OutlineButton className="h-11 px-4 text-[15px]"><Calendar className="size-4" /> Last 30 Days</OutlineButton><PrimaryButton className="h-11 px-5 text-[15px]"><Download className="size-4" /> Export Report</PrimaryButton></>}
      />

      <div className="grid gap-5 border-b border-v-line px-10 py-8 md:grid-cols-5">
        {earningKpis.map((k) => {
          const Icon = KPI_ICON[k.icon as keyof typeof KPI_ICON];
          const solid = k.tone === "solid";
          return (
            <VCard key={k.label} className={cn("p-5", solid && "border-0 bg-v-green-2 text-white shadow-[0_8px_24px_rgba(0,110,46,0.35)]")}>
              <div className="flex items-center gap-3"><span className={cn("grid size-10 place-items-center rounded-lg", solid ? "bg-white/15" : k.tone === "orange" ? "bg-v-orange-tint text-v-orange" : "bg-v-chip text-v-deep")}><Icon className="size-5" /></span><p className={cn("text-[13px] leading-tight font-bold tracking-wide uppercase", solid && "text-v-lime")}>{k.label}</p></div>
              <p className="mt-6 text-[28px] leading-none font-bold">{k.value}</p>
              <p className={cn("mt-5 text-[11px] font-bold tracking-wide uppercase", solid ? "text-v-lime" : k.tone === "orange" ? "text-v-orange" : "text-v-bright")}>{k.foot}</p>
            </VCard>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-[1fr_380px]">
        <div className="space-y-8 px-10 py-8">
          <section>
            <p className="text-[13px] font-bold tracking-[0.12em] uppercase">The Payout Journey</p>
            <VCard className="mt-4 flex items-center justify-between px-8 py-6">
              {payoutJourney.map((j, i) => { const Icon = JOURNEY_ICON[j.icon as keyof typeof JOURNEY_ICON]; return (
                <div key={j.label} className="flex items-center gap-6">
                  <div className="flex w-[100px] flex-col items-center text-center">
                    <span className={cn("grid size-12 place-items-center rounded-full border-2", j.tone === "green" && "border-v-bright text-v-deep", j.tone === "orange" && "border-v-orange text-v-orange", j.tone === "grey" && "border-v-line text-ink-soft")}><Icon className="size-5" /></span>
                    <p className="mt-3 text-[13px] leading-tight font-semibold whitespace-pre-line">{j.label}</p>
                  </div>
                  {i < payoutJourney.length - 1 && <span className="mb-8 flex items-center gap-1 text-ink-soft/40"><span className="h-px w-8 bg-v-line" /><ArrowRight className="size-3" /></span>}
                </div>
              ); })}
            </VCard>
          </section>

          <div className="grid gap-6 md:grid-cols-[240px_1fr]">
            <section>
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase">Upcoming Payouts</p>
              <VCard className="mt-4 space-y-3 p-3">
                {upcomingPayouts.map((u) => (
                  <div key={u.title} className={cn("rounded-lg border-l-4 bg-v-panel p-4", u.tone === "green" ? "border-v-green" : "border-v-orange")}>
                    <p className="text-[12px] text-ink-soft">{u.meta}</p><p className="mt-1 text-[15px] font-semibold">{u.title}</p><p className="mt-1 text-[18px] font-bold text-v-green">{u.amount}</p>
                  </div>
                ))}
                <Link href="#" className="block py-2 text-center text-[13px] font-semibold text-v-green">View All Schedules</Link>
              </VCard>
            </section>
            <section>
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase">Active Revenue Orders</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {revenueOrders.map((r) => (
                  <VCard key={r.title} className="self-start p-4">
                    <div className="flex items-start justify-between"><p className="max-w-[120px] text-[16px] font-semibold">{r.title}</p><span className={cn("rounded-full border px-3 py-1 text-[12px] font-bold", r.tone === "green" ? "border-v-green text-v-green" : "border-v-red text-v-red")}>{r.status}</span></div>
                    <div className="mt-6 space-y-2 text-[14px]"><p className="flex justify-between"><span className="text-ink-soft">Total Value</span><b>{r.total}</b></p><p className="flex justify-between text-v-green"><span>Received</span><b>{r.received}</b></p></div>
                    <Bar pct={r.pct} color="#005220" className="mt-2 h-1.5" />
                    <p className="mt-2 text-[13px] text-ink-soft">{r.foot}</p>
                  </VCard>
                ))}
              </div>
            </section>
          </div>

          <VCard className="p-6">
            <div className="flex items-center justify-between"><p className="text-[14px] font-bold tracking-[0.1em] uppercase">Monthly Revenue Performance</p><p className="flex gap-5 text-[12px] font-semibold"><span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-v-bright" /> CURRENT MONTH</span><span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-v-green" /> PREVIOUS MONTH</span></p></div>
            <RevenueChart />
            <div className="mt-2 flex justify-between px-4 text-[13px] text-ink-soft">{["Week 1", "Week 2", "Week 3", "Week 4"].map((w) => <span key={w}>{w}</span>)}</div>
          </VCard>

          <section>
            <div className="flex items-center justify-between"><h2 className="text-[20px] font-semibold">Recent Settlement History</h2><Link href="#" className="flex items-center gap-1 text-[13px] font-semibold text-v-green"><Download className="size-3.5" /> Download All</Link></div>
            <div className="mt-4 space-y-4">
              {settlements.map((s) => (
                <VCard key={s.title} className="flex items-center gap-5 p-5">
                  <Image src={s.thumb} alt="" width={48} height={48} className="size-12 rounded-md object-cover" />
                  <div className="flex-1"><p className="text-[15px] font-semibold">{s.title}</p><p className="text-[13px] text-ink-soft">{s.meta}</p></div>
                  <span className={cn("rounded px-3 py-1 text-[11px] font-bold", s.status === "RELEASED" && "bg-[#cce2d4] text-v-deep", s.status === "PROCESSING" && "bg-v-orange-tint text-[#c2410c]", s.status === "FAILED" && "bg-[#f8e8e8] text-v-red")}>{s.status}</span>
                  <p className="w-[110px] text-right text-[18px] font-bold">{s.amount}</p>
                </VCard>
              ))}
            </div>
          </section>
        </div>

        <GreenRail className="rounded-none pb-12">
          <div className="rounded-xl bg-v-deep p-6 text-white">
            <p className="text-[12px] font-bold tracking-wide uppercase">Available For<br />Payout</p>
            <p className="mt-2 text-[34px] font-bold">₹40,000</p>
            <button type="button" className="mt-5 h-12 w-full rounded-lg bg-white text-[15px] font-bold text-v-deep">Withdraw Now</button>
          </div>
          <VCard className="p-6">
            <p className="text-[15px] font-semibold">Wallet Distribution</p>
            <div className="mt-6"><Donut /></div>
            <ul className="mt-6 space-y-2 text-[14px]">{wallet.parts.map((p) => <li key={p.label} className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: p.color }} /> {p.label}</span><b>{p.value}</b></li>)}</ul>
          </VCard>
          <VCard className="p-5">
            <div className="flex items-center justify-between"><p className="text-[15px] font-semibold">Next Scheduled Payout</p><Calendar className="size-4" /></div>
            <div className="mt-4 rounded-lg bg-v-panel p-4"><p className="text-[30px] leading-none font-bold">15 <span className="text-[16px]">Dec</span></p><p className="mt-2 text-[12px] text-ink-soft">Samsung Campaign<br />• ₹40,000</p></div>
          </VCard>
          <VCard className="p-5">
            <p className="text-[15px] font-semibold">Dedicated Account Manager</p>
            <div className="mt-4"><PersonRow avatar={accountManager.avatar} name={accountManager.name} role={accountManager.role} /></div>
            <div className="mt-4 grid grid-cols-[1fr_1.5fr] gap-3"><OutlineButton className="h-11"><Phone className="size-4" /> Call</OutlineButton><button type="button" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-v-bright text-[15px] font-semibold text-white"><MessageSquare className="size-4" /> WhatsApp</button></div>
          </VCard>
          <div>
            <p className="text-[15px] font-semibold">Payment Request Center</p>
            <div className="mt-3 space-y-3">{paymentRequests.map((r) => { const Icon = REQ_ICON[r.icon as keyof typeof REQ_ICON]; return <VCard key={r.label} className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md bg-v-chip text-v-deep"><Icon className="size-4" /></span><p className="text-[14px] font-semibold">{r.label}</p></VCard>; })}</div>
          </div>
          <ClipboardList className="hidden" />
        </GreenRail>
      </div>
    </>
  );
}
