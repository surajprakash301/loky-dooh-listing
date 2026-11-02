import { redirect } from "next/navigation";
import { AgencyProfileForm } from "@/components/agency/register-forms";
import { getSession } from "@/lib/server/auth";

export default async function RegisterPage() {
  const s = await getSession();
  if (s?.agencyId) redirect("/agency");
  return <AgencyProfileForm />;
}
