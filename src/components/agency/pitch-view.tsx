import type { Proposal, Quotation } from "@/db";
import { PACKAGE_LABEL, PROPOSAL_THEME_LABEL, type Package } from "@/lib/domain";
import { formatDate, formatINR, formatImpressions } from "@/lib/format";
import { mediaUrls } from "@/services/catalog";
import { fileUrl } from "@/services/files";

const THEME_BG: Record<string, string> = { festive: "linear-gradient(135deg,#7a1f2b,#e0623c)", aesthetic: "linear-gradient(135deg,#0f2a1a,#2bb24c)", corporate: "linear-gradient(135deg,#0b1f3a,#2e9cd6)", launch: "linear-gradient(135deg,#1a1a1a,#9048c4)" };

/** The 5–8 page visual pitch (Phase 3). Strictly no pricing. Used by the agency preview and the public share page. */
export function PitchDocument({ p }: { p: Proposal }) {
  const creatives = (p.files ?? []).map((f) => fileUrl(f.file)).filter((u): u is string => !!u);
  const screens = (p.items ?? []).map((i) => i.billboard!).filter(Boolean);
  const agencyLogo = p.showAgencyLogo ? fileUrl(p.agency?.logo) : null;
  const reach = screens.reduce((s, b) => s + b.dailyImpressions, 0);
  const minLoop = Math.min(...screens.map((b) => b.loopSeconds));
  const runs = minLoop ? Math.round((14 * 3600) / minLoop) : 0;
  return (
    <div className="mx-auto max-w-[960px] space-y-6 font-inter">
      <section className="relative overflow-hidden rounded-2xl p-10 text-white" style={{ background: THEME_BG[p.theme] }}>
        <div className="flex items-center justify-between text-[12px] tracking-wide uppercase opacity-90"><span>{agencyLogo ? <img src={agencyLogo} alt="" className="h-8 object-contain" /> : p.agency?.legalName}</span><span>Exclusive Loky DOOH Partner</span></div>
        <p className="mt-10 text-[13px] font-semibold tracking-wide uppercase opacity-80">P1 · Cover & campaign theme · {PROPOSAL_THEME_LABEL[p.theme]}</p>
        <h1 className="mt-2 text-[40px] leading-tight font-bold">{p.title}</h1>
        <p className="mt-1 text-[18px] opacity-90">for {p.brand?.name}</p>
        {creatives[0] && <div className="mt-8 aspect-[2.2] overflow-hidden rounded-xl border-4 border-black/40 shadow-2xl">{/\.(mp4|webm|mov)$/i.test(creatives[0]) ? <video src={creatives[0]} className="h-full w-full object-cover" muted autoPlay loop playsInline /> : <img src={creatives[0]} alt="" className="h-full w-full object-cover" />}</div>}
      </section>
      <section className="grid gap-4 rounded-2xl border border-v-line p-8 sm:grid-cols-3">
        <div className="sm:col-span-3"><p className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">P2 · The promise (our deliverability)</p></div>
        {[[`${minLoop}-second loops`, "every ad cycle, all day"], [`${runs.toLocaleString("en-IN")} runs / day`, `per screen over ${14} operating hours`], [`${formatImpressions(reach)} reach / day`, `across ${screens.length} screen${screens.length === 1 ? "" : "s"}`]].map(([v, l]) => <div key={v} className="rounded-xl bg-v-tint p-4"><p className="text-[24px] font-bold text-v-deep">{v}</p><p className="text-[13px] text-ink-soft">{l}</p></div>)}
      </section>
      <section className="rounded-2xl border border-v-line p-8">
        <p className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">P3 · Comparative advantage</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-v-panel p-4"><p className="font-semibold">Traditional hoarding</p><ul className="mt-2 list-disc pl-5 text-[13px] text-ink-soft"><li>One creative for weeks</li><li>No proof of display</li><li>Print & mounting costs</li></ul></div>
          <div className="rounded-xl bg-v-chip p-4"><p className="font-semibold text-v-deep">Loky DOOH</p><ul className="mt-2 list-disc pl-5 text-[13px] text-ink-soft"><li>Video + banner, swap creatives any day</li><li>Camera-verified proof of play</li><li>Guaranteed play counts, analytics</li></ul></div>
        </div>
      </section>
      <section className="rounded-2xl border border-v-line p-8">
        <p className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">P4–P6 · Target location spotlights</p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          {screens.map((b) => { const imgs = mediaUrls(b); return (
            <div key={b.id} className="overflow-hidden rounded-xl border border-v-line">
              <div className="relative aspect-[16/10] bg-v-panel">{imgs[0] && <img src={imgs[0]} alt="" className="h-full w-full object-cover" />}{creatives[0] && !/\.(mp4|webm|mov)$/i.test(creatives[0]) && <img src={creatives[0]} alt="" className="absolute top-[18%] left-[22%] h-[40%] w-[56%] rounded-sm object-cover shadow-[0_0_30px_rgba(0,0,0,.6)] [transform:perspective(600px)_rotateY(-8deg)]" />}<span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">Day view · mockup</span></div>
              {imgs[1] && <div className="relative aspect-[16/6] bg-v-panel"><img src={imgs[1]} alt="" className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">Night view</span></div>}
              <div className="p-3"><p className="text-[14px] font-semibold">{b.name}</p><p className="text-[12px] text-ink-soft">{b.locality}, {b.city} · {b.category?.name} · {Number(b.widthFt)}×{Number(b.heightFt)} ft</p><p className="text-[12px] text-ink-soft">{formatImpressions(b.dailyImpressions)} reach/day · {b.opsStart}–{b.opsEnd} · {b.loopSeconds}s loop</p></div>
            </div>
          ); })}
        </div>
      </section>
      <section className="rounded-2xl border border-v-line p-8">
        <p className="text-[11px] font-semibold tracking-wide text-v-muted uppercase">P7–P8 · Demographics & advantages</p>
        <p className="mt-2 text-[14px] text-ink-soft">{p.objective ?? "High-frequency urban corridors covering youth, retail shoppers and daily commuters."}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Youth", "77%"], ["Retail shoppers", "63%"], ["Commuters", "7.2 lakh / week"]].map(([k, v]) => <div key={k} className="rounded-xl bg-v-tint p-4"><p className="text-[20px] font-bold text-v-deep">{v}</p><p className="text-[12.5px] text-ink-soft">{k}</p></div>)}</div>
        {creatives.length > 1 && <div className="mt-5 grid grid-cols-3 gap-2">{creatives.slice(1, 7).map((c) => <div key={c} className="aspect-video overflow-hidden rounded-lg bg-v-panel">{/\.(mp4|webm|mov)$/i.test(c) ? <video src={c} className="h-full w-full object-cover" muted /> : <img src={c} alt="" className="h-full w-full object-cover" />}</div>)}</div>}
      </section>
      <footer className="flex items-center justify-between rounded-2xl bg-v-deep px-8 py-4 text-[12px] text-white"><span>Prepared by {p.agency?.legalName} · {formatDate(p.createdAt)}</span><span>Exclusive Loky DOOH Partner</span></footer>
    </div>
  );
}

