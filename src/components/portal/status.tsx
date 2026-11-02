import { cn } from "@/lib/utils";

type AnyStatus = "draft" | "pending" | "changes_requested" | "approved" | "rejected" | "inactive" | "live" | "offline" | "maintenance" | "limited";

const STYLE: Record<AnyStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-v-panel text-ink-soft" },
  pending: { label: "Pending review", cls: "bg-amber-50 text-amber-700" },
  changes_requested: { label: "Changes requested", cls: "bg-v-orange-tint text-v-rust" },
  approved: { label: "Approved", cls: "bg-v-chip text-v-deep" },
  rejected: { label: "Rejected", cls: "bg-v-red-tint text-v-red" },
  inactive: { label: "Inactive", cls: "bg-v-panel text-v-muted" },
  live: { label: "Live", cls: "bg-v-chip text-v-deep" },
  offline: { label: "Offline", cls: "bg-v-red-tint text-v-red" },
  maintenance: { label: "Maintenance", cls: "bg-amber-50 text-amber-700" },
  limited: { label: "Limited", cls: "bg-v-panel text-ink-soft" },
};

export function StatusPill({ status, className, label }: { status: AnyStatus; className?: string; label?: string }) {
  const s = STYLE[status];
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-semibold whitespace-nowrap", s.cls, className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label ?? s.label}
    </span>
  );
}
