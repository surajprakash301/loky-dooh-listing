"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { label: string; href: string };
const MENUS: { id: string; label: string; href?: string; items?: Item[] }[] = [
  { id: "dooh", label: "All DOOH", href: "/listing" },
  { id: "map", label: "Map", href: "/listing?view=map" },
  { id: "ai", label: "Loky AI", href: "/quote/new" },
  { id: "services", label: "Media Service's", items: [{ label: "Create a quotation", href: "/quote/new" }, { label: "My quotations", href: "/orders" }, { label: "Agency partners", href: "/agency/register" }] },
  { id: "resources", label: "Resources", items: [{ label: "Home", href: "/" }, { label: "Screen map", href: "/listing?view=map" }, { label: "Staff and vendor sign-in", href: "/login" }] },
];

function Chevron() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
      <path d="M4 6.2 8 10.2 12 6.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const view = useSearchParams().get("view");
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  const activeId = pathname === "/listing" ? (view === "map" ? "map" : "dooh") : pathname.startsWith("/billboard") ? "dooh" : pathname.startsWith("/quote") ? "ai" : null;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav ref={root} aria-label="Primary" className="scrollbar-hide flex min-w-0 flex-1 items-center gap-1 overflow-x-auto min-[1100px]:absolute min-[1100px]:left-1/2 min-[1100px]:w-max min-[1100px]:flex-none min-[1100px]:-translate-x-1/2 min-[1100px]:overflow-visible">
      {MENUS.map((m) => {
        const active = m.id === activeId;
        const cls = `flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-semibold leading-[1.2] transition-colors hover:bg-[#f3f5f7] ${active ? "text-lk" : "text-[#212121]"}`;
        if (!m.items) return <Link key={m.id} href={m.href!} aria-current={active ? "page" : undefined} className={cls}>{m.label}</Link>;
        const expanded = open === m.id;
        return (
          <div key={m.id} className="relative">
            <button type="button" className={cls} aria-expanded={expanded} onClick={() => setOpen(expanded ? null : m.id)}>
              <span>{m.label}</span>
              <Chevron />
            </button>
            {expanded && (
              <div role="menu" className="anim-pop absolute top-[calc(100%+6px)] left-0 z-40 min-w-[200px] rounded-xl border border-[#e7e7e7] bg-white p-1.5 shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
                {m.items.map((it) => (
                  <Link key={it.label} href={it.href} role="menuitem" className="block rounded-lg px-3 py-2 text-[13px] font-semibold text-[#212121] hover:bg-[#f3f5f7]" onClick={() => setOpen(null)}>
                    {it.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
