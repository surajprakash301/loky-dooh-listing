import { redirect } from "next/navigation";

export default async function OnboardIndex({ params }: PageProps<"/rep/onboard/[vendorId]">) {
  const { vendorId } = await params;
  redirect(`/rep/onboard/${vendorId}/business`);
}
