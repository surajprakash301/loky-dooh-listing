"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/my/quotations", label: "Active quotations" },
  { href: "/my/orders", label: "Orders" },
];

export function MyTabs() {
  const path = usePathname();
  return (
    <nav className="mt-4 flex gap-6 border-b border-line text-[15px]">
      {TABS.map((t) => {
        const active = path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn("relative pb-3 font-medium", active ? "text-green" : "text-ink-soft hover:text-ink")}>
            {t.label}
            {active && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-green" />}
          </Link>
        );
      })}
    </nav>
  );
}
