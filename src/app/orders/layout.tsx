import Link from "next/link";
import { Suspense } from "react";
import { AdvertiserLogin } from "@/components/auth/advertiser-login";
import { CampaignBar } from "@/components/campaign/campaign-bar";
import { OrdersTabs } from "@/components/quote/orders-tabs";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { SiteHeader } from "@/components/site/site-header";
import { getSession } from "@/lib/server/auth";

/**
 * The advertiser's "Orders" section of the marketplace: same header and navigation as every other page.
 * Without a session it shows a sign-in prompt and opens the sign-in popup (code step when one is pending).
 */
export default async function OrdersLayout({ children }: LayoutProps<"/orders">) {
  const s = await getSession();
  const customer = s?.role === "customer";
  return (
    <>
      <div className="print:hidden"><SiteHeader variant="listing" /></div>
      <CampaignBar />
      <div className="mx-auto max-w-[1512px] px-8 pt-5 pb-20">
        <div className="print:hidden">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Orders" }]} />
          <h1 className="mt-3 text-[26px] font-bold">{customer ? `${s!.name.split(" ")[0]}'s orders` : "Orders"}</h1>
          <OrdersTabs />
        </div>
        <div className="mt-6">
          {customer ? (
            children
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center" data-testid="orders-signin-prompt">
              <h2 className="text-[20px] font-bold">Sign in to see your quotations and orders</h2>
              <p className="mx-auto mt-2 max-w-[520px] text-[14px] text-ink-soft">
                {s ? "This section is for advertisers. Your account is a staff or partner login; use its own portal from the header." : "Use the mobile number from your quotation. No password is needed."}
              </p>
              {!s && (
                <div className="mt-5 flex justify-center gap-3">
                  <Suspense><AdvertiserLogin pendingCode={null} autoOpen={false} variant="button" /></Suspense>
                  <Link href="/listing?view=map" className="inline-flex h-10 items-center rounded-lg border border-ink/25 bg-white px-4 text-[14px] font-semibold">Browse billboards</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
