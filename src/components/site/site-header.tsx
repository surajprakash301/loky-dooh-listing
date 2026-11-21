import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Bell, ChevronDown, Grip } from "lucide-react";
import { AdvertiserLogin } from "@/components/auth/advertiser-login";
import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/site/logo";
import { getSession } from "@/lib/server/auth";
import { homeFor } from "@/lib/session";
import { cn } from "@/lib/utils";

type Variant = "listing" | "detail" | "home";

const NAV: Record<Variant, { label: string; href: string; caret?: boolean; active?: boolean; upper?: boolean }[]> = {
  listing: [
    { label: "LOKY LUME", href: "/listing" },
    { label: "MAP", href: "/listing?view=map" },
    { label: "LOKY AI", href: "#" },
    { label: "Media Service's", href: "#", caret: true },
    { label: "Resources", href: "#", caret: true },
  ],
  detail: [
    { label: "All DOOH", href: "/listing", caret: true, active: true },
    { label: "Map", href: "/listing?view=map" },
    { label: "Loky AI", href: "#" },
    { label: "Media Service's", href: "#", caret: true },
    { label: "Resources", href: "#", caret: true },
  ],
  home: [
    { label: "Loky LUME", href: "/listing" },
    { label: "Map", href: "/listing?view=map" },
    { label: "Loky AI", href: "#" },
    { label: "Media Service's", href: "#", caret: true },
    { label: "Resources", href: "#", caret: true },
  ],
};

export async function SiteHeader({ variant = "listing", className }: { variant?: Variant; className?: string }) {
  const home = variant === "home";
  const session = await getSession();
  const pendingCode = session ? null : ((await cookies()).get("loky_otp_uid")?.value ? ((await cookies()).get("loky_dev_otp")?.value ?? "") : null);
  const initials = session ? session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "SP";
  return (
    <header
      className={cn(
        home ? "absolute inset-x-0 top-0 z-30 text-white" : "bg-white border-b border-line text-ink",
        className,
      )}
    >
      <div className="mx-auto flex h-[60px] max-w-[1512px] items-center justify-between px-8">
        <Logo light={home} height={home ? 36 : 34} />

        <nav
          className={cn(
            "hidden items-center md:flex",
            variant === "listing" ? "gap-6 text-[13px] font-bold" : "gap-7 text-[15px] font-medium",
          )}
        >
          {NAV[variant].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1 whitespace-nowrap",
                item.active && "text-green underline decoration-green underline-offset-4",
              )}
            >
              {item.label}
              {item.caret && <ChevronDown className="size-4" strokeWidth={2.2} />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {home && (
            <>
              <Bell className="size-5" />
              <Grip className="size-5" />
            </>
          )}
          {session ? (
            <>
              {session.role === "customer" && (
                <Link href="/orders" className={cn("inline-flex h-9 items-center rounded-full border px-4 text-[14px] font-semibold", home ? "border-white/60 text-white" : "border-ink/40 text-ink hover:border-green hover:text-green")} data-testid="orders-link">
                  Orders
                </Link>
              )}
              <Link href={session.role === "customer" ? "/orders" : homeFor(session.role)} className="flex items-center gap-2" title={session.role === "customer" ? "Your orders" : "Open your portal"}>
                <span className={cn("grid size-8 place-items-center rounded-full border text-[12px] font-bold", home ? "border-white/60 bg-white/20 text-white" : "border-green bg-green/15 text-green")}>{initials}</span>
                <span className={cn("hidden text-[15px] font-medium sm:inline", home && "text-[14px]")}>{session.name.split(" ")[0]}</span>
              </Link>
              <form action={logoutAction}>
                <button type="submit" className={cn("text-[14px] font-medium opacity-80 hover:opacity-100", home && "text-[13px]")}>Sign out</button>
              </form>
            </>
          ) : (
            <>
              {home ? (
                <span className="size-8 rounded-full bg-[url('/img/stat-3.jpg')] bg-cover bg-center ring-2 ring-white/60" />
              ) : (
                <span className="grid size-8 place-items-center rounded-full border border-coral bg-coral/15 text-[12px] font-bold text-coral">SP</span>
              )}
              <Suspense fallback={<span className={cn("text-[17px] font-medium", home && "text-[15px]")}>login/ signup</span>}>
                <AdvertiserLogin pendingCode={pendingCode} light={home} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
