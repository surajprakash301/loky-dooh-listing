import Link from "next/link";
import { AgencyPageHeader } from "@/components/agency/shell";
import { formatDate } from "@/lib/format";
import { loadAgencyPage } from "@/services/agency-page";
import { listProposals } from "@/services/deals";

export default async function ProposalsPage() {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const rows = await listProposals(a.id);
  return (
    <>
      <AgencyPageHeader title="Proposals" subtitle="Visual pitches without pricing: the hook before the deal." actions={<Link href="/agency/proposals/new" className="h-11 rounded-lg bg-v-deep px-5 text-[14px] leading-[44px] font-semibold text-white">New proposal</Link>} />
      <div className="px-8 py-6"><div className="overflow-x-auto rounded-xl border border-v-line"><table className="w-full min-w-[640px] text-[13.5px]"><thead className="bg-v-panel text-[11px] font-semibold tracking-wide text-ink-soft uppercase"><tr><th className="px-4 py-3 text-left">Proposal</th><th className="px-4 py-3 text-left">Brand</th><th className="px-4 py-3 text-left">Screens</th><th className="px-4 py-3 text-left">Views</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Created</th><th></th></tr></thead>
        <tbody>{rows.map((p) => <tr key={p.id} className="border-t border-v-line"><td className="px-4 py-3 font-medium"><Link href={`/agency/proposals/${p.id}`} className="hover:underline">{p.title}</Link></td><td className="px-4 py-3">{p.brand?.name}</td><td className="px-4 py-3">{p.items?.length}</td><td className="px-4 py-3">{p.viewCount}</td><td className="px-4 py-3 capitalize">{p.status}</td><td className="px-4 py-3 text-ink-soft">{formatDate(p.createdAt)}</td><td className="px-4 py-3 text-right"><Link href={`/agency/quotations/new?proposal=${p.id}`} className="font-semibold text-v-green hover:underline">Build quotation →</Link></td></tr>)}{rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-soft">No proposals yet.</td></tr>}</tbody></table></div></div>
    </>
  );
}
