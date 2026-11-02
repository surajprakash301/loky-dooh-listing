import Link from "next/link";
import { AgencyPageHeader } from "@/components/agency/shell";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { loadAgencyPage } from "@/services/agency-page";
import { paymentsLedger } from "@/services/deals";
import { cn } from "@/lib/utils";

export default async function PaymentsPage() {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const { payments, wallet, walletBalance } = await paymentsLedger(a.id);
  return (
    <>
      <AgencyPageHeader title="Payments & billing" subtitle="Transaction ledger, EMI schedule and your Loky Wallet." />
      <div className="grid gap-6 px-8 py-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-x-auto rounded-xl border border-v-line"><table className="w-full min-w-[720px] text-[13.5px]"><thead className="bg-v-panel text-[11px] font-semibold tracking-wide text-ink-soft uppercase"><tr><th className="px-4 py-3 text-left">Client · campaign</th><th className="px-4 py-3 text-left">Instalment</th><th className="px-4 py-3 text-left">Due</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
          <tbody>{payments.map((p) => <tr key={p.id} className="border-t border-v-line"><td className="px-4 py-3"><Link href={`/agency/campaigns/${p.campaignId}`} className="font-medium hover:underline">{p.campaign?.brand?.name}</Link><p className="text-[12px] text-v-muted">{p.campaign?.workOrderNo} · {p.campaign?.title}</p></td><td className="px-4 py-3">{p.kind === "full" ? "100 % upfront" : p.kind === "upfront" ? "50 % upfront" : `EMI ${p.installmentNo}/3`}</td><td className="px-4 py-3 text-ink-soft">{formatDate(new Date(p.dueDate))}</td><td className="px-4 py-3 text-right font-semibold">{formatINR(p.amount)}</td><td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", p.status === "paid" ? "bg-v-chip text-v-deep" : "bg-v-orange-tint text-v-rust")}>{p.status === "paid" ? `Paid · ${p.reference}` : "Awaiting"}</span></td></tr>)}{payments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-soft">No transactions yet.</td></tr>}</tbody></table></div>
        <aside className="space-y-4">
          <div className="rounded-xl bg-v-deep p-5 text-white"><p className="text-[11px] font-bold tracking-wide uppercase opacity-80">Loky Wallet ledger</p><p className="mt-1 text-[30px] font-bold">{formatINR(walletBalance)}</p><p className="text-[12.5px] opacity-80">Bonuses and cashbacks; auto-applied as partner pre-discount vouchers.</p></div>
          <ul className="divide-y divide-v-line rounded-xl border border-v-line px-4 text-[13px]">{wallet.map((w) => <li key={w.id} className="py-2.5"><div className="flex justify-between"><span className="font-medium capitalize">{w.kind}</span><span className={Number(w.amount) >= 0 ? "text-v-deep" : "text-v-red"}>{Number(w.amount) >= 0 ? "+" : ""}{formatINR(w.amount)}</span></div><p className="text-[12px] text-v-muted">{w.note} · {formatDateTime(w.createdAt)}</p></li>)}{wallet.length === 0 && <li className="py-3 text-v-muted">No wallet activity yet. Your first confirmed order credits ₹2,500.</li>}</ul>
        </aside>
      </div>
    </>
  );
}
