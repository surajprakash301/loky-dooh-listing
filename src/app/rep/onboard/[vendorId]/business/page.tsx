import { saveBusinessAction } from "@/actions/onboarding";
import { BusinessForm } from "@/components/rep/business-form";
import { SectionFrame } from "@/components/rep/section-frame";
import { fileUrl } from "@/services/files";
import { loadStepPage } from "@/services/rep-page";

export default async function BusinessPage(props: PageProps<"/rep/onboard/[vendorId]/business">) {
  const { vendorId } = await props.params;
  const sp = await props.searchParams;
  const { v, step } = await loadStepPage(vendorId);
  const st = step("business");
  return (
    <SectionFrame step={st} saved={sp.saved === "business"}>
      <BusinessForm
        action={saveBusinessAction.bind(null, v.id)}
        locked={!st.editable}
        initial={{
          legalName: v.legalName ?? "",
          tradeName: v.tradeName ?? "",
          businessType: v.businessType ?? "",
          gstNumber: v.gstNumber ?? "",
          panNumber: v.panNumber ?? "",
          addressLine: v.addressLine ?? "",
          city: v.city ?? "",
          state: v.state ?? "",
          pincode: v.pincode ?? "",
          logoUrl: fileUrl(v.logo),
        }}
      />
    </SectionFrame>
  );
}
