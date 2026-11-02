"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banknote, Briefcase, FileText, LayoutDashboard, Lock, MonitorPlay, Receipt, Settings, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { dashboard: LayoutDashboard, brands: Briefcase, proposals: FileText, quotes: Receipt, campaigns: MonitorPlay, team: Users, screens: MonitorPlay, payments: Banknote, settings: Settings };
export type AgencyNavItem = { href: string; label: string; sub: string; icon: keyof typeof ICONS; exact?: boolean; open?: boolean };

export function AgencyNav({ items, unlocked }: { items: AgencyNavItem[]; unlocked: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="mt-4 flex flex-col gap-1 border-t border-v-line pt-4">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const locked = !unlocked && !item.open;
        const cls = cn("flex items-center gap-3 rounded-lg px-3 py-2.5 leading-tight", active ? "bg-v-green text-white" : locked ? "text-v-muted" : "text-ink hover:bg-white");
        const body = (
          <>
            <Icon className="size-5 shrink-0" strokeWidth={1.8} />
            <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">{item.label}</span><span className={cn("block text-[11px]", active ? "text-white/75" : "text-v-muted")}>{item.sub}</span></span>
            {locked && <Lock className="size-3.5 shrink-0" />}
          </>
        );
        return locked ? <Link key={item.href} href="/agency/assessment" title="Unlocks after the partner assessment" className={cls}>{body}</Link> : <Link key={item.href} href={item.href} className={cls}>{body}</Link>;
      })}
    </nav>
  );
}
