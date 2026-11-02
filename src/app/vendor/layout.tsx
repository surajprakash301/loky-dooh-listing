import type { Metadata } from "next";
import { VendorSidebar, VendorTopbar } from "@/components/vendor/shell";
import { loadMyVendor, profileOf } from "@/services/vendor-portal";

export const metadata: Metadata = {
  title: "Vendor Console — Loky Media",
};

export default async function VendorLayout({ children }: LayoutProps<"/vendor">) {
  const { s, v } = await loadMyVendor();
  const profile = profileOf(v, s.name);
  return (
    <div className="flex min-h-screen flex-col bg-white font-inter text-ink">
      <VendorTopbar profile={profile} />
      <div className="flex flex-1">
        <VendorSidebar profile={profile} />
        <main className="min-w-0 flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}
