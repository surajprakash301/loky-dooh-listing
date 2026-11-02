import { notFound } from "next/navigation";
import { PitchDocument } from "@/components/agency/pitch-view";
import { Logo } from "@/components/site/logo";
import { getSession } from "@/lib/server/auth";
import { openSharedProposal } from "@/services/deals";

export default async function SharedProposalPage(props: PageProps<"/p/[token]">) {
  const { token } = await props.params; const sp = await props.searchParams;
  const s = await getSession();
  const p = await openSharedProposal(token, !(s?.agencyId));   // the pitching agency's own opens don't count as client views
  if (!p) notFound();
  return (
    <div className="min-h-screen bg-page px-4 py-8 font-inter print:bg-white">
      <div className="mx-auto mb-6 flex max-w-[960px] items-center justify-between"><Logo height={32} /><span className="text-[12.5px] text-ink-soft">Visual campaign proposal · prepared by {p.agency?.legalName}</span>{sp.print && <span className="rounded-lg bg-v-chip px-3 py-1.5 text-[12.5px] text-v-deep print:hidden">Use your browser&apos;s Print → Save as PDF for the white-label export</span>}</div>
      <PitchDocument p={p} />
    </div>
  );
}
