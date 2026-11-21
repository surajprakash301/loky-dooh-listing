import Link from "next/link";
import { PackageOpen } from "lucide-react";

export const metadata = { title: "Orders — Loky Media" };

export default function PlacedOrdersPage() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center" data-testid="orders-empty">
      <PackageOpen className="mx-auto size-10 text-ink-soft" />
      <h2 className="mt-3 text-[20px] font-bold">No orders yet</h2>
      <p className="mx-auto mt-2 max-w-[460px] text-[14px] text-ink-soft">Orders appear here once a quotation is accepted and booked. Until then, your quotations live under <Link href="/orders" className="font-semibold text-green hover:underline">Active quotations</Link>.</p>
    </div>
  );
}
