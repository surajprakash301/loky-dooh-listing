import Link from "next/link";
import { FileText, Map as MapIcon, Plus } from "lucide-react";
import { QUOTE_STATUS_LABEL, type QuoteStatus } from "@/lib/domain";
import { formatDateLong, formatINR } from "@/lib/format";
import { getSession } from "@/lib/server/auth";
import { listMyQuotations } from "@/services/quotes";
import { cn } from "@/lib/utils";

export const metadata = { title: "Active quotations — Loky Media" };

export default async function ActiveQuotationsPage() {
  const s = await getSession();
  if (s?.role !== "customer") return null; // the layout shows the sign-in prompt
  const rows = await listMyQuotations(s.uid);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-ink-soft">{rows.length === 0 ? "No quotations yet. Pick billboards from the list or the map to create one." : `${rows.length} quotation${rows.length === 1 ? "" : "s"}. Open one to download it as a PDF or share the link.`}</p>
        <div className="flex gap-2">
          <Link href="/listing?view=map" className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink/25 bg-white px-4 text-[14px] font-semibold"><MapIcon className="size-4" /> Pick from the map</Link>
          <Link href="/quote/new" className="btn-3d inline-flex h-10 items-center gap-2 rounded-lg bg-green px-4 text-[14px] font-semibold text-white"><Plus className="size-4" /> New quotation</Link>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((q) => (
          <Link key={q.id} href={`/orders/quotations/${q.id}`} className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md" data-testid={`quote-${q.id}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2"><FileText className="size-5 text-green" /><span className="font-mono text-[13px] text-ink-soft">{q.number}</span></div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase", q.status === "active" ? "bg-green/10 text-green" : q.status === "accepted" ? "bg-brand/20 text-ink" : "bg-line text-ink-soft")}>{QUOTE_STATUS_LABEL[q.status as QuoteStatus]}</span>
            </div>
            <p className="mt-3 text-[18px] font-bold">{q.company ?? q.clientName}</p>
            <p className="mt-0.5 text-[13px] text-ink-soft">{q.items?.length ?? 0} location{(q.items?.length ?? 0) === 1 ? "" : "s"} in {q.city} · {q.months} month{q.months > 1 ? "s" : ""} · {q.slotSeconds}s slot</p>
            <p className="mt-3 text-[22px] font-bold">{formatINR(Number(q.total))} <span className="text-[12px] font-normal text-ink-soft">incl. GST</span></p>
            {Number(q.discountAmount) > 0 && <p className="mt-1 text-[12px] font-semibold text-green">Voucher “{q.voucherTitle}” · {Number(q.discountPct)}% off · saved {formatINR(Number(q.discountAmount))}</p>}
            <p className="mt-1 text-[12px] text-ink-soft">Created {formatDateLong(q.createdAt)} · valid until {formatDateLong(q.validUntil)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
