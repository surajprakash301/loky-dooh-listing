"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CircleHelp,
  LayoutDashboard,
  Layers,
  Megaphone,
  Armchair,
  Banknote,
  Images,
  Sparkles,
  LogOut,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { logoutAction } from "@/actions/auth";
import { vendorNav } from "@/lib/vendor-data";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  screens: Layers,
  campaigns: Megaphone,
  slots: Armchair,
  earnings: Banknote,
  media: Images,
  analytics: Sparkles,
} as const;

export type VendorProfile = {
  name: string;
  badge: string;
  avatar: string;
  screens: string;
  activeAds: string;
  since: string;
  user: { name: string; role: string; avatar: string };
};

export function VendorTopbar({ profile }: { profile: VendorProfile }) {
  const u = profile.user;
  return (
    <header className="flex h-[70px] items-center gap-6 border-b border-v-line bg-white px-6">
      <div className="w-[216px] shrink-0 pl-2">
        <Logo height={38} />
      </div>
      <label className="flex h-10 w-[440px] items-center gap-3 rounded-lg bg-[#f3f4f6] px-4 text-[14px] text-v-muted">
        <Search className="size-4 text-ink" />
        <input placeholder="Search ecosystem..." className="w-full bg-transparent outline-none placeholder:text-v-muted" />
      </label>
      <div className="ml-auto flex items-center gap-5">
        <button type="button" aria-label="Notifications" className="relative text-ink">
          <Bell className="size-5" />
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <span className="h-9 w-px bg-v-line" />
        <div className="text-right leading-tight">
          <p className="text-[14px] font-medium">{u.name}</p>
          <p className="text-[10px] font-bold tracking-[0.12em] text-v-green uppercase">{u.role}</p>
        </div>
        <Image
          src={u.avatar}
          alt={u.name}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover ring-2 ring-v-mint/70"
        />
      </div>
    </header>
  );
}

export function VendorSidebar({ profile }: { profile: VendorProfile }) {
  const pathname = usePathname();
  const p = profile;
  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-v-line bg-v-sidebar px-4 pt-4 pb-6">
      <div className="rounded-xl border border-v-line bg-white p-4">
        <div className="flex items-center gap-3">
          <Image src={p.avatar} alt="" width={48} height={48} className="size-12 rounded-full object-cover" />
          <div className="leading-tight">
            <p className="text-[15px] font-semibold">{p.name}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-v-chip px-2 py-0.5 text-[9px] font-semibold whitespace-nowrap text-v-deep">
              <ShieldCheck className="size-3" /> {p.badge}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 border-t border-v-line pt-3 text-center">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-v-muted">SCREENS</p>
            <p className="text-[15px] font-medium">{p.screens}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-v-muted">ACTIVE ADS</p>
            <p className="text-[15px] font-medium">{p.activeAds}</p>
          </div>
        </div>
        <p className="mt-3 border-t border-v-line pt-2 text-center text-[10px] text-v-muted">{p.since}</p>
      </div>

      <nav className="mt-4 flex flex-col gap-1 border-t border-v-line pt-4">
        {vendorNav.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 leading-tight",
                active ? "bg-v-green text-white" : "text-ink hover:bg-white",
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.8} />
              <span>
                <span className="block text-[14px] font-semibold">{item.label}</span>
                <span className={cn("block text-[11px]", active ? "text-white/75" : "text-v-muted")}>{item.sub}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-v-line pt-4">
        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] hover:bg-white">
          <CircleHelp className="size-5" strokeWidth={1.8} /> Support
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] hover:bg-white">
            <LogOut className="size-5" strokeWidth={1.8} /> Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
