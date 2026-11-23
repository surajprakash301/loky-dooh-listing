import { deleteVoucherAction, toggleVoucherAction } from "@/actions/vouchers";
import { VoucherForm } from "@/components/admin/voucher-form";
import { PageHeader, Panel } from "@/components/portal/shell";
import { CustomerQuotation, Voucher } from "@/db";
import { formatDateLong } from "@/lib/format";
import { requireRole } from "@/lib/server/auth";

export const metadata = { title: "Vouchers — Loky Media Admin" };

export default async function VouchersPage() {
  await requireRole("admin");
  const vouchers = await Voucher.findAll({ order: [["createdAt", "DESC"]] });
  const used = new Map<number, number>();
  for (const v of vouchers) used.set(v.id, await CustomerQuotation.count({ where: { voucherId: v.id } }));
  return (
    <>
      <PageHeader title="Vouchers" subtitle="Percentage discounts advertisers can apply while creating a quotation. Only active vouchers are shown to them." />
      <div className="grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_440px]">
        <Panel title={`Vouchers (${vouchers.length})`}>
          {vouchers.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-ink-soft">No vouchers yet. Create the first one on the right.</p>
          ) : (
            <table className="w-full text-[13.5px]" data-testid="voucher-table">
              <thead className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">
                <tr><th className="py-2 text-left">Voucher</th><th className="py-2 text-left">Discount</th><th className="py-2 text-left">Used</th><th className="py-2 text-left">Status</th><th className="py-2 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id} className="border-t border-v-line align-top" data-testid={`voucher-row-${v.id}`}>
                    <td className="py-3 pr-3">
                      <p className="font-semibold">{v.title}</p>
                      {v.subtitle && <p className="text-[12.5px] text-ink-soft">{v.subtitle}</p>}
                      <p className="mt-0.5 text-[11.5px] text-v-muted">Created {formatDateLong(v.createdAt)}</p>
                    </td>
                    <td className="py-3 font-semibold whitespace-nowrap">{Number(v.discountPct)}% off</td>
                    <td className="py-3 whitespace-nowrap text-ink-soft">{used.get(v.id) ?? 0} quotation{(used.get(v.id) ?? 0) === 1 ? "" : "s"}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${v.isActive ? "bg-v-chip text-v-deep" : "bg-v-line text-v-muted"}`}>
                        <span className="size-1.5 rounded-full bg-current" /> {v.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-3 whitespace-nowrap">
                        <form action={toggleVoucherAction.bind(null, v.id)}><button className="font-semibold text-v-deep hover:underline">{v.isActive ? "Mark inactive" : "Mark active"}</button></form>
                        <form action={deleteVoucherAction.bind(null, v.id)}><button className="font-semibold text-v-red hover:underline">Delete</button></form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="New voucher"><VoucherForm /></Panel>
      </div>
    </>
  );
}
