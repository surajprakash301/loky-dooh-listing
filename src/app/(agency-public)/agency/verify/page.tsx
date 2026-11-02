import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resendOtpAction } from "@/actions/agency";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpForm } from "@/components/agency/register-forms";
import { requireRole } from "@/lib/server/auth";
import { loadAgency } from "@/services/agency";

export const metadata = { title: "Verify your agency — Loky Media" };

export default async function VerifyPage(props: PageProps<"/agency/verify">) {
  const s = await requireRole("agency");
  const a = s.agencyId ? await loadAgency(s.agencyId) : null;
  if (!a) redirect("/agency/register");
  if (a.verifiedAt) redirect("/agency");
  const sp = await props.searchParams;
  const devCode = (await cookies()).get("loky_dev_otp")?.value ?? null;
  const channel = a.verificationPath === "enterprise" ? `work email ${a.founderEmail}` : `mobile ${a.founderPhone}`;
  return (
    <AuthCard
      title={a.verificationPath === "unregistered" ? "Verify & talk to an expert" : "Verify your identity"}
      subtitle={a.verificationPath === "enterprise" ? "Enterprise domain detected: one email OTP and you are in." : a.verificationPath === "public" ? "Public email domain: mobile OTP plus GST check." : "No GSTIN on file: a Loky expert will call within the hour; verify your mobile to continue meanwhile."}
      footer={<form action={resendOtpAction}><button type="submit" className="font-semibold text-v-green hover:underline">Resend code</button><span className="mx-2 text-v-line">|</span><Link href="/login" className="hover:underline">Sign in later</Link></form>}
    >
      <OtpForm channel={channel} devCode={devCode} resent={sp.resent === "1"} />
    </AuthCard>
  );
}
