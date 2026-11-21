import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { CodeForm, PhoneForm } from "@/components/auth/otp-login-form";
import { getSession } from "@/lib/server/auth";

export const metadata = { title: "Sign in with mobile — Loky Media" };

export default async function OtpLoginPage(props: PageProps<"/login/otp">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : undefined;
  const store = await cookies();
  const sent = sp.sent === "1" && !!store.get("loky_otp_uid")?.value;
  const s = await getSession();
  if (s && !sent) redirect(next ?? (s.role === "customer" ? "/my/quotations" : "/"));
  return (
    <AuthCard
      title={sent ? "Enter your code" : "Sign in with your mobile"}
      subtitle={sent ? "We sent a one-time code to your mobile number." : "Advertisers sign in with the mobile number used on a quotation."}
      footer={
        <>
          Staff, vendor or agency? <Link href="/login" className="font-semibold text-v-green hover:underline">Sign in with a password</Link>
          {sent && (
            <>
              <span className="mx-2 text-v-line">|</span>
              <Link href="/login/otp" className="hover:underline">Use a different number</Link>
            </>
          )}
        </>
      }
    >
      {sent ? <CodeForm devCode={store.get("loky_dev_otp")?.value ?? null} resent={sp.resent === "1"} fresh={sp.new === "1"} /> : <PhoneForm next={next} />}
    </AuthCard>
  );
}
