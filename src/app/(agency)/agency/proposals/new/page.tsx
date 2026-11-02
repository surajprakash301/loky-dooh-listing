import { ProposalForm } from "@/components/agency/proposal-form";
import { AgencyPageHeader } from "@/components/agency/shell";
import { listBrands, liveScreens } from "@/services/agency";
import { loadAgencyPage } from "@/services/agency-page";
import { toPicker } from "@/services/catalog";

export default async function NewProposalPage(props: PageProps<"/agency/proposals/new">) {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const sp = await props.searchParams;
  const [brands, screens] = await Promise.all([listBrands(a.id), liveScreens()]);
  return (<><AgencyPageHeader title="Visual pitch builder" subtitle="Campaign suggestion & visual proposal generation, without pricing." /><div className="px-8 py-6"><ProposalForm brands={brands.map((b) => ({ id: b.id, name: b.name }))} screens={screens.map(toPicker)} brandId={sp.brand ? Number(sp.brand) : undefined} /></div></>);
}
