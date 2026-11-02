"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Circle, CircleAlert, Clock, Lock } from "lucide-react";
import type { StepState } from "@/lib/domain";
import { cn } from "@/lib/utils";

function Icon({ s }: { s: StepState }) {
  if (s.status === "approved") return <Check className="size-3.5" />;
  if (s.status === "changes_requested") return <CircleAlert className="size-3.5" />;
  if (s.status === "pending") return <Clock className="size-3.5" />;
  if (s.filled) return <Check className="size-3.5" />;
  return <Circle className="size-3" />;
}

export function Stepper({ steps, vendorId, canAddBillboard }: { steps: StepState[]; vendorId: number; canAddBillboard: boolean }) {
  const pathname = usePathname();
  const base = `/rep/onboard/${vendorId}`;
  const core = steps.filter((s) => s.section !== "billboard");
  const boards = steps.filter((s) => s.section === "billboard");
  const item = (s: StepState) => {
    const active = pathname === s.href;
    const tone =
      s.status === "approved" ? "bg-v-chip text-v-deep" : s.status === "changes_requested" ? "bg-v-orange-tint text-v-rust" : s.status === "pending" ? "bg-amber-50 text-amber-700" : s.filled ? "bg-v-chip text-v-deep" : "bg-v-panel text-v-muted";
    return (
      <Link key={s.key} href={s.href} className={cn("flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]", active ? "bg-white font-semibold shadow-sm ring-1 ring-v-line" : "hover:bg-white/70")}>
        <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", tone)}>
          <Icon s={s} />
        </span>
        <span className="min-w-0 flex-1 truncate">{s.label}</span>
        {!s.editable && s.status !== "draft" && <Lock className="size-3.5 shrink-0 text-v-muted" />}
      </Link>
    );
  };
  return (
    <nav className="flex flex-col gap-1">
      {core.map(item)}
      <p className="mt-3 px-2.5 text-[11px] font-semibold tracking-wide text-v-muted uppercase">Billboards ({boards.length})</p>
      {boards.map(item)}
      {canAddBillboard && (
        <Link href={`${base}/billboards/new`} className={cn("rounded-lg px-2.5 py-2 text-[13px] font-semibold text-v-green hover:bg-white/70", pathname.endsWith("/billboards/new") && "bg-white shadow-sm ring-1 ring-v-line")}>
          + Add billboard
        </Link>
      )}
      <Link href={`${base}/review`} className={cn("mt-3 rounded-lg border border-v-line bg-white px-2.5 py-2 text-[13px] font-semibold", pathname.endsWith("/review") && "ring-2 ring-v-green/30")}>
        Review & submit →
      </Link>
    </nav>
  );
}
