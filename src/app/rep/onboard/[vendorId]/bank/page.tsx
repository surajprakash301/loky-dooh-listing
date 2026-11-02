import { saveBankAction } from "@/actions/onboarding";
import { BankForm } from "@/components/rep/bank-form";
import { SectionFrame } from "@/components/rep/section-frame";
import { loadStepPage } from "@/services/rep-page";

export default async function BankPage(props: PageProps<"/rep/onboard/[vendorId]/bank">) {
  const { vendorId } = await props.params;
  const sp = await props.searchParams;
  const { v, step } = await loadStepPage(vendorId);
  const st = step("bank");
  const b = v.bankAccount;
  return (
    <SectionFrame step={st} saved={sp.saved === "bank"}>
      <BankForm
        action={saveBankAction.bind(null, v.id)}
        locked={!st.editable}
        initial={{ accountHolder: b?.accountHolder ?? "", bankName: b?.bankName ?? "", branch: b?.branch ?? "", accountLast4: b?.accountLast4 ?? null, ifsc: b?.ifsc ?? "", upiId: b?.upiId ?? "" }}
      />
    </SectionFrame>
  );
}
