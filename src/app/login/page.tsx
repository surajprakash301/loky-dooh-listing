import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/server/auth";
import { homeFor } from "@/lib/session";

export const metadata = { title: "Sign in — Loky Media" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const s = await getSession();
  if (s) redirect(next && next.startsWith("/") ? next : homeFor(s.role));
  return (
    <AuthCard
      title="Sign in"
      subtitle="Admins, representatives, vendors and advertisers all sign in here."
      footer={
        <>
          Agency? <Link href="/agency/register" className="font-semibold text-v-green hover:underline">Register as a Loky partner</Link>
          <span className="mx-2 text-v-line">|</span>
          Advertiser without an account?{" "}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-v-green hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
