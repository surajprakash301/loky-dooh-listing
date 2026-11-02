import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, PhoneCall, PlayCircle } from "lucide-react";
import { AgencyPageHeader } from "@/components/agency/shell";
import { FIRST_ORDER_BONUS, LEVEL2_COMMISSION_BOOST } from "@/lib/domain";
import { formatINR } from "@/lib/format";
import { loadAgencyPage } from "@/services/agency-page";

export default async function AssessmentSuccess() {
  const { a } = await loadAgencyPage();
  if (a.status !== "partner") redirect("/agency/assessment");
  return (
    <>
      <AgencyPageHeader title="Congratulations! You are now a Loky Partner" subtitle="Your agency diagnostic is complete and your Exclusive Loky Partner status is verified." />
      <div className="grid gap-6 px-8 py-6 xl:grid-cols-[1fr_1fr_320px]">
        <div className="rounded-xl border border-v-line p-6 text-center">
          <Award className="mx-auto size-16 text-amber-500" />
          <p className="mt-3 text-[13px] font-bold tracking-wide text-v-muted uppercase">Partner diagnostic & tier status</p>
          <p className="mt-2 text-[36px] leading-none font-bold">{Number(a.assessmentScore).toFixed(1)}<span className="text-[16px] text-ink-soft">/10</span></p>
          <p className="mt-4 rounded-lg bg-v-chip px-3 py-2 text-[14px]"><b>{Number(a.commissionPct).toFixed(1)} %</b> base commission · scales to 10 % with volume</p>
          <p className="mt-2 text-[12px] text-v-muted">{a.gstNumber ? "GST verified" : "GST pending expert review"} · founder contact logged</p>
        </div>
        <div className="rounded-xl border border-v-line p-6">
          <p className="text-[13px] font-bold tracking-wide text-v-muted uppercase">The &ldquo;First Order Rush&rdquo; tier unlock</p>
          <p className="mt-2 text-[16px] font-bold text-v-deep">⚡ You are 1 order away from Level 2!</p>
          <div className="mt-3 h-2 rounded-full bg-v-panel"><div className="h-2 w-[80%] rounded-full bg-v-green" /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-v-tint p-3"><p className="text-[14px] font-semibold">{formatINR(FIRST_ORDER_BONUS)} cash bonus</p><p className="text-[12px] text-ink-soft">Added to your Loky Wallet on first confirmed order.</p></div>
            <div className="rounded-lg bg-v-tint p-3"><p className="text-[14px] font-semibold">+{LEVEL2_COMMISSION_BOOST} % commission upgrade</p><p className="text-[12px] text-ink-soft">Permanent boost to {(Number(a.commissionPct) + LEVEL2_COMMISSION_BOOST).toFixed(1)} % margin.</p></div>
          </div>
          <Link href="/agency/proposals/new" className="mt-5 inline-flex h-11 items-center rounded-lg bg-v-deep px-5 text-[14px] font-semibold text-white">Create your first campaign →</Link>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-v-line p-4"><p className="flex items-center gap-2 text-[13px] font-bold"><PhoneCall className="size-4 text-v-green" /> Expert call SLA guarantee</p><p className="mt-1 text-[12.5px] text-ink-soft">Our specialist calls within the hour to verify parameters, help set margins and approve your credentials.</p></div>
          <div className="rounded-xl border border-v-line p-4"><p className="flex items-center gap-2 text-[13px] font-bold"><PlayCircle className="size-4 text-v-green" /> Educational pitch walkthrough</p><p className="mt-1 text-[12.5px] text-ink-soft">How we make you earn more (1:30 min).</p></div>
          <div className="rounded-xl border border-v-line p-4"><p className="text-[13px] font-bold">Immediate exploration suite</p><ul className="mt-2 space-y-1.5 text-[13px]"><li><Link href="/agency/proposals/new" className="text-v-green hover:underline">A · Use Loky Lab (mockups)</Link></li><li><Link href="/agency/quotations/new" className="text-v-green hover:underline">B · Create quotations</Link></li><li><Link href="/agency/screens" className="text-v-green hover:underline">C · Browse live screens</Link></li></ul></div>
          <Link href="/agency" className="block rounded-lg border border-v-line px-4 py-2.5 text-center text-[14px] font-semibold hover:bg-v-panel">Enter my dashboard</Link>
        </aside>
      </div>
    </>
  );
}
