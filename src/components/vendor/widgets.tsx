import Image from "next/image";
import { MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontal rounded progress bar. */
export function Bar({
  pct,
  color = "#007a3e",
  track = "#e5e7eb",
  className,
}: {
  pct: number;
  color?: string;
  track?: string;
  className?: string;
}) {
  return (
    <span className={cn("block h-2 w-full overflow-hidden rounded-full", className)} style={{ background: track }}>
      <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </span>
  );
}

/** Pill-style slot allocation (n filled of total). */
export function SlotPills({
  used,
  total,
  color = "#007a3e",
  size = "md",
}: {
  used: number;
  total: number;
  color?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn("rounded-full", size === "md" ? "h-3 w-7" : "h-2 w-5")}
          style={{ background: i < used ? color : "#dfe6dc" }}
        />
      ))}
    </span>
  );
}

export function StatusDot({ tone = "green", label }: { tone?: "green" | "red" | "white"; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase",
        tone === "green" && "bg-v-bright text-v-deep",
        tone === "red" && "bg-v-red text-white",
        tone === "white" && "bg-v-deep text-white",
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone === "green" ? "bg-v-deep" : "bg-white")} />
      {label}
    </span>
  );
}

export function PersonRow({
  avatar,
  name,
  role,
  size = 48,
}: {
  avatar: string;
  name: string;
  role: string;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <Image src={avatar} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />
      <div className="leading-tight">
        <p className="text-[15px] font-semibold">{name}</p>
        <p className="text-[13px] text-ink-soft">{role}</p>
      </div>
    </div>
  );
}

export function ContactButtons({ stacked = false }: { stacked?: boolean }) {
  return (
    <div className={cn("grid gap-3", stacked ? "grid-cols-1" : "grid-cols-2")}>
      <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-v-line bg-white px-3 text-[14px] font-semibold">
        <MessageSquare className="size-4 text-v-green" /> WhatsApp Support
      </button>
      <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-v-line bg-white px-3 text-[14px] font-semibold">
        <Phone className="size-4 text-v-green" /> Direct Call
      </button>
    </div>
  );
}

/** Green gradient right-hand rail used on dashboard + earnings overview. */
export function GreenRail({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <aside
      className={cn("space-y-5 rounded-tl-2xl p-6", className)}
      style={{ background: "linear-gradient(180deg,#005220 0%,#2f8a4a 30%,#7fcf7e 65%,#acf0a4 100%)" }}
    >
      {children}
    </aside>
  );
}
