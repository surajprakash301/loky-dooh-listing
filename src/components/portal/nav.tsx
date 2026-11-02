"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, LayoutList, PlusSquare, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { list: LayoutList, plus: PlusSquare, review: ClipboardCheck, users: Users };

export type NavItem = { href: string; label: string; sub?: string; icon: keyof typeof ICONS; exact?: boolean };

export function PortalNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 leading-tight", active ? "bg-v-green text-white" : "text-ink hover:bg-white")}
          >
            <Icon className="size-5 shrink-0" strokeWidth={1.8} />
            <span>
              <span className="block text-[14px] font-semibold">{item.label}</span>
              {item.sub && <span className={cn("block text-[11px]", active ? "text-white/75" : "text-v-muted")}>{item.sub}</span>}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
