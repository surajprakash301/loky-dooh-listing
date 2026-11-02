import Link from "next/link";
import { PlusSquare } from "lucide-react";
import { createDraftAction } from "@/actions/onboarding";
import { PageHeader } from "@/components/portal/shell";
import { StatusPill } from "@/components/portal/status";
import type { VendorStatus } from "@/db";
import { requireRole } from "@/lib/server/auth";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { listForRep } from "@/services/onboarding";

const TABS: { id: VendorStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "pending", label: "Pending" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default async function RepHome(props: PageProps<"/rep">) {
  const s = await requireRole("representative");
  const sp = await props.searchParams;
  const tab = (typeof sp.status === "string" ? sp.status : "all") as VendorStatus | "all";
  const all = await listForRep(s.uid);
  const rows = tab === "all" ? all : all.filter((v) => v.status === tab);
  const counts = Object.fromEntries(TABS.map((t) => [t.id, t.id === "all" ? all.length : all.filter((v) => v.status === t.id).length]));

  return (
    <>
      <PageHeader
        title="My onboardings"
        subtitle="Vendors you have visited. Changes requested by the admin show up here first."
        actions={
          <form action={createDraftAction}>
            <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-lg bg-v-deep px-5 text-[14px] font-semibold text-white hover:bg-v-deep/90">
              <PlusSquare className="size-4" /> New onboarding
            </button>
          </form>
        }
      />
      <div className="px-6 py-6 md:px-8">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={t.id === "all" ? "/rep" : `/rep?status=${t.id}`}
              className={cn("inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-medium", tab === t.id ? "border-v-deep bg-v-deep text-white" : "border-v-line bg-white text-ink hover:bg-v-panel")}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11px]", tab === t.id ? "bg-white/20" : "bg-v-panel text-ink-soft")}>{counts[t.id]}</span>
            </Link>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-v-line bg-white">
          <table className="w-full min-w-[720px] text-[13.5px]">
            <thead className="bg-v-panel text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Vendor</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Billboards</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Remarks</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                    Nothing here yet. Start a new onboarding when you visit a vendor.
                  </td>
                </tr>
              )}
              {rows.map((v) => {
                const remarks = (v.reviewSections ?? []).filter((r) => r.status === "changes_requested").length;
                const href = `/rep/onboard/${v.id}/${v.status === "draft" ? "business" : "review"}`;
                return (
                  <tr key={v.id} className="border-t border-v-line hover:bg-v-tint/60">
                    <td className="px-4 py-3">
                      <Link href={href} className="font-semibold hover:underline">
                        {v.tradeName ?? v.legalName ?? <span className="text-ink-soft italic">Untitled draft #{v.id}</span>}
                      </Link>
                      {v.gstNumber && <p className="font-mono text-[11.5px] text-v-muted">{v.gstNumber}</p>}
                    </td>
                    <td className="px-4 py-3">{v.city ?? "—"}</td>
                    <td className="px-4 py-3">{v.billboards?.length ?? 0}</td>
                    <td className="px-4 py-3"><StatusPill status={v.status} /></td>
                    <td className="px-4 py-3">{remarks ? <span className="rounded-full bg-v-orange-tint px-2 py-0.5 text-[12px] font-semibold text-v-rust">{remarks} to fix</span> : <span className="text-v-muted">—</span>}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(v.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={href} className="font-semibold text-v-green hover:underline">
                        {v.status === "changes_requested" ? "Fix & resubmit" : v.status === "draft" ? "Continue" : "Open"}
                      </Link>
                    </td>
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
