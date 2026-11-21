import { notFound } from "next/navigation";
import { PrintButton } from "@/components/quote/print-button";
import { QuotationDoc } from "@/components/quote/quotation-doc";
import { Logo } from "@/components/site/logo";
import { formatDateLong } from "@/lib/format";
import { getQuotationByToken } from "@/services/quotes";

export const metadata = { title: "Quotation — Loky Media" };

/** Public, link-only view of a quotation (the token is unguessable). */
export default async function SharedQuotationPage(props: PageProps<"/qt/[token]">) {
  const { token } = await props.params;
  const q = await getQuotationByToken(token);
  if (!q) notFound();
  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-line bg-white print:hidden">
        <div className="mx-auto flex h-[60px] max-w-[1512px] items-center justify-between px-8">
          <Logo height={34} />
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-ink-soft">Quotation {q.number} · valid until {formatDateLong(q.validUntil)}</span>
            <PrintButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1512px] px-8 py-8 print:p-0">
        <QuotationDoc q={q} />
      </main>
    </div>
  );
}
