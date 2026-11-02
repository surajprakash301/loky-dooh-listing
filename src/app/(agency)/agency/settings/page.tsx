import { PasswordForm } from "@/components/auth/password-form";
import { AgencyPageHeader } from "@/components/agency/shell";
import { Notice } from "@/components/portal/form";
import { FOUNDER_ROLE_LABEL } from "@/lib/domain";
import { formatDateTime } from "@/lib/format";
import { activityFeed } from "@/services/agency";
import { loadAgencyPage } from "@/services/agency-page";

export default async function SettingsPage(props: PageProps<"/agency/settings">) {
  const { a } = await loadAgencyPage();
  const sp = await props.searchParams;
  const feed = await activityFeed(a.id);
  return (
    <>
      <AgencyPageHeader title="Agency settings" subtitle="Profile, verification and account security." />
      <div className="grid gap-6 px-8 py-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          {sp.suspended && <Notice tone="error">This agency account is suspended. Contact Loky Media.</Notice>}
          <section className="rounded-xl border border-v-line p-5"><h2 className="text-[15px] font-bold">Agency profile</h2><dl className="mt-3 grid gap-3 text-[13.5px] sm:grid-cols-2">{[["Legal name", a.legalName], ["GSTIN", a.gstNumber ?? "Not provided (expert review)"], ["Address", `${a.addressLine}, ${a.city}, ${a.state} ${a.pincode ?? ""}`], ["Founder", `${a.founderName} · ${FOUNDER_ROLE_LABEL[a.founderRole]}`], ["Contact", `${a.founderPhone} · ${a.founderEmail}`], ["Verification", `${a.verificationPath} · ${a.verifiedAt ? "verified " + formatDateTime(a.verifiedAt) : "pending"}`], ["Partner status", a.status === "partner" ? `Partner · Level ${a.level} · ${Number(a.commissionPct).toFixed(1)}% commission` : a.status]].map(([k, v]) => <div key={k}><dt className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">{k}</dt><dd className="mt-0.5">{v}</dd></div>)}</dl></section>
          <section className="rounded-xl border border-v-line p-5"><h2 className="text-[15px] font-bold">Activity log</h2><ul className="mt-2 divide-y divide-v-line text-[13px]">{feed.map((f) => <li key={f.id} className="py-2"><p>{f.message}</p><p className="text-[11.5px] text-v-muted">{formatDateTime(f.createdAt)}{f.actor ? ` · ${f.actor.name}` : ""}</p></li>)}</ul></section>
        </div>
        <section className="rounded-xl border border-v-line p-5"><h2 className="text-[15px] font-bold">Change password</h2><div className="mt-3"><PasswordForm /></div></section>
      </div>
    </>
  );
}
