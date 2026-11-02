import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Eye,
  FileInput,
  Hourglass,
  Layers,
  ListChecks,
  Megaphone,
  Monitor,
  MonitorPlay,
  PlayCircle,
  PlusSquare,
  Rocket,
  Search,
  ShieldCheck,
  SquareCheck,
  TrendingUp,
  Upload,
  Wallet,
  Zap,
} from "lucide-react";
import { VendorStatusBanner } from "@/components/vendor/status-banner";
import { VCard } from "@/components/vendor/ui";
import { loadMyVendor } from "@/services/vendor-portal";
import { Bar, ContactButtons, PersonRow, GreenRail } from "@/components/vendor/widgets";
import { campaignOrder } from "@/lib/vendor-data";
import { fileUrl } from "@/services/files";
import {
  comingSoon,
  demandOptions,
  learning,
  orderJourney,
  quickActions,
} from "@/lib/vendor-data-2";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard — Loky Media Vendor" };

const STAT_ICON = { monitor: Monitor, megaphone: Megaphone, play: PlayCircle, wallet: Wallet, alert: AlertCircle } as const;
const JOURNEY_ICON = { search: Search, "check-square": SquareCheck, monitor: MonitorPlay, list: ListChecks, rocket: Rocket, upload: Upload, wallet: Wallet } as const;
const ACTION_ICON = { receive: FileInput, screens: Layers, upload: Upload, trend: TrendingUp, expand: PlusSquare } as const;
const LEARN_ICON = { orders: ClipboardList, book: BookOpen } as const;

function RequestListing({ className, small }: { className?: string; small?: boolean }) {
  return (
    <Link
      href="/vendor/screens"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-v-deep font-semibold text-white",
        small ? "h-10 px-5 text-[13px]" : "h-12 px-6 text-[14px]",
        className,
      )}
    >
      <PlusSquare className="size-4" /> Request New Listing <ChevronRight className="size-4" />
    </Link>
  );
}

