import { notFound } from "next/navigation";
import { Stepper } from "@/components/rep/stepper";
import { PageHeader } from "@/components/portal/shell";
import { StatusPill } from "@/components/portal/status";
import { requireRole } from "@/lib/server/auth";
import { loadVendor, stepStates } from "@/services/onboarding";

export default async function OnboardLayout({ children, params }: LayoutProps<"/rep/onboard/[vendorId]">) {
  const s = await requireRole("representative");
  const { vendorId } = await params;
  const v = await loadVendor(Number(vendorId));
  if (!v || v.onboardedBy !== s.uid) notFound();
  const steps = stepStates(v);
  return (
    <>
      <PageHeader
        back={{ href: "/rep", label: "My onboardings" }}
        title={v.tradeName ?? v.legalName ?? `Untitled draft #${v.id}`}
        subtitle={v.city ? `${v.city}, ${v.state}` : "Vendor onboarding"}
        actions={<StatusPill status={v.status} className="h-7 px-3 text-[12px]" />}
      />
      <div className="grid grid-cols-1 gap-6 px-6 py-6 md:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <Stepper steps={steps} vendorId={v.id} canAddBillboard={v.status === "draft" || v.status === "approved"} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
