import { toggleCouponAction } from "@/actions/admin-agency";
import { CouponForm } from "@/components/admin/agency-controls";
import { PageHeader, Panel } from "@/components/portal/shell";
import { Coupon } from "@/db";
import { requireRole } from "@/lib/server/auth";
import { formatINR } from "@/lib/format";

export default async function CouponsPage() {
  await requireRole("admin");
  const coupons = await Coupon.findAll({ order: [["createdAt", "DESC"]] });
  return (
    <>
      <PageHeader title="Coupons" subtitle="Promo codes agencies can apply in the quotation builder." />
      <div className="grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_480px]">
        <Panel title={`Codes (${coupons.length})`}><table className="w-full text-[13.5px]"><thead className="text-[11px] font-semibold tracking-wide text-v-muted uppercase"><tr><th className="py-2 text-left">Code</th><th className="py-2 text-left">Discount</th><th className="py-2 text-left">Description</th><th className="py-2 text-left">Active</th></tr></thead><tbody>{coupons.map((c) => <tr key={c.id} className="border-t border-v-line"><td className="py-2.5 font-mono">{c.code}</td><td className="py-2.5">{c.type === "flat" ? formatINR(c.value) : `${Number(c.value)}%`}</td><td className="py-2.5 text-ink-soft">{c.description}</td><td className="py-2.5"><form action={toggleCouponAction.bind(null, c.id)}><button className={c.isActive ? "font-semibold text-v-deep hover:underline" : "text-v-muted hover:underline"}>{c.isActive ? "Active · disable" : "Disabled · enable"}</button></form></td></tr>)}</tbody></table></Panel>
        <Panel title="New coupon"><CouponForm /></Panel>
      </div>
    </>
  );
}
