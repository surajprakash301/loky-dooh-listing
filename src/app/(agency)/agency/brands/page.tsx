import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import { AgencyPageHeader } from "@/components/agency/shell";
import { formatDate, formatINR } from "@/lib/format";
import { listBrands } from "@/services/agency";
import { loadAgencyPage } from "@/services/agency-page";
import { fileUrl } from "@/services/files";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = { active: "bg-v-chip text-v-deep", upcoming: "bg-v-orange-tint text-v-rust", paused: "bg-amber-50 text-amber-700", past: "bg-v-panel text-ink-soft" };

export default async function BrandsPage() {
  const { a } = await loadAgencyPage();
  const brands = await listBrands(a.id);
  const live = brands.filter((b) => b.status !== "past");
  return (
    <>
      <AgencyPageHeader title="Brands & Clients" subtitle="Manage your agency's key relationships and campaign ownership." actions={<><Link href="/agency/team" className="inline-flex h-11 items-center gap-2 rounded-lg border border-v-line px-4 text-[14px] font-semibold"><UserPlus className="size-4" /> Add team member</Link><Link href="/agency/brands/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-v-deep px-5 text-[14px] font-semibold text-white"><Plus className="size-4" /> Add new brand</Link></>} />
      <div className="px-8 py-6">
        <h2 className="text-[15px] font-bold">Live / active campaigns</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {live.map((b) => {
            const active = (b.campaigns ?? []).filter((c) => c.status === "active" || c.status === "confirmed");
            const logo = fileUrl(b.logo);
            return (
              <div key={b.id} className="rounded-xl border border-v-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">{logo ? <img src={logo} alt="" className="size-11 rounded-lg object-cover" /> : <span className="grid size-11 place-items-center rounded-lg bg-v-panel text-[15px] font-bold">{b.name[0]}</span>}<div><Link href={`/agency/brands/${b.id}`} className="text-[15px] font-semibold hover:underline">{b.name}</Link><p className="text-[12px] text-ink-soft">{b.hq ?? "—"} · {b.category ?? "—"}</p></div></div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", TONE[b.status])}>{active.length ? `${active.length} active` : b.status}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-soft">{b.manager ? <>{b.manager.user?.name}<br /><span className="text-v-muted">Account manager</span></> : <span className="text-v-rust">Unassigned · click to assign</span>}</span>
                  <span className="text-ink-soft">{b.lockedUntil && b.lockedUntil > new Date() ? `Locked till ${formatDate(b.lockedUntil)}` : `${b.campaigns?.length ?? 0} orders`}</span>
                </div>
                <div className="mt-3 flex gap-2"><Link href={`/agency/proposals/new?brand=${b.id}`} className="h-9 rounded-lg bg-v-deep px-3 text-[12.5px] leading-9 font-semibold text-white">Create campaign</Link><Link href={`/agency/brands/${b.id}`} className="h-9 rounded-lg border border-v-line px-3 text-[12.5px] leading-9 font-semibold">View workspace</Link></div>
              </div>
            );
          })}
          <Link href="/agency/brands/new" className="grid min-h-[180px] place-items-center rounded-xl border-2 border-dashed border-v-line text-center text-ink-soft hover:border-v-green"><span><span className="grid size-10 place-items-center rounded-full bg-v-panel text-[20px]">+</span><p className="mt-2 text-[14px] font-semibold text-ink">New brand partnership</p><p className="text-[12px]">Onboard a new client and assign dedicated resources.</p></span></Link>
        </div>
        <h2 className="mt-8 text-[15px] font-bold">Client history & past partnerships</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-v-line">
          <table className="w-full min-w-[720px] text-[13.5px]">
            <thead className="bg-v-panel text-[11px] font-semibold tracking-wide text-ink-soft uppercase"><tr><th className="px-4 py-3 text-left">Brand</th><th className="px-4 py-3 text-left">Last campaign</th><th className="px-4 py-3 text-left">Total spent</th><th className="px-4 py-3 text-left">Orders</th><th className="px-4 py-3"></th></tr></thead>
            <tbody>
              {brands.map((b) => { const spent = (b.campaigns ?? []).reduce((s, c) => s + Number(c.total), 0); const last = (b.campaigns ?? [])[0]; return (
                <tr key={b.id} className="border-t border-v-line"><td className="px-4 py-3 font-medium">{b.name}<p className="text-[12px] font-normal text-v-muted">{b.category ?? ""}</p></td><td className="px-4 py-3">{last ? formatDate(new Date(last.startDate)) : "—"}</td><td className="px-4 py-3">{formatINR(spent)}</td><td className="px-4 py-3">{b.campaigns?.length ?? 0}</td><td className="px-4 py-3 text-right"><Link href={`/agency/quotations/new?brand=${b.id}`} className="rounded-lg bg-v-rust px-3 py-1.5 text-[12.5px] font-semibold text-white">Send custom quotation</Link></td></tr>
              ); })}
              {brands.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-soft">No brands yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
