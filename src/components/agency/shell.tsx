import Link from "next/link";
import { Bell, Lock } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/site/logo";
import type { Agency } from "@/db";
import type { SessionPayload } from "@/lib/session";
import { formatMonthYear } from "@/lib/format";
import { fileUrl } from "@/services/files";
import { cn } from "@/lib/utils";
import { AgencyNav, type AgencyNavItem } from "./nav";

/** Sidebar items; everything but Dashboard and Settings stays locked until the partner assessment is done (restricted pre-assessment state). */
export const AGENCY_NAV: AgencyNavItem[] = [
  { href: "/agency", label: "Dashboard", sub: "Main overview", icon: "dashboard", exact: true, open: true },
  { href: "/agency/brands", label: "Brands", sub: "Manage brands", icon: "brands" },
  { href: "/agency/proposals", label: "Proposals", sub: "Visual pitch builder", icon: "proposals" },
  { href: "/agency/quotations", label: "Quotations", sub: "Commercial quotes", icon: "quotes" },
  { href: "/agency/campaigns", label: "Work Orders", sub: "Campaigns & payments", icon: "campaigns" },
  { href: "/agency/team", label: "Team Members", sub: "Manage employees", icon: "team" },
  { href: "/agency/screens", label: "Live Screens", sub: "Browse inventory", icon: "screens" },
  { href: "/agency/payments", label: "Payments", sub: "Ledger & wallet", icon: "payments" },
  { href: "/agency/settings", label: "Settings", sub: "Account", icon: "settings", open: true },
];

export function AgencyShell({ session, agency, stats, children }: { session: SessionPayload; agency: Agency; stats: { orders: number; activeCampaigns: number }; children: React.ReactNode }) {
  const partner = agency.status === "partner";
  const initials = agency.legalName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const logo = fileUrl(agency.logo);
  return (
    <div className="flex min-h-screen flex-col bg-white font-inter text-ink">
      <header className="flex h-[70px] items-center gap-6 border-b border-v-line bg-white px-6">
        <div className="w-[216px] shrink-0 pl-2"><Logo height={38} href="/agency" /></div>
        <nav className="flex h-10 items-center rounded-lg bg-v-panel p-1 text-[13px] font-semibold">
          <Link href="/agency" className="rounded-md bg-white px-4 py-1.5 text-v-deep shadow-sm">Agency Dashboard</Link>
          <Link href={partner ? "/agency/proposals/new" : "/agency/assessment"} className={cn("flex items-center gap-1.5 px-4 py-1.5 text-ink-soft", !partner && "opacity-70")}>{!partner && <Lock className="size-3.5" />} Create Media Order</Link>
        </nav>
        <div className="ml-auto flex items-center gap-5">
          <Bell className="size-5" />
          <span className="h-9 w-px bg-v-line" />
          <div className="text-right leading-tight">
            <p className="text-[14px] font-semibold">{session.name}</p>
            <p className="text-[11px] font-semibold tracking-wide text-v-green uppercase">{partner ? `Premium partner · ${Number(agency.commissionPct).toFixed(1)}%` : "Partner (pending)"}</p>
          </div>
          <span className="grid size-10 place-items-center rounded-full bg-v-deep text-[13px] font-bold text-white">{initials}</span>
          <form action={logoutAction}><button type="submit" className="text-[13px] text-ink-soft hover:underline">Sign out</button></form>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="flex w-[240px] shrink-0 flex-col border-r border-v-line bg-v-sidebar px-4 pt-4 pb-6">
          <div className="rounded-xl border border-v-line bg-white p-4">
            <div className="flex items-center gap-3">
              {logo ? <img src={logo} alt="" className="size-12 rounded-full object-cover" /> : <span className="grid size-12 place-items-center rounded-full bg-v-deep text-[15px] font-bold text-white">{initials}</span>}
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[15px] font-semibold">{agency.legalName}</p>
                <span className={cn("mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold whitespace-nowrap", partner ? "bg-v-chip text-v-deep" : "bg-amber-50 text-amber-700")}>{partner ? "Verified Partner agency" : "Verification pending"}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 border-t border-v-line pt-3 text-center">
              <div><p className="text-[10px] font-semibold tracking-wide text-v-muted">TOTAL ORDERS</p><p className="text-[15px] font-medium">{String(stats.orders).padStart(2, "0")}</p></div>
              <div><p className="text-[10px] font-semibold tracking-wide text-v-muted">ACTIVE ADS</p><p className="text-[15px] font-medium">{String(stats.activeCampaigns).padStart(2, "0")}</p></div>
            </div>
            <p className="mt-3 border-t border-v-line pt-2 text-center text-[10px] text-v-muted">{partner ? `Partner since ${formatMonthYear(agency.partnerSince)}` : `Registered ${formatMonthYear(agency.createdAt)}`}</p>
          </div>
          <AgencyNav items={AGENCY_NAV} unlocked={partner} />
          <div className="mt-auto flex flex-col gap-1 border-t border-v-line pt-4 text-[14px]">
            <Link href="/agency/settings" className="rounded-lg px-3 py-2.5 hover:bg-white">Support</Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}

export function AgencyPageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-v-line bg-white px-8 py-5">
      <div className="min-w-0"><h1 className="text-[26px] font-bold tracking-tight">{title}</h1>{subtitle && <p className="mt-0.5 text-[14px] text-ink-soft">{subtitle}</p>}</div>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
