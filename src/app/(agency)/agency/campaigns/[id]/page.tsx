import Link from "next/link";
import { notFound } from "next/navigation";
import { PayButton, SignWorkOrderForm } from "@/components/agency/campaign-forms";
import { AgencyPageHeader } from "@/components/agency/shell";
import { Notice } from "@/components/portal/form";
import { CAMPAIGN_STATUS_LABEL, EMI_MONTHS, PACKAGE_LABEL, type CampaignStatus, type Package } from "@/lib/domain";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { loadAgencyPage } from "@/services/agency-page";
import { fileUrl } from "@/services/files";
import { loadCampaign } from "@/services/deals";
import { cn } from "@/lib/utils";

export default async function CampaignPage(props: PageProps<"/agency/campaigns/[id]">) {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const { id } = await props.params; const sp = await props.searchParams;
  const c = await loadCampaign(a.id, Number(id)).catch(() => null);
  if (!c) notFound();
  const payments = c.payments ?? [];
  const nextDue = payments.find((p) => p.status === "pending");
  const paid = Number(c.paidAmount), total = Number(c.total);
  return (
    <>
      <AgencyPageHeader title={`${c.workOrderNo} · ${c.title}`} subtitle={`${c.brand?.name} · ${c.screens?.length} screens · ${c.slotSeconds}s / ${PACKAGE_LABEL[c.package as Package]} · ${formatDate(new Date(c.startDate))} → ${formatDate(new Date(c.endDate))}`} actions={<span className={cn("rounded-full px-3 py-1 text-[12px] font-semibold", c.status === "active" ? "bg-v-bright/30 text-v-deep" : c.status === "pending_payment" ? "bg-v-orange-tint text-v-rust" : "bg-v-chip text-v-deep")}>{CAMPAIGN_STATUS_LABEL[c.status as CampaignStatus]}</span>} />
      <div className="grid gap-6 px-8 py-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          {sp.locked && <Notice tone="success">Campaign locked and work order generated. Complete the upfront payment to confirm the screen loops.</Notice>}
          {c.status === "pending_payment" && <Notice tone="warn">Pending upfront payment: {formatINR(Number(c.upfrontRequired) - paid)} more is needed before the campaign is confirmed and slots are reserved.</Notice>}
          {c.status === "confirmed" && <Notice tone="success">Campaign confirmed: screen loops are locked and the timeline is updated. Sign the agreement to activate.</Notice>}
          {c.status === "active" && <Notice tone="success">Live since {formatDateTime(c.liveAt)}. Proof-of-play captures will appear in the client verification card.</Notice>}
          <section className="rounded-xl border border-v-line p-5">
            <h2 className="text-[15px] font-bold">Payments & EMI milestone tracker</h2>
            <p className="text-[12.5px] text-ink-soft">{c.paymentPath === "upfront" ? "Path A · 100 % upfront (5 % wallet cashback)" : `Path B · 50 % upfront + ${EMI_MONTHS} monthly EMIs`}</p>
            <div className="mt-3 h-2 rounded-full bg-v-panel"><div className="h-2 rounded-full bg-v-green" style={{ width: `${Math.min(100, (paid / total) * 100)}%` }} /></div>
            <p className="mt-1 text-[12.5px]">{formatINR(paid)} of {formatINR(total)} received</p>
            <ul className="mt-4 divide-y divide-v-line">
              {payments.map((p) => <li key={p.id} className="flex flex-wrap items-center gap-3 py-3 text-[13.5px]"><span className={cn("size-2.5 rounded-full", p.status === "paid" ? "bg-v-green" : "bg-v-orange")} /><span className="min-w-[180px] font-medium">{p.kind === "full" ? "Full upfront payment" : p.kind === "upfront" ? "1st instalment (50 % upfront)" : `EMI ${p.installmentNo} of ${EMI_MONTHS}`}</span><span className="text-ink-soft">due {formatDate(new Date(p.dueDate))}</span><span className="ml-auto font-semibold">{formatINR(p.amount)}</span>{p.status === "paid" ? <span className="text-[12px] text-v-deep">paid {formatDateTime(p.paidAt)} · {p.method} · {p.reference}</span> : nextDue?.id === p.id ? <PayButton paymentId={p.id} amount={Number(p.amount)} /> : <span className="text-[12px] text-v-muted">awaiting</span>}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border border-v-line p-5">
            <h2 className="text-[15px] font-bold">Campaign agreement & work order</h2>
            <p className="text-[12.5px] text-ink-soft">The work order covers execution SLA, dates and payment terms. Download, sign and upload it back to activate the campaign loop.</p>
            <div className="mt-3 flex flex-wrap gap-3 text-[13px]"><Link href={`/q/${c.quotation?.shareToken}?print=1`} target="_blank" className="rounded-lg border border-v-line px-3 py-2 font-semibold">Download campaign agreement</Link>{c.agreement && <a href={fileUrl(c.agreement)!} target="_blank" rel="noreferrer" className="rounded-lg bg-v-chip px-3 py-2 font-semibold text-v-deep">Signed copy ↗</a>}</div>
            {c.signedAt ? <p className="mt-3 text-[13px] text-v-deep">Signed {formatDateTime(c.signedAt)}.</p> : <div className="mt-4"><SignWorkOrderForm campaignId={c.id} /></div>}
          </section>
          <section className="rounded-xl border border-v-line p-5">
            <h2 className="text-[15px] font-bold">Client verification card</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">{(c.screens ?? []).map((s) => <div key={s.id} className="flex gap-3 rounded-lg border border-v-line p-2.5"><div className="size-16 shrink-0 overflow-hidden rounded bg-v-panel">{s.billboard && (s.billboard.media ?? [])[0] && <img src={fileUrl((s.billboard.media ?? [])[0].file) ?? ""} alt="" className="h-full w-full object-cover" />}</div><div className="text-[12.5px]"><p className="font-semibold">{s.billboard?.name}</p><p className="text-ink-soft">{s.billboard?.locality}, {s.billboard?.city} · #{s.billboard?.code}</p><p className={c.status === "active" ? "text-v-deep" : "text-v-muted"}>{c.status === "active" ? "● Playing · proof-of-play camera active" : "Slot reserved"}</p></div></div>)}</div>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-v-line p-5 text-[13.5px]"><p className="text-[11px] font-bold tracking-wide text-v-muted uppercase">Work order</p><p className="mt-1 font-mono text-[18px] font-bold">{c.workOrderNo}</p><p className="mt-2">Total {formatINR(total)}</p><p>Upfront required {formatINR(c.upfrontRequired)}</p><p>Balance {formatINR(total - paid)}</p><p className="mt-2 text-ink-soft">Quotation: <Link href={`/agency/quotations/${c.quotationId}`} className="text-v-green hover:underline">open</Link></p></div>
          <div className="rounded-xl border border-v-line p-5 text-[12.5px] text-ink-soft"><p className="font-semibold text-ink">Status indicators</p><ol className="mt-2 space-y-1"><li className={c.status !== "pending_payment" ? "text-v-deep" : ""}>1. Upfront received → Campaign confirmed</li><li className={c.signedAt ? "text-v-deep" : ""}>2. Agreement signed → Campaign active</li><li className={c.status === "completed" ? "text-v-deep" : ""}>3. Flight ends → Completed</li></ol></div>
        </aside>
      </div>
    </>
  );
}
