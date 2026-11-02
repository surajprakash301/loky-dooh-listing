import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/server/auth";

export const metadata = { title: "Representative portal — Loky Media" };

export default async function RepLayout({ children }: LayoutProps<"/rep">) {
  const session = await requireRole("representative");
  return (
    <PortalShell
      session={session}
      title="Rep portal"
      nav={[
        { href: "/rep", label: "My onboardings", sub: "Drafts, reviews, approved", icon: "list", exact: true },
        { href: "/rep/new", label: "New onboarding", sub: "Start a vendor visit", icon: "plus" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
