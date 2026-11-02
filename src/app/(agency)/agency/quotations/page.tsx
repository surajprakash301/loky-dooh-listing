import Link from "next/link";
import { AgencyPageHeader } from "@/components/agency/shell";
import { formatDate, formatINR } from "@/lib/format";
import { loadAgencyPage } from "@/services/agency-page";
import { listQuotations } from "@/services/deals";

export default async function QuotationsPage() {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const rows = await listQuotations(a.id);
  return (
    <>
      <AgencyPageHeader title="Quotations" subtitle="Commercial quotes with your margin, coupons and EMI options." actions={<Link href="/agency/quotations/new" className="h-11 rounded-lg bg-v-deep px-5 text-[14px] leading-[44px] font-semibold text-white">New quotation</Link>} />
      <div className="px-8 py-6"><div className="overflow-x-auto rounded-xl border border-v-line"><table className="w-full min-w-[640px] text-[13.5px]"><thead className="bg-v-panel text-[11px] font-semibold tracking-wide text-ink-soft uppercase"><tr><th className="px-4 py-3 text-left">Quotation</th><th className="px-4 py-3 text-left">Brand</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Created</th><th></th></tr></thead>
        <tbody>{rows.map((q) => <tr key={q.id} className="border-t border-v-line"><td className="px-4 py-3 font-medium"><Link href={`/agency/quotations/${q.id}`} className="hover:underline">{q.title}</Link></td><td className="px-4 py-3">{q.brand?.name}</td><td className="px-4 py-3">{formatINR(q.total)}</td><td className="px-4 py-3 capitalize">{q.status}</td><td className="px-4 py-3 text-ink-soft">{formatDate(q.createdAt)}</td><td className="px-4 py-3 text-right">{q.campaign ? <Link href={`/agency/campaigns/${q.campaign.id}`} className="font-semibold text-v-green hover:underline">Work order →</Link> : <Link href={`/agency/quotations/${q.id}`} className="font-semibold text-v-green hover:underline">Lock campaign →</Link>}</td></tr>)}{rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-soft">No quotations yet.</td></tr>}</tbody></table></div></div>
    </>
  );
}
