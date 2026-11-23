import { QuoteBuilder } from "@/components/quote/quote-builder";
import { SiteHeader } from "@/components/site/site-header";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { User } from "@/db";
import { getSession } from "@/lib/server/auth";
import { activeVouchers } from "@/services/quotes";

export const metadata = { title: "Create a quotation — Loky Media" };

export default async function NewQuotePage() {
  const s = await getSession();
  const vouchers = await activeVouchers();
  const u = s?.role === "customer" ? await User.findByPk(s.uid, { attributes: ["name", "email", "phone"] }) : null;
  return (
    <>
      <SiteHeader variant="listing" />
      <div className="mx-auto max-w-[1512px] px-8 pt-5 pb-20">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Digital OOH", href: "/listing" }, { label: "Quotation" }]} />
        <h1 className="mt-3 text-[26px] font-bold">Create your quotation</h1>
        <p className="mt-1 text-[14px] text-ink-soft">Choose the campaign length and slot, check the rates, and tell us who the quotation is for.</p>
        <div className="mt-6">
          <QuoteBuilder prefill={{ name: u?.name, email: u?.email ?? undefined, phone: u?.phone ?? undefined }} signedIn={!!u} vouchers={vouchers} />
        </div>
      </div>
    </>
  );
}
