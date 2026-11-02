import { createDraftAction } from "@/actions/onboarding";
import { PageHeader, Panel } from "@/components/portal/shell";

export default function NewOnboardingPage() {
  return (
    <>
      <PageHeader title="New vendor onboarding" subtitle="Five sections: business, contacts, KYC, bank, and at least one billboard." />
      <div className="max-w-[720px] px-6 py-6 md:px-8">
        <Panel title="Before you start">
          <ul className="list-disc space-y-1.5 pl-5 text-[14px] text-ink-soft">
            <li>Have the GST certificate, PAN card, a cancelled cheque and the signed partner agreement ready to upload (PDF or photo).</li>
            <li>Take at least one daytime photo of every billboard; a night photo and a short traffic video help the listing.</li>
            <li>You can save and leave at any step. Nothing reaches the admin until you press Submit.</li>
            <li>On submit, the vendor&apos;s username and temporary password are shown once. Hand them over on the spot.</li>
          </ul>
          <form action={createDraftAction} className="mt-6">
            <button type="submit" className="inline-flex h-11 items-center rounded-lg bg-v-deep px-5 text-[14px] font-semibold text-white hover:bg-v-deep/90">
              Start onboarding
            </button>
          </form>
        </Panel>
      </div>
    </>
  );
}
