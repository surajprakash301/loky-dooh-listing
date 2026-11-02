import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/site/logo";
import type { SessionPayload } from "@/lib/session";
import { cn } from "@/lib/utils";
import { PortalNav, type NavItem } from "./nav";

const ROLE_LABEL = { admin: "Admin", representative: "Representative", vendor: "Vendor", customer: "Customer", agency: "Agency owner", agency_member: "Agency team" } as const;

export function PortalShell({
  session,
  nav,
  title,
  children,
}: {
  session: SessionPayload;
  nav: NavItem[];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-v-sidebar font-inter text-ink">
      <header className="flex h-[64px] items-center gap-6 border-b border-v-line bg-white px-6">
        <Link href={nav[0]?.href ?? "/"} className="flex items-center gap-3">
          <Logo height={34} href={null} />
          <span className="hidden rounded-md bg-v-panel px-2 py-1 text-[11px] font-bold tracking-wide text-ink-soft uppercase sm:inline">{title}</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right leading-tight">
            <p className="text-[14px] font-semibold">{session.name}</p>
            <p className="text-[11px] font-semibold tracking-wide text-v-green uppercase">{ROLE_LABEL[session.role]}</p>
          </div>
          <span className="grid size-9 place-items-center rounded-full bg-v-deep text-[13px] font-bold text-white">
            {session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-soft hover:bg-v-panel" title="Sign out">
              <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[232px] shrink-0 border-r border-v-line bg-v-sidebar px-3 pt-4 md:block">
          <PortalNav items={nav} />
        </aside>
        <main className={cn("min-w-0 flex-1")}>{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, back }: { title: string; subtitle?: string; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-v-line bg-white px-6 py-5 md:px-8">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="text-[12.5px] font-medium text-v-green hover:underline">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-[24px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[14px] text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className, aside, id }: { title?: string; children: React.ReactNode; className?: string; aside?: React.ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-4 rounded-xl border border-v-line bg-white", className)}>
      {(title || aside) && (
        <div className="flex items-center gap-3 border-b border-v-line px-5 py-3.5">
          {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
          {aside && <div className="ml-auto">{aside}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
