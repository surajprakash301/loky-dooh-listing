import { AuthCard } from "@/components/auth/auth-card";

export const metadata = { title: "Partner with Loky Media — Agency registration" };

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <AuthCard title="Register your agency" subtitle="Three quick steps: agency profile, founder details, verification. Then your workspace opens.">{children}</AuthCard>;
}
