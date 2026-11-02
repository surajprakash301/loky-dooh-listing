import Link from "next/link";
import { AgencyPageHeader } from "@/components/agency/shell";
import { formatINR, formatImpressions } from "@/lib/format";
import { liveScreens } from "@/services/agency";
import { loadAgencyPage } from "@/services/agency-page";
import { headlinePrice, mediaUrls } from "@/services/catalog";

export default async function ScreensPage() {
  await loadAgencyPage({ requirePartner: true });
  const screens = await liveScreens();
  return (
    <>
      <AgencyPageHeader title="Live Screens" subtitle="Every approved DOOH screen on the Loky network, with wholesale rates and current occupancy." actions={<Link href="/agency/proposals/new" className="h-11 rounded-lg bg-v-deep px-5 text-[14px] leading-[44px] font-semibold text-white">Build a proposal</Link>} />
      <div className="grid gap-4 px-8 py-6 md:grid-cols-2 xl:grid-cols-3">
        {screens.map((b) => { const img = mediaUrls(b)[0]; const price = headlinePrice(b); const booked = (b.bookings ?? []).filter((x) => x.campaign && ["confirmed", "active"].includes(x.campaign.status)).length; return (
          <div key={b.id} className="overflow-hidden rounded-xl border border-v-line">
            <div className="relative h-40 bg-v-panel">{img && <img src={img} alt="" className="h-full w-full object-cover" />}<span className="absolute top-2 left-2 rounded-full bg-v-bright px-2 py-0.5 text-[10px] font-bold text-v-deep uppercase">{b.liveStatus}</span></div>
            <div className="p-4"><p className="truncate text-[15px] font-semibold">{b.name}</p><p className="text-[12.5px] text-ink-soft">{b.locality}, {b.city} · #{b.code} · {b.vendor?.tradeName}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]"><div><p className="text-v-muted">Reach/day</p><p className="font-semibold">{formatImpressions(b.dailyImpressions)}</p></div><div><p className="text-v-muted">Slots</p><p className="font-semibold">{booked}/{b.slotsPerLoop} booked</p></div><div><p className="text-v-muted">From</p><p className="font-semibold text-v-deep">{price ? formatINR(price.price) : "—"}</p></div></div>
              <div className="mt-3 flex gap-2"><Link href={`/billboard/${b.code}`} target="_blank" className="text-[12.5px] font-semibold text-v-green hover:underline">Public listing ↗</Link></div>
            </div>
          </div>
        ); })}
        {screens.length === 0 && <p className="text-ink-soft">No live screens yet.</p>}
      </div>
    </>
  );
}
