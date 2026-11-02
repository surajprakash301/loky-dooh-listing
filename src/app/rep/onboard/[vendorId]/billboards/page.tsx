import Image from "next/image";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { deleteBillboardAction } from "@/actions/onboarding";
import { Notice } from "@/components/portal/form";
import { Panel } from "@/components/portal/shell";
import { StatusPill } from "@/components/portal/status";
import { SubmitNewBillboard } from "@/components/rep/submit-new-billboard";
import { fileUrl } from "@/services/files";
import { billboardProblems } from "@/services/onboarding";
import { loadStepPage } from "@/services/rep-page";

export default async function BillboardsPage(props: PageProps<"/rep/onboard/[vendorId]/billboards">) {
  const { vendorId } = await props.params;
  const sp = await props.searchParams;
  const { v, steps } = await loadStepPage(vendorId);
  const boards = v.billboards ?? [];
  const canAdd = v.status === "draft" || v.status === "approved";
  return (
    <div className="flex flex-col gap-4">
      {sp.saved === "billboard" && <Notice tone="success">Billboard saved.</Notice>}
      {sp.saved === "submitted" && <Notice tone="success">Billboard sent to the admin for review.</Notice>}
      <Panel
        title={`E · Billboards (${boards.length})`}
        aside={canAdd ? <Link href={`/rep/onboard/${v.id}/billboards/new`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-v-deep px-3.5 text-[13px] font-semibold text-white"><Plus className="size-4" /> Add billboard</Link> : undefined}
      >
        {boards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-v-line bg-v-tint p-8 text-center">
            <p className="font-semibold">No billboards yet</p>
            <p className="mt-1 text-[13.5px] text-ink-soft">At least one billboard is required before you can submit.</p>
            <Link href={`/rep/onboard/${v.id}/billboards/new`} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-lg bg-v-deep px-4 text-[13px] font-semibold text-white"><Plus className="size-4" /> Add the first billboard</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {boards.map((b) => {
              const cover = b.media?.find((m) => m.isCover) ?? b.media?.[0];
              const url = fileUrl(cover?.file);
              const step = steps.find((s) => s.billboardId === b.id)!;
              const problems = billboardProblems(b);
              return (
                <article key={b.id} className="flex min-w-0 gap-4 rounded-xl border border-v-line p-3">
                  <div className="relative size-[108px] shrink-0 overflow-hidden rounded-lg bg-v-panel">
                    {url ? <Image src={url} alt="" fill sizes="108px" className="object-cover" unoptimized /> : <span className="grid h-full place-items-center text-[11px] text-v-muted">no photo</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Link href={step.href} className="min-w-0 flex-1 truncate text-[15px] font-semibold hover:underline">{b.name}</Link>
                      <StatusPill status={b.status} />
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-ink-soft"><MapPin className="size-3.5" /> {b.locality}, {b.city} · <span className="font-mono">#{b.code}</span></p>
                    {step.remark && <p className="mt-1.5 rounded bg-v-orange-tint px-2 py-1 text-[12px] text-v-rust">Admin: {step.remark}</p>}
                    {problems.length > 0 && <p className="mt-1.5 text-[12px] text-v-red">Still {problems.join(", ")}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px]">
                      <Link href={step.href} className="font-semibold text-v-green hover:underline">{step.editable ? "Edit" : "View"}</Link>
                      {b.status === "draft" && v.status === "approved" && <SubmitNewBillboard vendorId={v.id} billboardId={b.id} disabled={problems.length > 0} />}
                      {b.status === "draft" && (
                        <form action={deleteBillboardAction.bind(null, v.id, b.id)}>
                          <button type="submit" className="text-v-red hover:underline">Remove</button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
