import { QuotationForm } from "@/components/agency/quotation-form";
import { AgencyPageHeader } from "@/components/agency/shell";
import { listBrands, liveScreens } from "@/services/agency";
import { loadAgencyPage } from "@/services/agency-page";
import { toPicker } from "@/services/catalog";
import { loadProposal } from "@/services/deals";

export default async function NewQuotationPage(props: PageProps<"/agency/quotations/new">) {
  const { a } = await loadAgencyPage({ requirePartner: true });
  const sp = await props.searchParams;
  const proposal = sp.proposal ? await loadProposal(a.id, Number(sp.proposal)).catch(() => null) : null;
  const [brands, screens] = await Promise.all([listBrands(a.id), liveScreens()]);
  return (<><AgencyPageHeader title="Commercial quotation builder" subtitle="Custom pricing, package & EMI tiers, coupon integration, white-label export." /><div className="px-8 py-6"><QuotationForm brands={brands.map((b) => ({ id: b.id, name: b.name }))} screens={screens.map(toPicker)} brandId={proposal?.brandId ?? (sp.brand ? Number(sp.brand) : undefined)} proposalId={proposal?.id} initialScreens={proposal?.items?.map((i) => i.billboardId) ?? []} title={proposal ? `${proposal.title} — commercial quotation` : undefined} /></div></>);
}
