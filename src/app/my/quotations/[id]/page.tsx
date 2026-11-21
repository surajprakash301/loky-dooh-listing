import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CopyLinkButton, PrintButton } from "@/components/quote/print-button";
import { QuotationDoc } from "@/components/quote/quotation-doc";
import { QUOTE_STATUS_LABEL, type QuoteStatus } from "@/lib/domain";
import { formatDateLong, formatINR } from "@/lib/format";
import { requireRole } from "@/lib/server/auth";
import { getMyQuotation } from "@/services/quotes";

export const metadata = { title: "Quotation — Loky Media" };

export default async function MyQuotationPage(props: PageProps<"/my/quotations/[id]">) {
  const s = await requireRole("customer");
  const { id } = await props.params;
  const sp = await props.searchParams;
  const q = await getMyQuotation(s.uid, Number(id));
  if (!q) notFound();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link href="/my/quotations" className="inline-flex items-center gap-1 text-[13px] text-ink-soft hover:text-ink"><ArrowLeft className="size-3.5" /> All quotations</Link>
          <h2 className="mt-1 text-[22px] font-bold">
            {q.number} <span className="ml-2 rounded-full bg-green/10 px-2.5 py-0.5 align-middle text-[11px] font-bold tracking-wide text-green uppercase">{QUOTE_STATUS_LABEL[q.status as QuoteStatus]}</span>
          </h2>
          <p className="text-[13px] text-ink-soft">{formatINR(Number(q.total))} incl. GST · {q.items?.length ?? 0} locations · valid until {formatDateLong(q.validUntil)}</p>
        </div>
        <div className="flex gap-2">
          <CopyLinkButton path={`/qt/${q.shareToken}`} />
          <PrintButton />
        </div>
      </div>
      {sp.created === "1" && <p className="mt-4 rounded-xl border border-green/40 bg-green/10 px-4 py-3 text-[14px] text-green print:hidden" data-testid="created-notice">Your quotation is ready. Download it as a PDF, share the link, or go back to the map to build another one.</p>}
      <div className="mt-6">
        <QuotationDoc q={q} />
      </div>
    </div>
  );
}