export default async function DashboardPage() {
  const { s, v } = await loadMyVendor();
  const firstName = s.name.split(" ")[0];
  const boards = v.billboards ?? [];
  const approved = boards.filter((b) => b.status === "approved");
  const live = approved.filter((b) => b.liveStatus === "live");
  const flagged = (v.reviewSections ?? []).filter((r) => r.status === "changes_requested").length;
  const pad = (n: number) => String(n).padStart(2, "0");
  const dashboardStats = [
    { icon: "monitor", label: "Active Screens", value: pad(live.length), of: `/${pad(boards.length)}`, foot: approved.length === boards.length ? "All screens approved" : `${boards.length - approved.length} awaiting review`, footTone: approved.length === boards.length ? "green" : "orange" },
    { icon: "megaphone", label: "Campaign Requests/Order", value: "00", unit: "Orders", foot: "Waiting for First Order", footTone: "orange", labelTone: "orange" },
    { icon: "play", label: "Running Campaigns", value: "00", foot: "Active now", footTone: "green" },
    { icon: "wallet", label: "Monthly Earnings", value: "₹00", unit: ".00", foot: "No payouts yet", footTone: "plain" },
    { icon: "alert", label: "Pending Actions", value: pad(flagged), foot: flagged ? "Changes requested by Loky" : "Nothing pending", footTone: flagged ? "orange" : "plain" },
  ] as const;
  const readiness = [
    { label: "Profile Verified", done: v.status === "approved" },
    { label: "Inventory Approved", done: approved.length > 0 },
    { label: "Marketplace Published", done: live.length > 0 },
    { label: "First Campaign order", done: false },
    { label: "First Campaign Completed", done: false },
  ];
  const accountPct = Math.round((readiness.filter((r) => r.done).length / readiness.length) * 100);
  return (
    <>
      <div className="flex items-center justify-between border-b border-v-line bg-white px-8 py-5">
        <div>
          <h1 className="text-[22px] font-bold">
            Welcome to LOKY MEDIA DOOH PLATFORM <span className="font-normal">{firstName}</span>👋
          </h1>
          <p className="mt-1 text-[14px] text-ink-soft">Here&apos;s your network performance overview for today.</p>
        </div>
        <RequestListing />
      </div>

      <VendorStatusBanner v={v} />

      <div className="px-8 pt-6">
        {/* banner */}
        <div className="relative flex h-[210px] overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#005220_0%,#1f6b3a_55%,#56a868_100%)] p-8 text-white">
          <div className="relative z-10 max-w-[420px]">
            <p className="text-[24px] leading-tight text-v-lime">Available For Advertisers And Agencies To Discover.</p>
            <p className="mt-2 text-[14px] italic text-white/70">Add more screens to increase</p>
            <button type="button" className="mt-5 inline-flex h-12 items-center gap-2 rounded-lg border border-white/60 bg-v-deep/60 px-5 text-[15px] font-semibold">
              Request New Listing <PlusSquare className="size-4" />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-[22%] w-[45%] rounded-full bg-white/5 blur-2xl" />
          <div className="absolute right-10 bottom-0 w-[340px]">
            <Image src="/img/vendor/banner-billboard.jpg" alt="" width={340} height={110} className="h-[110px] w-full rounded-md border-[3px] border-[#222] object-cover" />
            <div className="mx-auto flex w-[70%] justify-between">
              <span className="h-10 w-4 bg-[#2b2b2b]" />
              <span className="h-10 w-4 bg-[#2b2b2b]" />
            </div>
          </div>
          <div className="absolute bottom-3 left-1/2 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => <span key={i} className={cn("size-1.5 rounded-full bg-white/40", i === 0 && "bg-white")} />)}
          </div>
        </div>

        {/* stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-6">
          {dashboardStats.map((s) => {
            const Icon = STAT_ICON[s.icon];
            return (
              <VCard key={s.label} className="p-4">
                <div className="flex items-center gap-3">
                  <span className={cn("grid size-9 place-items-center rounded-lg", "labelTone" in s ? "bg-v-orange-tint text-v-orange" : "bg-v-chip text-v-deep")}>
                    <Icon className="size-4" />
                  </span>
                  <p className={cn("text-[11px] leading-tight font-bold uppercase", "labelTone" in s ? "text-v-orange" : "text-ink")}>{s.label}</p>
                </div>
                <p className="mt-5 text-[26px] leading-none font-bold text-v-green">
                  {s.value}
                  {"of" in s && <span className="text-[16px] text-ink-soft">{s.of}</span>}
                  {"unit" in s && <span className="ml-1 text-[14px] text-ink">{s.unit}</span>}
                </p>
                <p className={cn("mt-4 flex items-center gap-1 text-[11px] font-medium", s.footTone === "green" && "text-v-green", s.footTone === "orange" && "text-v-orange")}>
                  {s.footTone !== "plain" && <TrendingUp className="size-3" />}
                  {s.foot}
                </p>
              </VCard>
            );
          })}
          <div className="rounded-xl bg-v-pale p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-v-deep" />
              <p className="text-[11px] leading-tight font-bold uppercase">Account Status</p>
            </div>
            <p className="mt-5 text-[26px] leading-none font-bold">{accountPct}%</p>
            <p className="mt-4 text-[14px]">{v.status === "approved" ? "Verified Vendor" : "Verification in progress"}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid xl:grid-cols-[1fr_320px]">
        {/* main column */}
        <div className="space-y-6 px-8 pb-10">
          <VCard className="p-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[15px] font-bold">My Screen Network</h2>
              <Link href="/vendor/screens" className="flex items-center gap-1 text-[13px] font-semibold text-v-green">Manage All <ArrowRight className="size-3.5" /></Link>
            </div>

            {boards.length === 0 && <p className="mt-4 rounded-xl border border-dashed border-v-line p-6 text-center text-[13px] text-ink-soft">No screens registered yet.</p>}
            {boards.slice(0, 3).map((b) => {
              const cover = b.media?.find((m) => m.isCover) ?? b.media?.[0];
              const url = fileUrl(cover?.file);
              const isLive = b.status === "approved" && b.liveStatus === "live";
              const badge = b.status === "approved" ? (b.liveStatus ?? "approved").toUpperCase() : b.status === "changes_requested" ? "CHANGES REQUESTED" : b.status === "rejected" ? "REJECTED" : "UNDER REVIEW";
              return (
                <div key={b.id} className={cn("mt-3 rounded-xl border border-v-line p-3", !isLive && "text-ink-soft")}>
                  <div className="flex gap-4">
                    <div className="relative h-[108px] w-[200px] shrink-0 overflow-hidden rounded-lg bg-v-panel">
                      {url && <Image src={url} alt="" fill sizes="200px" className={cn("object-cover", !isLive && "grayscale")} unoptimized />}
                      <span className={cn("absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-white", isLive ? "bg-v-deep" : "bg-[#6b6b6b]")}>{isLive && <span className="size-1 rounded-full bg-v-bright" />} {badge}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[16px] font-semibold text-ink">{b.name}</p>
                          <p className="text-[12px]">{b.locality}, {b.city} · #{b.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold tracking-wide uppercase">Slot Occupancy</p>
                          <p className="flex items-center justify-end gap-2 text-[14px] font-semibold text-v-green">0/{b.slotsPerLoop} Fill <Bar pct={0} className="w-14" /></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 border-t border-v-line pt-3 pl-[216px]">
                    <div className="mr-auto">
                      <p className="text-[9px] font-bold tracking-wide uppercase">Loop Time</p>
                      <p className="text-[13px] font-semibold text-ink">{b.loopSeconds} Seconds</p>
                    </div>
                    <Link href="/vendor/screens" className="h-8 rounded-md bg-v-filter px-3 text-[12px] leading-8 font-semibold text-ink">Manage</Link>
                    {b.status === "approved" && <Link href={`/billboard/${b.code}`} target="_blank" aria-label="View listing" className="grid size-8 place-items-center rounded-md bg-v-filter text-ink"><Eye className="size-4" /></Link>}
                  </div>
                </div>
              );
            })}

            <div className="mt-4 flex justify-center"><RequestListing small /></div>
          </VCard>

          <section>
            <h2 className="text-[15px] font-bold">How Campaign Orders Work</h2>
            <VCard className="mt-3 flex items-center justify-between px-6 py-5">
              {orderJourney.map((j, i) => {
                const Icon = JOURNEY_ICON[j.icon as keyof typeof JOURNEY_ICON];
                return (
                  <div key={j.label} className="flex items-center gap-4">
                    <div className="flex w-[78px] flex-col items-center text-center">
                      <span className={cn("grid size-11 place-items-center rounded-full border", j.active ? "border-v-green bg-v-chip text-v-green" : j.done ? "border-v-mint bg-v-pale text-v-green" : "border-v-line bg-v-panel text-ink")}>
                        <Icon className="size-4" />
                      </span>
                      <p className={cn("mt-2 text-[10px] leading-tight font-semibold whitespace-pre-line", (j.active || j.done) && "text-v-green")}>{j.label}</p>
                    </div>
                    {i < orderJourney.length - 1 && <ArrowRight className="size-4 text-ink-soft/60" />}
                  </div>
                );
              })}
            </VCard>
            <div className="mt-4 grid grid-cols-5 gap-4">
              {quickActions.map((a) => {
                const Icon = ACTION_ICON[a.icon as keyof typeof ACTION_ICON];
                return (
                  <button key={a.label} type="button" className="rounded-xl bg-v-panel p-4 text-left">
                    <Icon className="size-5 text-v-deep" />
                    <p className="mt-6 text-[14px] leading-snug whitespace-pre-line">{a.label}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <VCard className="p-4">
            <h2 className="text-[15px] font-bold">Upcoming Orders</h2>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-v-line p-5">
              <div className="flex gap-3">
                <span className="relative grid size-9 place-items-center rounded-lg border border-v-line"><Layers className="size-4" /><span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-v-orange" /></span>
                <div>
                  <p className="text-[20px] font-bold">Awaiting for First Campaign!</p>
                  <p className="mt-1 text-[13px] leading-snug text-ink-soft">Campaign requests will appear here<br />once advertisers select your inventory<br />in the marketplace.</p>
                </div>
              </div>
              <button type="button" className="h-10 rounded-lg border border-v-line px-5 text-[14px] font-semibold">Watch Demo</button>
            </div>
          </VCard>
        </div>

        {/* right rail */}
        <GreenRail className="pb-10">
          <VCard className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold tracking-wide uppercase">Readiness Checklist</p>
              <span className="grid size-10 place-items-center rounded-full border-[3px] border-v-deep border-r-v-line text-[10px] font-bold">60%</span>
            </div>
            <ul className="mt-4 space-y-3">
              {readiness.map((r) => (
                <li key={r.label} className={cn("flex items-center gap-3 text-[14px]", r.done ? "text-v-green" : "text-ink-soft")}>
                  {r.done ? <CheckCircle2 className="size-4" /> : <CircleDot className="size-4 opacity-50" />} {r.label}
                </li>
              ))}
            </ul>
            <div className="-mx-5 -mb-5 mt-5 space-y-5 rounded-b-xl bg-[linear-gradient(180deg,#3c8052,#56a868)] p-5 text-white">
              <div className="flex items-center gap-3"><Rocket className="size-5" /><div><p className="text-[12px] font-bold uppercase">Inventory Live</p><p className="text-[13px] text-v-lime">Listing Published</p></div></div>
              <div className="flex items-center gap-3"><Hourglass className="size-5" /><div><p className="text-[12px] font-bold uppercase">Expected First Order</p><p className="text-[13px] text-v-lime">7-14 Days</p></div></div>
            </div>
          </VCard>

          <VCard className="p-5">
            <p className="text-[12px] font-bold tracking-wide uppercase">Dedicated Support</p>
            <div className="mt-4"><PersonRow avatar={campaignOrder.support.avatar} name={campaignOrder.support.name} role={campaignOrder.support.role} /></div>
            <p className="mt-4 text-[11px] italic text-ink-soft">&quot;I&apos;ll help you activate your inventory and receive your first campaign order.&quot;</p>
            <div className="mt-4"><ContactButtons stacked /></div>
            <button type="button" className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-v-deep text-[14px] font-semibold text-white"><Calendar className="size-4" /> Book OnboardingCall</button>
          </VCard>

          <div className="rounded-xl bg-v-charcoal p-5 text-white">
            <p className="text-[12px] font-bold tracking-wide uppercase">Estimated Earnings &apos;24</p>
            <p className="mt-3 text-[16px] font-bold">₹0.00<span className="text-[11px] font-normal text-white/60">/inactive</span></p>
            <p className="mt-3 text-[11px] text-white/70">Start running campaigns to generate revenue. Your payout balance will appear here.</p>
            <button type="button" className="mt-4 h-9 w-full rounded-md bg-white/15 text-[12px] font-semibold">How Payments Work</button>
          </div>

          <div>
            <div className="flex items-center justify-between"><p className="text-[12px] font-bold tracking-wide uppercase">Learning Center</p><span className="text-[10px] font-bold">VIEW ALL</span></div>
            <div className="mt-3 space-y-3">
              {learning.map((l) => { const Icon = LEARN_ICON[l.icon as keyof typeof LEARN_ICON]; return (
                <VCard key={l.title} className="flex items-center gap-3 p-4"><Icon className="size-5 text-v-deep" /><div><p className="text-[14px] font-semibold">{l.title}</p><p className="text-[11px] text-ink-soft">{l.sub}</p></div></VCard>
              ); })}
            </div>
          </div>

          <div>
            <p className="text-[12px] font-bold tracking-wide uppercase">Choose the Desired Options</p>
            <p className="text-[14px]">what are the</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {demandOptions.map((d) => (
                <VCard key={d.label} className="p-4 text-center"><p className="text-[15px] font-semibold">{d.label}</p><p className={cn("mt-2 text-[14px] font-semibold", d.tone === "orange" ? "text-v-orange" : "text-v-green")}>{d.level}</p></VCard>
              ))}
            </div>
            <button type="button" className="mt-3 h-11 w-full rounded-lg bg-v-pale text-[14px] font-semibold text-v-deep">View Opportunities</button>
          </div>

          <div className="overflow-hidden rounded-xl bg-v-night text-white">
            <div className="relative h-[100px]"><Image src="/img/vendor/edge-v2.jpg" alt="" fill sizes="320px" className="object-cover opacity-80" /></div>
            <div className="p-4"><p className="text-[10px] font-bold text-v-lime">COMING SOON</p><p className="text-[13px] font-bold">LOKY EDGE V2.0 ECOSYSTEM</p><p className="text-[11px] text-white/70">Pre-order for early priority access.</p></div>
          </div>
          <div>
            <p className="text-[12px] font-bold tracking-wide uppercase">Coming Soon</p>
            <ul className="mt-3 space-y-2 text-[14px] text-ink">{comingSoon.map((c) => <li key={c} className="flex items-center gap-2"><Zap className="size-3.5" /> {c}</li>)}</ul>
          </div>
        </GreenRail>
      </div>
    </>
  );
}
