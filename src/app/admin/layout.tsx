import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/server/auth";

export const metadata = { title: "Admin — Loky Media" };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireRole("admin");
  return (
    <PortalShell
      session={session}
      title="Admin"
      nav={[
        { href: "/admin/vendors", label: "Vendor onboarding", sub: "Pending · Approved · Rejected", icon: "review" },
        { href: "/admin/agencies", label: "Agencies", sub: "Partners & commissions", icon: "users" },
        { href: "/admin/coupons", label: "Coupons", sub: "Promo codes", icon: "list" },
        { href: "/admin/staff", label: "Staff accounts", sub: "Admins & representatives", icon: "users" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
