import { BrandForm } from "@/components/agency/brand-forms";
import { AgencyPageHeader } from "@/components/agency/shell";
import { loadAgencyPage } from "@/services/agency-page";

export default async function NewBrandPage() {
  await loadAgencyPage();
  return (<><AgencyPageHeader title="Add a brand" subtitle="Set up the client profile you will pitch and book media for." /><div className="max-w-[760px] px-8 py-6"><div className="rounded-xl border border-v-line p-6"><BrandForm /></div></div></>);
}
