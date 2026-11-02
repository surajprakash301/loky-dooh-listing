import Link from "next/link";
import { AgencyPageHeader } from "@/components/agency/shell";
import { CAMPAIGN_STATUS_LABEL, type CampaignStatus } from "@/lib/domain";
import { formatDate, formatINR } from "@/lib/format";
import { loadAgencyPage } from "@/services/agency-page";
import { listCampaigns } from "@/services/deals";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = { pending_payment: "bg-v-orange-tint text-v-rust", confirmed: "bg-v-chip text-v-deep", active: "bg-v-bright/30 text-v-deep", completed: "bg-v-panel text-ink-soft", cancelled: "bg-v-red-tint text-v-red" };

export default async function CampaignsPage() {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const rows = await listCampaigns(a.id);
  return (
    <>
      <AgencyPageHeader title="Work orders & campaigns" subtitle="Campaign confirmation, payment status and go-live tracking." />
      <div className="px-8 py-6"><div className="overflow-x-auto rounded-xl border border-v-line"><table className="w-full min-w-[760px] text-[13.5px]"><thead className="bg-v-panel text-[11px] font-semibold tracking-wide text-ink-soft uppercase"><tr><th className="px-4 py-3 text-left">Work order</th><th className="px-4 py-3 text-left">Brand</th><th className="px-4 py-3 text-left">Flight</th><th className="px-4 py-3 text-left">Screens</th><th className="px-4 py-3 text-left">Paid / total</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
        <tbody>{rows.map((c) => <tr key={c.id} className="border-t border-v-line"><td className="px-4 py-3"><Link href={`/agency/campaigns/${c.id}`} className="font-medium hover:underline">{c.workOrderNo}</Link><p className="text-[12px] text-v-muted">{c.title}</p></td><td className="px-4 py-3">{c.brand?.name}</td><td className="px-4 py-3 text-ink-soft">{formatDate(new Date(c.startDate))} → {formatDate(new Date(c.endDate))}</td><td className="px-4 py-3">{c.screens?.length}</td><td className="px-4 py-3">{formatINR(c.paidAmount)} / {formatINR(c.total)}</td><td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", TONE[c.status])}>{CAMPAIGN_STATUS_LABEL[c.status as CampaignStatus]}</span></td></tr>)}{rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-soft">No work orders yet. Lock a quotation to create one.</td></tr>}</tbody></table></div></div>
    </>
  );
}