/** Co-branded commercial quotation (Phase 4). */
export function QuoteDocument({ q }: { q: Quotation }) {
  const agencyLogo = fileUrl(q.agency?.logo);
  const items = q.items ?? [];
  const total = Number(q.total);
  return (
    <div className="mx-auto max-w-[960px] space-y-6 font-inter">
      <section className="rounded-2xl bg-[linear-gradient(135deg,#0b1f3a,#1f6b3a)] p-8 text-white">
        <div className="flex items-center justify-between text-[12px] tracking-wide uppercase opacity-90"><span>{agencyLogo ? <img src={agencyLogo} alt="" className="h-8 object-contain" /> : q.agency?.legalName}</span><span>Client quote · {q.layout === "summary" ? "1-page summary" : "detailed report"}</span></div>
        <h1 className="mt-6 text-[32px] font-bold">{q.title}</h1>
        <p className="opacity-90">Prepared for {q.brand?.name} · {formatDate(q.createdAt)} · valid while the brand lock holds ({q.lockUntil ? formatDate(q.lockUntil) : "—"})</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-[13px]"><div className="rounded-lg bg-white/10 p-3"><p className="opacity-70">Slot</p><p className="text-[18px] font-bold">{q.slotSeconds} seconds</p></div><div className="rounded-lg bg-white/10 p-3"><p className="opacity-70">Package</p><p className="text-[18px] font-bold">{PACKAGE_LABEL[q.package as Package]}</p></div><div className="rounded-lg bg-white/10 p-3"><p className="opacity-70">Screens</p><p className="text-[18px] font-bold">{items.length}</p></div></div>
      </section>
      <section className="rounded-2xl border border-v-line p-8">
        <h2 className="text-[15px] font-bold">Selected locations</h2>
        <table className="mt-3 w-full text-[13.5px]"><thead className="text-[11px] tracking-wide text-v-muted uppercase"><tr><th className="py-1 text-left">Screen</th><th className="py-1 text-left">Location</th>{q.layout === "detailed" && <th className="py-1 text-left">Reach/day</th>}<th className="py-1 text-right">Rate</th></tr></thead>
          <tbody>{items.map((it) => <tr key={it.id} className="border-t border-v-line"><td className="py-2 font-medium">{it.billboard?.name}</td><td className="py-2 text-ink-soft">{it.billboard?.locality}, {it.billboard?.city}</td>{q.layout === "detailed" && <td className="py-2 text-ink-soft">{formatImpressions(it.billboard?.dailyImpressions ?? 0)}</td>}<td className="py-2 text-right"><s className="mr-2 text-v-muted">{formatINR(it.listPrice)}</s>{formatINR(it.offerPrice)}</td></tr>)}</tbody></table>
        {q.layout === "detailed" && <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{items.map((it) => { const img = it.billboard ? mediaUrls(it.billboard)[0] : null; return <div key={it.id} className="aspect-video overflow-hidden rounded-lg bg-v-panel">{img && <img src={img} alt="" className="h-full w-full object-cover" />}</div>; })}</div>}
      </section>
      <section className="rounded-2xl border border-v-line p-8">
        <h2 className="text-[15px] font-bold">Commercials</h2>
        <dl className="mt-3 space-y-2 text-[14px]">
          <div className="flex justify-between"><dt>Base cost ({items.length} screens × {PACKAGE_LABEL[q.package as Package]})</dt><dd>{formatINR(q.baseCost)}</dd></div>
          {Number(q.couponDiscount) > 0 && <div className="flex justify-between text-v-deep"><dt>Promo discount {q.coupon ? `(${q.coupon.code})` : ""}</dt><dd>− {formatINR(q.couponDiscount)}</dd></div>}
          <div className="flex justify-between"><dt>Agency services & planning</dt><dd>+ {formatINR(q.marginAmount)}</dd></div>
          {q.addonCreatives && <div className="flex justify-between"><dt>Production & custom creatives</dt><dd>+ {formatINR(q.addonAmount)}</dd></div>}
          <div className="flex justify-between rounded-lg bg-v-chip px-3 py-2 text-[17px] font-bold text-v-deep"><dt>Net invoice total</dt><dd>{formatINR(total)}</dd></div>
          {q.emiEnabled && <p className="text-[12.5px] text-ink-soft">Easy EMI available: 50 % upfront, balance in 3 monthly instalments of {formatINR(Math.round(total / 2 / 3))}.</p>}
        </dl>
      </section>
      <footer className="flex items-center justify-between rounded-2xl bg-v-deep px-8 py-4 text-[12px] text-white"><span>{q.agency?.legalName}</span><span>Exclusive Loky Partner · co-branded quotation</span></footer>
    </div>
  );
}
