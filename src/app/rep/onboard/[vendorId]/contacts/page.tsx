import { saveContactsAction } from "@/actions/onboarding";
import { ContactsForm, type ContactValues } from "@/components/rep/contacts-form";
import { SectionFrame } from "@/components/rep/section-frame";
import { loadStepPage } from "@/services/rep-page";

const empty: ContactValues = { name: "", designation: "", phone: "", email: "" };
const toValues = (c?: { name: string; designation: string | null; phone: string; email: string | null }): ContactValues =>
  c ? { name: c.name, designation: c.designation ?? "", phone: c.phone, email: c.email ?? "" } : empty;

export default async function ContactsPage(props: PageProps<"/rep/onboard/[vendorId]/contacts">) {
  const { vendorId } = await props.params;
  const sp = await props.searchParams;
  const { v, step } = await loadStepPage(vendorId);
  const st = step("contacts");
  const contacts = v.contacts ?? [];
  return (
    <SectionFrame step={st} saved={sp.saved === "contacts"}>
      <ContactsForm action={saveContactsAction.bind(null, v.id)} locked={!st.editable} primary={toValues(contacts.find((c) => c.isPrimary))} secondary={toValues(contacts.find((c) => !c.isPrimary))} />
    </SectionFrame>
  );
}
