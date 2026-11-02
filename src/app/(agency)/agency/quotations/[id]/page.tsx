import Link from "next/link";
import { notFound } from "next/navigation";
import { LockCampaignForm } from "@/components/agency/campaign-forms";
import { QuoteDocument } from "@/components/agency/pitch-view";
import { ShareLink } from "@/components/agency/share-link";
import { AgencyPageHeader } from "@/components/agency/shell";
import { formatDate, formatINR } from "@/lib/format";
import { loadAgencyPage } from "@/services/agency-page";
import { loadQuotation } from "@/services/deals";

export default async function QuotationPage(props: PageProps<"/agency/quotations/[id]">) {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const { id } = await props.params;
  const q = await loadQuotation(a.id, Number(id)).catch(() => null);
  if (!q) notFound();
  return (
    <>
      <AgencyPageHeader title={q.title} subtitle={`${q.brand?.name} · ${formatINR(q.total)} · ${q.viewCount} client views · brand locked till ${formatDate(q.lockUntil)}`} actions={<Link href={`/q/${q.shareToken}?print=1`} target="_blank" className="h-11 rounded-lg border border-v-line px-4 text-[14px] leading-[44px] font-semibold">Generate co-branded PDF</Link>} />
      <div className="grid gap-6 px-8 py-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4"><div className="flex flex-wrap items-center gap-3 rounded-xl border border-v-line bg-v-tint p-4"><span className="text-[13px] text-ink-soft">Shareable quote link / email to the client:</span><ShareLink path={`/q/${q.shareToken}`} label="Copy shareable link" /></div><QuoteDocument q={q} /></div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-v-line p-5">
            <h2 className="text-[15px] font-bold">Phase 5 · Close & activate</h2>
            {q.campaign ? <p className="mt-2 text-[13.5px]">Work order <Link href={`/agency/campaigns/${q.campaign.id}`} className="font-semibold text-v-green hover:underline">{q.campaign.workOrderNo}</Link> exists for this quote ({q.campaign.status.replace("_", " ")}).</p> : <><p className="mt-1 text-[12.5px] text-ink-soft">Client said yes? Generate the work order, choose the payment path and lock the screen loops.</p><div className="mt-4"><LockCampaignForm quotationId={q.id} total={Number(q.total)} defaultStart={new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10)} /></div></>}
          </div>
          <div className="rounded-xl border border-v-line p-5 text-[12.5px] text-ink-soft"><p className="font-semibold text-ink">Live track stats</p><p className="mt-1">View count: {q.viewCount} {q.viewCount === 0 && "(awaiting share)"}</p><p>Estimated margin: {formatINR(q.marginAmount)} ({Number(q.marginPct)}%) + {Number(a.commissionPct).toFixed(1)}% Loky commission on base</p></div>
        </aside>
      </div>
    </>
  );
}
