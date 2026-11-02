import Link from "next/link";
import { notFound } from "next/navigation";
import { setAgencyStatusAction } from "@/actions/admin-agency";
import { CommissionForm } from "@/components/admin/agency-controls";
import { KV } from "@/components/admin/kv";
import { PageHeader, Panel } from "@/components/portal/shell";
import { requireRole } from "@/lib/server/auth";
import { FOUNDER_ROLE_LABEL } from "@/lib/domain";
import { formatDateTime, formatINR } from "@/lib/format";
import { activityFeed, listBrands, loadAgency } from "@/services/agency";
import { listCampaigns } from "@/services/deals";

export default async function AdminAgencyPage(props: PageProps<"/admin/agencies/[id]">) {
  await requireRole("admin");
  const { id } = await props.params;
  const a = await loadAgency(Number(id));
  if (!a) notFound();
  const [brands, campaigns, feed] = await Promise.all([listBrands(a.id), listCampaigns(a.id), activityFeed(a.id, 40)]);
  return (
    <>
      <PageHeader back={{ href: "/admin/agencies", label: "Agencies" }} title={a.legalName} subtitle={`${a.city}, ${a.state} · ${a.status} · ${a.verificationPath} verification`} actions={a.status === "suspended" ? <form action={setAgencyStatusAction.bind(null, a.id, "partner")}><button className="h-10 rounded-lg bg-v-deep px-4 text-[13px] font-semibold text-white">Reinstate</button></form> : <form action={setAgencyStatusAction.bind(null, a.id, "suspended")}><button className="h-10 rounded-lg border border-v-red/40 px-4 text-[13px] font-semibold text-v-red">Suspend agency</button></form>} />
      <div className="space-y-5 px-6 py-6 md:px-8">
        <Panel title="Profile & verification"><KV rows={[{ k: "Legal name", v: a.legalName }, { k: "GSTIN", v: a.gstNumber ?? "not provided" }, { k: "Address", v: `${a.addressLine}, ${a.city}` }, { k: "Founder", v: `${a.founderName} · ${FOUNDER_ROLE_LABEL[a.founderRole]}` }, { k: "Contact", v: `${a.founderPhone} · ${a.founderEmail}` }, { k: "Verified", v: a.verifiedAt ? formatDateTime(a.verifiedAt) : "pending OTP" }, { k: "Assessment", v: a.assessmentScore ? `${Number(a.assessmentScore).toFixed(1)}/10` : "not done" }, { k: "Tier", v: `Level ${a.level} · ${Number(a.commissionPct).toFixed(1)}%` }, { k: "Expert callback", v: a.expertCallbackDueAt ? formatDateTime(a.expertCallbackDueAt) : "—" }]} /><div className="mt-4 border-t border-v-line pt-4"><CommissionForm agencyId={a.id} value={Number(a.commissionPct)} /></div></Panel>
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title={`Brands (${brands.length})`}><ul className="divide-y divide-v-line text-[13.5px]">{brands.map((b) => <li key={b.id} className="flex justify-between py-2"><span>{b.name}</span><span className="text-ink-soft">{b.campaigns?.length ?? 0} orders</span></li>)}{brands.length === 0 && <li className="py-2 text-v-muted">None</li>}</ul></Panel>
          <Panel title={`Work orders (${campaigns.length})`}><ul className="divide-y divide-v-line text-[13.5px]">{campaigns.map((c) => <li key={c.id} className="flex justify-between py-2"><span>{c.workOrderNo} · {c.brand?.name}</span><span className="text-ink-soft">{formatINR(c.paidAmount)} / {formatINR(c.total)} · {c.status}</span></li>)}{campaigns.length === 0 && <li className="py-2 text-v-muted">None</li>}</ul></Panel>
        </div>
        <Panel title="Team"><ul className="divide-y divide-v-line text-[13.5px]">{(a.members ?? []).map((m) => <li key={m.id} className="py-2">{m.user?.name} · {m.title} · <span className="text-ink-soft">{m.user?.email}</span></li>)}</ul></Panel>
        <Panel title="Activity"><ul className="divide-y divide-v-line text-[13px]">{feed.map((f) => <li key={f.id} className="py-2"><span className="text-v-muted">{formatDateTime(f.createdAt)}</span> · {f.message}</li>)}</ul></Panel>
        <p className="text-[12.5px] text-v-muted">Coupons used by agencies are managed under <Link href="/admin/coupons" className="text-v-green hover:underline">Coupons</Link>.</p>
      </div>
    </>
  );
}
