import Link from "next/link";
import { notFound } from "next/navigation";
import { assetStatusAction } from "@/actions/agency";
import { AssetUploadForm, AssignManagerForm } from "@/components/agency/brand-forms";
import { AgencyPageHeader } from "@/components/agency/shell";
import { Notice } from "@/components/portal/form";
import { formatDate, formatINR } from "@/lib/format";
import { listMembers, loadBrand } from "@/services/agency";
import { loadAgencyPage } from "@/services/agency-page";
import { fileUrl } from "@/services/files";
import { cn } from "@/lib/utils";

export default async function BrandWorkspace(props: PageProps<"/agency/brands/[id]">) {
  const { a } = await loadAgencyPage();
  const { id } = await props.params; const sp = await props.searchParams;
  const [brand, members] = await Promise.all([loadBrand(a.id, Number(id)).catch(() => null), listMembers(a.id)]);
  if (!brand) notFound();
  const campaigns = brand.campaigns ?? [];
  const spend = campaigns.reduce((s, c) => s + Number(c.total), 0);
  const active = campaigns.filter((c) => c.status === "active" || c.status === "confirmed").length;
  return (
    <>
      <AgencyPageHeader title={brand.name} subtitle={`${brand.hq ?? ""}${brand.category ? ` · ${brand.category}` : ""}`} actions={<><Link href={`/agency/proposals/new?brand=${brand.id}`} className="h-11 rounded-lg bg-v-deep px-5 text-[14px] leading-[44px] font-semibold text-white">Create visual proposal</Link><Link href={`/agency/quotations/new?brand=${brand.id}`} className="h-11 rounded-lg border border-v-line px-5 text-[14px] leading-[44px] font-semibold">Quotation</Link></>} />
      <div className="space-y-6 px-8 py-6">
        {sp.created && <Notice tone="success">Brand added. Assign an account manager and upload creatives to get started.</Notice>}
        <div className="rounded-2xl bg-[linear-gradient(135deg,#0f2a1a,#1f6b3a)] p-6 text-white">
          <div className="grid gap-4 sm:grid-cols-4">
            {[["Total spend", formatINR(spend)], ["Active campaigns", String(active).padStart(2, "0")], ["Orders", String(campaigns.length).padStart(2, "0")], ["Proposals / quotes", `${brand.proposals?.length ?? 0} / ${brand.quotations?.length ?? 0}`]].map(([k, v]) => <div key={k}><p className="text-[11px] tracking-wide text-white/70 uppercase">{k}</p><p className="mt-1 text-[24px] font-bold">{v}</p></div>)}
          </div>
          {brand.lockedUntil && brand.lockedUntil > new Date() && <p className="mt-4 text-[12.5px] text-v-lime">Brand lock-in active until {formatDate(brand.lockedUntil)}: this brand is reserved to your agency&apos;s pitch.</p>}
        </div>
        <section className="rounded-xl border border-v-line p-5"><h2 className="text-[15px] font-bold">Account manager</h2><p className="text-[12.5px] text-ink-soft">Select a team member to handle this client&apos;s media orders.</p><p className="mt-1 text-[13px]">Current manager: <b>{brand.manager?.user?.name ?? "unassigned"}</b></p><div className="mt-3"><AssignManagerForm brandId={brand.id} current={brand.managerMemberId} members={members.map((m) => ({ id: m.id, name: m.user?.name ?? "", title: m.title, load: m.brands?.length ?? 0 }))} /></div></section>
        <section className="rounded-xl border border-v-line p-5">
          <h2 className="text-[15px] font-bold">Creative assets</h2>
          <div className="mt-3"><AssetUploadForm brandId={brand.id} /></div>
          <table className="mt-4 w-full text-[13px]"><thead className="text-[11px] font-semibold tracking-wide text-v-muted uppercase"><tr><th className="py-1 text-left">Asset</th><th className="py-1 text-left">Specs</th><th className="py-1 text-left">Status</th><th className="py-1 text-right">Actions</th></tr></thead>
            <tbody>{(brand.assets ?? []).map((as) => { const url = fileUrl(as.file)!; return (
              <tr key={as.id} className="border-t border-v-line"><td className="py-2"><a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">{as.file?.mimeType.startsWith("video") ? <video src={url} className="size-10 rounded object-cover" muted /> : <img src={url} alt="" className="size-10 rounded object-cover" />}<span>{as.name} <span className="text-v-muted">v{as.version}</span></span></a></td><td className="py-2 text-ink-soft">{as.specs ?? "—"}</td><td className="py-2"><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", as.status === "approved" ? "bg-v-chip text-v-deep" : as.status === "rejected" ? "bg-v-red-tint text-v-red" : "bg-amber-50 text-amber-700")}>{as.status}</span></td><td className="py-2 text-right">{as.status !== "approved" && <form action={assetStatusAction.bind(null, as.id, "approved")} className="inline"><button className="text-[12.5px] font-semibold text-v-green hover:underline">Approve</button></form>}{as.status !== "rejected" && <form action={assetStatusAction.bind(null, as.id, "rejected")} className="ml-3 inline"><button className="text-[12.5px] text-v-red hover:underline">Reject</button></form>}</td></tr>
            ); })}{!brand.assets?.length && <tr><td colSpan={4} className="py-4 text-center text-v-muted">No creatives yet.</td></tr>}</tbody></table>
        </section>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-v-line p-5"><h2 className="text-[15px] font-bold">Proposals & quotations</h2><ul className="mt-2 divide-y divide-v-line text-[13.5px]">{(brand.proposals ?? []).map((p) => <li key={`p${p.id}`} className="flex justify-between py-2"><Link href={`/agency/proposals/${p.id}`} className="hover:underline">Proposal · {p.title}</Link><span className="text-ink-soft">{p.viewCount} views · {p.status}</span></li>)}{(brand.quotations ?? []).map((q) => <li key={`q${q.id}`} className="flex justify-between py-2"><Link href={`/agency/quotations/${q.id}`} className="hover:underline">Quote · {q.title}</Link><span className="text-ink-soft">{formatINR(q.total)} · {q.status}</span></li>)}{!brand.proposals?.length && !brand.quotations?.length && <li className="py-2 text-v-muted">Nothing pitched yet.</li>}</ul></section>
          <section className="rounded-xl border border-v-line p-5"><h2 className="text-[15px] font-bold">Campaigns</h2><ul className="mt-2 divide-y divide-v-line text-[13.5px]">{campaigns.map((c) => <li key={c.id} className="flex justify-between py-2"><Link href={`/agency/campaigns/${c.id}`} className="hover:underline">{c.workOrderNo} · {c.title}</Link><span className="text-ink-soft">{formatDate(new Date(c.startDate))} → {formatDate(new Date(c.endDate))} · {c.status.replace("_", " ")}</span></li>)}{campaigns.length === 0 && <li className="py-2 text-v-muted">No work orders yet.</li>}</ul></section>
        </div>
      </div>
    </>
  );
}
