import { redirect } from "next/navigation";
import { AssessmentForm } from "@/components/agency/assessment-form";
import { AgencyPageHeader } from "@/components/agency/shell";
import { loadAgencyPage } from "@/services/agency-page";

export default async function AssessmentPage() {
  const { a } = await loadAgencyPage();
  if (a.status === "partner") redirect("/agency/assessment/success");
  return (
    <>
      <AgencyPageHeader title="Partner assessment" subtitle="Interactive diagnostic: tell us what your agency does and we unlock your dynamic commission tier." />
      <div className="max-w-[820px] px-8 py-6"><div className="rounded-xl border border-v-line p-6"><AssessmentForm /></div></div>
    </>
  );
}
