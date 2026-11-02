import Link from "next/link";
import { notFound } from "next/navigation";
import { PitchDocument } from "@/components/agency/pitch-view";
import { ShareLink } from "@/components/agency/share-link";
import { AgencyPageHeader } from "@/components/agency/shell";
import { loadAgencyPage } from "@/services/agency-page";
import { loadProposal } from "@/services/deals";

export default async function ProposalPage(props: PageProps<"/agency/proposals/[id]">) {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const { id } = await props.params;
  const p = await loadProposal(a.id, Number(id)).catch(() => null);
  if (!p) notFound();
  return (
    <>
      <AgencyPageHeader title="Visual campaign proposal ready to pitch" subtitle={`${p.title} · ${p.brand?.name} · ${p.items?.length} screens · ${p.viewCount} client views`} actions={<><Link href={`/p/${p.shareToken}?print=1`} target="_blank" className="h-11 rounded-lg border border-v-line px-4 text-[14px] leading-[44px] font-semibold">Export white-label pitch (PDF)</Link><Link href={`/agency/quotations/new?proposal=${p.id}`} className="h-11 rounded-lg bg-v-bright px-5 text-[14px] leading-[44px] font-bold text-v-deep">Build commercial quotation (Phase 4) →</Link></>} />
      <div className="space-y-5 px-8 py-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-v-line bg-v-tint p-4"><span className="rounded-full bg-v-chip px-2.5 py-1 text-[11.5px] font-semibold text-v-deep">Safeguard: no pricing enforced</span><span className="text-[13px] text-ink-soft">Shareable pitch link with live view tracking:</span><ShareLink path={`/p/${p.shareToken}`} label="Copy shareable pitch link" /></div>
        <PitchDocument p={p} />
      </div>
    </>
  );
}
