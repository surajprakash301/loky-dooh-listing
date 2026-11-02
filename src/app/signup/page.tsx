import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getSession } from "@/lib/server/auth";
import { homeFor } from "@/lib/session";

export const metadata = { title: "Create account — Loky Media" };

export default async function SignupPage(props: PageProps<"/signup">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const s = await getSession();
  if (s) redirect(homeFor(s.role));
  return (
    <AuthCard
      title="Create an advertiser account"
      subtitle="Browse, shortlist and book DOOH billboards across India."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-v-green hover:underline">
            Sign in
          </Link>
          <span className="mx-2 text-v-line">|</span>
          Vendors are onboarded by a Loky representative and receive their login from them.
        </>
      }
    >
      <SignupForm next={next} />
    </AuthCard>
  );
}
