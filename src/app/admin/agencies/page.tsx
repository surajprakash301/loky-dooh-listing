import Link from "next/link";
import { Agency, AgencyMember, Brand, Campaign, User } from "@/db";
import { PageHeader } from "@/components/portal/shell";
import { requireRole } from "@/lib/server/auth";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function AdminAgenciesPage() {
  await requireRole("admin");
  const rows = await Agency.findAll({ include: [{ model: User, as: "owner", attributes: ["name", "email"] }, { model: AgencyMember, as: "members", attributes: ["id"] }, { model: Brand, as: "brands", attributes: ["id"] }], order: [["createdAt", "DESC"]] });
  const orders = await Campaign.findAll({ attributes: ["agencyId", "status"], raw: true }) as unknown as { agencyId: number; status: string }[];
  return (
    <>
      <PageHeader title="Agencies" subtitle="Self-registered partner agencies, their verification and commission tier." />
      <div className="px-6 py-6 md:px-8"><div className="overflow-x-auto rounded-xl border border-v-line bg-white"><table className="w-full min-w-[820px] text-[13.5px]"><thead className="bg-v-panel text-[11px] font-semibold tracking-wide text-ink-soft uppercase"><tr><th className="px-4 py-3 text-left">Agency</th><th className="px-4 py-3 text-left">Owner</th><th className="px-4 py-3 text-left">Verification</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Score · commission</th><th className="px-4 py-3 text-left">Brands · team · orders</th><th className="px-4 py-3 text-left">Registered</th></tr></thead>
        <tbody>{rows.map((a) => <tr key={a.id} className="border-t border-v-line hover:bg-v-tint/60"><td className="px-4 py-3"><Link href={`/admin/agencies/${a.id}`} className="font-semibold hover:underline">{a.legalName}</Link><p className="font-mono text-[11.5px] text-v-muted">{a.gstNumber ?? "no GSTIN"}</p></td><td className="px-4 py-3">{a.owner?.name}<p className="text-[12px] text-v-muted">{a.owner?.email}</p></td><td className="px-4 py-3">{a.verificationPath}{a.verifiedAt ? " ✓" : " · pending"}</td><td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", a.status === "partner" ? "bg-v-chip text-v-deep" : a.status === "suspended" ? "bg-v-red-tint text-v-red" : "bg-amber-50 text-amber-700")}>{a.status}</span></td><td className="px-4 py-3">{a.assessmentScore ? `${Number(a.assessmentScore).toFixed(1)}/10` : "—"} · {Number(a.commissionPct).toFixed(1)}% · L{a.level}</td><td className="px-4 py-3">{a.brands?.length} · {a.members?.length} · {orders.filter((o) => o.agencyId === a.id).length}</td><td className="px-4 py-3 text-ink-soft">{formatDate(a.createdAt)}</td></tr>)}{rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-soft">No agencies registered yet.</td></tr>}</tbody></table></div></div>
    </>
  );
}
