import { PasswordForm } from "@/components/auth/password-form";
import { getSession } from "@/lib/server/auth";
import { VCard } from "@/components/vendor/ui";

export const metadata = { title: "Password — Loky Media Vendor" };

export default async function VendorPasswordPage() {
  const s = await getSession();
  return (
    <div className="px-8 py-8">
      <h1 className="text-[26px] font-bold tracking-tight">Account password</h1>
      <p className="mt-1 text-[14px] text-ink-soft">Signed in as <span className="font-mono">{s?.name}</span>.</p>
      <VCard className="mt-6 max-w-[480px] p-6">
        <PasswordForm forced={!!s?.mustChangePassword} />
      </VCard>
    </div>
  );
}
