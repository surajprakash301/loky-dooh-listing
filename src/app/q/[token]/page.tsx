import { notFound } from "next/navigation";
import { QuoteDocument } from "@/components/agency/pitch-view";
import { Logo } from "@/components/site/logo";
import { getSession } from "@/lib/server/auth";
import { openSharedQuotation } from "@/services/deals";

export default async function SharedQuotePage(props: PageProps<"/q/[token]">) {
  const { token } = await props.params; const sp = await props.searchParams;
  const s = await getSession();
  const q = await openSharedQuotation(token, !(s?.agencyId));
  if (!q) notFound();
  return (
    <div className="min-h-screen bg-page px-4 py-8 font-inter print:bg-white">
      <div className="mx-auto mb-6 flex max-w-[960px] items-center justify-between"><Logo height={32} /><span className="text-[12.5px] text-ink-soft">Commercial quotation · {q.agency?.legalName}</span>{sp.print && <span className="rounded-lg bg-v-chip px-3 py-1.5 text-[12.5px] text-v-deep print:hidden">Print → Save as PDF for the co-branded export</span>}</div>
      <QuoteDocument q={q} />
    </div>
  );
}
