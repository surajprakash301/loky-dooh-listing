import Link from "next/link";
import { ArrowRight, Briefcase, Lock, Megaphone, PlayCircle, ShoppingCart, Sparkles, Wallet } from "lucide-react";
import { AgencyPageHeader } from "@/components/agency/shell";
import { Notice } from "@/components/portal/form";
import { formatDateTime, formatINR } from "@/lib/format";
import { dashboardStats, listBrands } from "@/services/agency";
import { loadAgencyPage } from "@/services/agency-page";
import { listCampaigns } from "@/services/deals";
import { cn } from "@/lib/utils";

export default async function AgencyDashboard(props: PageProps<"/agency">) {
  const { s, a } = await loadAgencyPage();
  const sp = await props.searchParams;
  const partner = a.status === "partner";
  const [stats, brands, campaigns] = await Promise.all([dashboardStats(a.id), listBrands(a.id), listCampaigns(a.id)]);
  const firstName = s.name.split(" ")[0];
  const kpis = [
    { label: "Active campaigns", value: stats.activeCampaigns, icon: Megaphone, foot: stats.activeCampaigns ? "Running now" : "Launch your first order" },
    { label: "Brands managed", value: stats.brands, icon: Briefcase, foot: stats.brands ? "Stable portfolio" : "Add your first brand" },
    { label: "Media orders", value: stats.orders, icon: ShoppingCart, foot: stats.pendingApprovals ? `${stats.pendingApprovals} awaiting payment` : "All settled", warn: stats.pendingApprovals > 0 },
    { label: "Total spend", value: formatINR(stats.totalSpend), icon: Wallet, foot: stats.wallet ? `Wallet ${formatINR(stats.wallet)}` : "No payouts yet" },
  ];
  const checklist = [
    { label: "Add your first brand", done: stats.brands > 0, href: "/agency/brands/new", body: "Set up client profiles to begin booking media inventory." },
    { label: "Invite your team", done: (a.members?.length ?? 0) > 1, href: "/agency/team", body: "Collaborate with account managers and creative directors." },
    { label: "Explore billboard inventory", done: false, href: "/agency/screens", body: "Browse live DOOH locations across the network." },
    { label: "Create first media order", done: stats.orders > 0, href: "/agency/proposals/new", body: "Build a visual pitch, quote it, lock the campaign." },
  ];
  return (
    <>
      <AgencyPageHeader title={`Welcome to LOKY Media, ${a.legalName}! 👋`} subtitle={partner ? "Your agency workspace is fully unlocked. Here's what's happening." : "Your workspace is in restricted mode until the partner assessment is complete."} actions={partner ? <Link href="/agency/proposals/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-v-deep px-5 text-[14px] font-semibold text-white">Create Media Order <ArrowRight className="size-4" /></Link> : undefined} />
      <div className="grid gap-6 px-8 py-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {sp.welcome && <Notice tone="success">Verification successful, {firstName}. Your agency workspace is ready.</Notice>}
          {!partner && (
            <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#005220_0%,#1f6b3a_55%,#56a868_100%)] p-8 text-white">
              <p className="text-[12px] font-semibold tracking-wide text-v-lime uppercase">⭐ Exclusive partnership</p>
              <h2 className="mt-2 max-w-[560px] text-[26px] leading-tight font-bold">Start earning with Loky Lume — a single-shop solution for DOOH</h2>
              <p className="mt-2 max-w-[560px] text-[14px] text-white/80">Book screens at wholesale rates, add your markup and earn fixed bonus incentives. Complete the 3-minute partner diagnostic to unlock 7.5–10 % dynamic commission, the ₹2,500 first-deal bonus, AI mockups and co-branded quotations.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/agency/assessment" className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-[14px] font-bold text-v-deep">Register & Analyze Brand Now <ArrowRight className="size-4" /></Link>
                <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/50 px-5 text-[14px]"><PlayCircle className="size-4" /> Watch 2-min explainer</span>
              </div>
              <ol className="mt-6 grid gap-3 text-[12.5px] sm:grid-cols-4">
                {["Finish the onboarding diagnostic (~3 mins)", "Unlock Loky AI Studio & dynamic commission", "Run client creatives & generate branded quotes", "Lock your first order and claim ₹2,500 cash"].map((t, i) => <li key={t} className="rounded-lg bg-white/10 px-3 py-2"><b>Step {i + 1}:</b> {t}</li>)}
              </ol>
            </section>
          )}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-v-line p-4">
                <div className="flex items-center justify-between"><p className={cn("text-[11px] font-bold tracking-wide uppercase", k.warn ? "text-v-orange" : "text-ink")}>{k.label}</p><span className="grid size-9 place-items-center rounded-lg bg-v-chip text-v-deep"><k.icon className="size-4" /></span></div>
                <p className="mt-4 text-[28px] leading-none font-bold">{typeof k.value === "number" ? String(k.value).padStart(2, "0") : k.value}</p>
                <p className={cn("mt-3 text-[11.5px] font-medium", k.warn ? "text-v-orange" : "text-v-green")}>{k.foot}</p>
              </div>
            ))}
          </div>
          {campaigns.length === 0 ? (
            <section>
              <div className="flex items-center justify-between"><h2 className="text-[15px] font-bold">Get Started</h2><span className="rounded-full bg-v-chip px-2 py-0.5 text-[11px] font-semibold text-v-deep">{Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)}% complete</span></div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {checklist.map((c) => (
                  <div key={c.label} className={cn("rounded-xl border border-v-line p-4", c.done && "bg-v-tint")}>
                    <p className="text-[15px] font-semibold">{c.done ? "✓ " : ""}{c.label}</p>
                    <p className="mt-1 text-[13px] text-ink-soft">{c.body}</p>
                    <Link href={partner || c.href.startsWith("/agency/brands") || c.href === "/agency/team" ? c.href : "/agency/assessment"} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-v-green">{partner ? "Open" : "Unlock"} <ArrowRight className="size-3.5" /></Link>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div className="flex items-center justify-between"><h2 className="text-[15px] font-bold">Active campaign snapshot</h2><Link href="/agency/campaigns" className="text-[13px] font-semibold text-v-green">View all →</Link></div>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                {campaigns.slice(0, 3).map((c) => (
                  <Link key={c.id} href={`/agency/campaigns/${c.id}`} className="rounded-xl border border-v-line p-4 hover:bg-v-tint">
                    <p className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">{c.brand?.name}</p>
                    <p className="mt-1 truncate text-[15px] font-semibold">{c.title}</p>
                    <p className="mt-2 text-[12.5px] text-ink-soft">{c.screens?.length} screens · {formatINR(c.total)} · <span className={c.status === "active" ? "text-v-green" : c.status === "pending_payment" ? "text-v-orange" : "text-ink"}>{c.status.replace("_", " ")}</span></p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-v-line p-4"><p className="text-[11px] font-bold tracking-wide text-v-muted uppercase">Dedicated support</p><p className="mt-2 text-[14px] font-semibold">David Chen <span className="font-normal text-ink-soft">· Key Account Manager</span></p><p className="mt-1 text-[12.5px] text-ink-soft">{a.expertCallbackDueAt && a.expertCallbackDueAt > new Date() ? `Expert callback within the hour (by ${formatDateTime(a.expertCallbackDueAt)}).` : "WhatsApp or call for help with margins and pipelines."}</p></div>
          <div className="rounded-xl border border-v-line p-4">
            <p className="text-[11px] font-bold tracking-wide text-v-muted uppercase">Top brands</p>
            <ul className="mt-2 divide-y divide-v-line">{brands.slice(0, 4).map((b) => <li key={b.id} className="flex items-center justify-between py-2 text-[13.5px]"><Link href={`/agency/brands/${b.id}`} className="font-medium hover:underline">{b.name}</Link><span className="text-ink-soft">{b.campaigns?.length ?? 0} orders</span></li>)}{brands.length === 0 && <li className="py-2 text-[13px] text-v-muted">No brands yet.</li>}</ul>
            <Link href="/agency/brands/new" className="mt-2 inline-block text-[13px] font-semibold text-v-green">⊕ Add new brand</Link>
          </div>
          <div className="rounded-xl border border-v-line p-4">
            <p className="text-[11px] font-bold tracking-wide text-v-muted uppercase">Recent activity</p>
            <ul className="mt-2 space-y-2 text-[12.5px]">{stats.recent.map((r) => <li key={r.id}><p className="font-medium">{r.message}</p><p className="text-v-muted">{formatDateTime(r.createdAt)}</p></li>)}{stats.recent.length === 0 && <li className="text-v-muted">No activity logged.</li>}</ul>
          </div>
          {partner && <div className="rounded-xl bg-v-deep p-4 text-white"><p className="flex items-center gap-2 text-[14px] font-bold"><Sparkles className="size-4" /> Level {a.level} partner · {Number(a.commissionPct).toFixed(1)} %</p><p className="mt-1 text-[12.5px] text-white/80">{a.level < 2 ? "You are 1 order away from Level 2: +2.5 % commission and ₹2,500 wallet bonus on your first confirmed campaign." : "Level 2 unlocked. Commission boost applied."}</p></div>}
          {!partner && <div className="rounded-xl border border-dashed border-v-line p-4 text-[12.5px] text-ink-soft"><Lock className="mb-1 size-4" /> Proposals, quotations, work orders, live screens and payments unlock after the assessment.</div>}
        </aside>
      </div>
    </>
  );
}
