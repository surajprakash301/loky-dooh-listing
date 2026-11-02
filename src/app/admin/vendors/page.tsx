import Link from "next/link";
import { PageHeader } from "@/components/portal/shell";
import { StatusPill } from "@/components/portal/status";
import { requireRole } from "@/lib/server/auth";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { listQueue, queueCounts, type QueueTab } from "@/services/review";

const TABS: { id: QueueTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default async function AdminVendorsPage(props: PageProps<"/admin/vendors">) {
  await requireRole("admin");
  const sp = await props.searchParams;
  const tab = (TABS.some((t) => t.id === sp.tab) ? sp.tab : "pending") as QueueTab;
  const [rows, counts] = await Promise.all([listQueue(tab), queueCounts()]);

  return (
    <>
      <PageHeader title="Vendor onboarding" subtitle="Review each section of a submitted vendor. Approve, or request changes with a remark." />
      <div className="px-6 py-6 md:px-8">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <Link key={t.id} href={`/admin/vendors?tab=${t.id}`} className={cn("inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-medium", tab === t.id ? "border-v-deep bg-v-deep text-white" : "border-v-line bg-white hover:bg-v-panel")}>
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11px]", tab === t.id ? "bg-white/20" : "bg-v-panel text-ink-soft")}>{counts[t.id]}</span>
            </Link>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-v-line bg-white">
          <table className="w-full min-w-[820px] text-[13.5px]">
            <thead className="bg-v-panel text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Vendor</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Representative</th>
                <th className="px-4 py-3 text-left">Billboards</th>
                <th className="px-4 py-3 text-left">Sections</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-ink-soft">Nothing in this tab.</td></tr>}
              {rows.map((v) => {
                const secs = v.reviewSections ?? [];
                const pending = secs.filter((r) => r.status === "pending").length;
                const flagged = secs.filter((r) => r.status === "changes_requested").length;
                const approved = secs.filter((r) => r.status === "approved").length;
                const round = Math.max(1, ...secs.map((r) => r.round));
                return (
                  <tr key={v.id} className="border-t border-v-line hover:bg-v-tint/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/vendors/${v.id}`} className="font-semibold hover:underline">{v.tradeName ?? v.legalName}</Link>
                      <p className="font-mono text-[11.5px] text-v-muted">{v.gstNumber}</p>
                    </td>
                    <td className="px-4 py-3">{v.city}</td>
                    <td className="px-4 py-3">{v.representative?.name}</td>
                    <td className="px-4 py-3">{v.billboards?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className="text-v-deep">{approved} ✓</span>
                      {pending > 0 && <span className="ml-2 text-amber-700">{pending} pending</span>}
                      {flagged > 0 && <span className="ml-2 text-v-rust">{flagged} flagged</span>}
                      {round > 1 && <span className="ml-2 text-v-muted">· round {round}</span>}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={v.status} /></td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(v.submittedAt)}</td>
                    <td className="px-4 py-3 text-right"><Link href={`/admin/vendors/${v.id}`} className="font-semibold text-v-green hover:underline">{pending ? "Review" : "Open"}</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
