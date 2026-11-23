import Image from "next/image";
import type { CustomerQuotation } from "@/db";
import { formatDateLong, formatINR, formatNumber } from "@/lib/format";
import { mediaUrls } from "@/services/catalog";
import { fileUrl } from "@/services/files";
import { cn } from "@/lib/utils";

const CONTACT = { phone: "+91 7091688336", email: "support@lokymedia.com", sales: "surajprakash@lokymedia.com", site: "www.lokymedia.com" };
const inr = (n: number | string) => formatINR(Number(n));

function Page({ dark = true, children, className }: { dark?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("q-page relative aspect-[16/9] w-full overflow-hidden", dark ? "bg-[#0d110e] text-white" : "bg-white text-ink", className)}>
      {children}
    </section>
  );
}

function hoursBetween(a: string, b: string) {
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  const mins = (h2 * 60 + m2 - (h1 * 60 + m1) + 1440) % 1440 || 1440;
  return mins / 60;
}

const siteCode = (city: string, code: string) => `LKY-${city.slice(0, 3).toUpperCase()}-${code.padStart(5, "0")}`;
const date = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, " / ");

/**
 * The quotation as a stack of 16:9 pages in the house style (dark cover, light rate card,
 * one page per location). Prints to a landscape PDF through the browser.
 */
export function QuotationDoc({ q }: { q: CustomerQuotation }) {
  const items = [...(q.items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const who = q.company?.trim() || q.clientName;
  const logo = fileUrl(q.logo);
  const reach = items.reduce((n, i) => n + (i.billboard?.dailyImpressions ?? 0), 0);
  const screens = items.reduce((n, i) => n + (i.billboard?.slotsPerLoop ?? 0), 0);
  const areas = Array.from(new Set(items.map((i) => i.billboard?.locality).filter(Boolean)));

  return (
    <div className="q-doc mx-auto flex w-full max-w-[1200px] flex-col gap-6 print:max-w-none print:gap-0" data-testid="quotation-doc">
      {/* ---------- cover ---------- */}
      <Page>
        <div className="absolute top-[7%] left-[5%] h-[10%] w-[18%]"><Image src="/img/logo-light.png" alt="Loky Media" fill className="object-contain object-left" priority /></div>
        <p className="absolute top-[8%] right-[6%] text-[1.4cqw] text-brand">{date(q.createdAt)}</p>
        <div className="absolute top-[22%] left-[5%] w-[45%] bg-[#2ee59d] py-[0.9%] text-center text-[1.3cqw] font-bold text-ink">CAMPAIGN PROPOSAL &amp; QUOTATION for DOOH.</div>
        <div className="absolute top-[34%] left-[5%] flex max-w-[90%] items-center gap-[2.2cqw]">
          {logo && (
            <div className="grid h-[11cqw] w-[11cqw] shrink-0 place-items-center overflow-hidden rounded-[1cqw] bg-white p-[0.8cqw]" data-testid="quote-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={`${who} logo`} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <h1 className="font-anton min-w-0 text-[6.4cqw] leading-none uppercase">{who}.</h1>
        </div>
        <p className="absolute top-[62%] left-[6%] text-[2cqw] text-white/75">Prepared for {q.clientName}</p>
        <p className="absolute top-[69%] left-[6%] text-[2cqw] text-white/75">{q.clientEmail} · +91 {q.clientPhone}</p>
        <div className="absolute inset-x-[5%] bottom-[5%] flex items-center justify-between border border-[#2a5a40] px-[3%] py-[3%]">
          <p className="text-[1.6cqw] font-bold">LOCATIONS SELECTED: total {items.length}</p>
          <p className="text-right text-[1.4cqw] text-white/70">TOTAL CAMPAIGN DURATION – {q.months} month{q.months > 1 ? "s" : ""}</p>
        </div>
      </Page>

      {/* ---------- rate breakdown ---------- */}
      <Page dark={false} className="p-[4%]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[2.4cqw] font-bold">LOKY MEDIA — Commercial Rate Breakdown</h2>
          <p className="text-[1.15cqw] text-ink-soft">{CONTACT.phone} | {CONTACT.email}</p>
        </div>
        <table className="mt-[2%] w-full border-collapse text-[1.05cqw]">
          <thead>
            <tr className="bg-ink text-left text-white">
              <th className="px-[1%] py-[0.8%]">Sr No</th>
              <th className="px-[1%] py-[0.8%]">Media Details &amp; Address</th>
              <th className="px-[1%] py-[0.8%]">Geography</th>
              <th className="px-[1%] py-[0.8%]">Duration &amp; Slot</th>
              <th className="px-[1%] py-[0.8%] text-right">List Rate (Rs)</th>
              <th className="px-[1%] py-[0.8%] text-right">Final Net (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const b = it.billboard!;
              return (
                <tr key={it.id} className="border-b border-line align-top">
                  <td className="px-[1%] py-[0.7%] text-center">{i + 1}.</td>
                  <td className="px-[1%] py-[0.7%]">
                    <b>{b.name} #{b.code}</b>
                    <br />
                    <span className="text-ink-soft">{[b.addressLine, b.locality, b.city, b.state, b.pincode].filter(Boolean).join(", ")}</span>
                  </td>
                  <td className="px-[1%] py-[0.7%]">{b.locality},<br />{b.city}</td>
                  <td className="px-[1%] py-[0.7%] whitespace-nowrap">{it.months} month{it.months > 1 ? "s" : ""}<br />{q.slotSeconds}s slot</td>
                  <td className="px-[1%] py-[0.7%] text-right whitespace-nowrap text-ink-soft">{inr(it.listPerMonth)}</td>
                  <td className="px-[1%] py-[0.7%] text-right font-bold whitespace-nowrap text-green">{inr(it.netPerMonth)}/m</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-page"><td colSpan={5} className="px-[1%] py-[0.8%] text-right font-bold">Subtotal - Outdoor Campaign Net Total</td><td className="px-[1%] py-[0.8%] text-right text-[1.4cqw] font-bold text-green">{inr(q.subtotal)}</td></tr>
            {Number(q.discountAmount) > 0 && (
              <tr className="bg-[#fff7e6]" data-testid="doc-discount"><td colSpan={5} className="px-[1%] py-[0.8%] text-right font-bold">Voucher Applied - {q.voucherTitle} ({Number(q.discountPct)}% Off)</td><td className="px-[1%] py-[0.8%] text-right text-[1.3cqw] font-bold text-[#b45309]">- {inr(q.discountAmount)}</td></tr>
            )}
            <tr className="bg-[#dff0fb]"><td colSpan={5} className="px-[1%] py-[0.8%] text-right font-bold">Total Gov. Tax (Inc. {Number(q.gstPct)}% GST)</td><td className="px-[1%] py-[0.8%] text-right text-[1.3cqw]">{inr(q.gstAmount)}</td></tr>
            <tr className="bg-[#e9f7ef]"><td colSpan={5} className="px-[1%] py-[1%] text-right font-bold">GRAND TOTAL :</td><td className="px-[1%] py-[1%] text-right text-[1.7cqw] font-bold text-green">{inr(q.total)}/-</td></tr>
          </tfoot>
        </table>
        <p className="mt-[1.5%] text-[1cqw] text-ink-soft italic">* first ads video will be free</p>
      </Page>

      {/* ---------- media plan summary ---------- */}
      <Page dark={false} className="p-[5%]">
        <h2 className="text-[2.8cqw] font-bold">Media Plan Summary —</h2>
        <table className="mt-[3%] w-full border-collapse text-[1.2cqw]">
          <thead><tr className="bg-[#1f3a5f] text-left text-white"><th className="px-[1%] py-[1%]">City</th><th className="px-[1%] py-[1%] text-center">Digital OOH Count</th><th className="px-[1%] py-[1%] text-center">Estimated Impressions</th><th className="px-[1%] py-[1%] text-right">Net Budget (Rs)</th></tr></thead>
          <tbody>
            <tr className="border-b border-line"><td className="px-[1%] py-[1.2%] font-bold">{q.city}</td><td className="px-[1%] py-[1.2%] text-center">Total {screens} slot{screens === 1 ? "" : "s"}<br />{items.length} location{items.length === 1 ? "" : "s"} in {q.city}</td><td className="px-[1%] py-[1.2%] text-center">{formatNumber(reach * 7)}+ reach per week</td><td className="px-[1%] py-[1.2%] text-right font-bold text-green">{inr(Number(q.subtotal) - Number(q.discountAmount))}{Number(q.discountAmount) > 0 && <span className="block text-[0.95cqw] font-normal text-ink-soft">after {Number(q.discountPct)}% voucher “{q.voucherTitle}”</span>}</td></tr>
            <tr className="bg-page"><td colSpan={3} className="px-[1%] py-[1.2%] text-right font-bold">Grand Total (Inc. {Number(q.gstPct)}% GST)</td><td className="px-[1%] py-[1.2%] text-right text-[1.8cqw] font-bold text-green">{inr(q.total)}/-</td></tr>
          </tbody>
        </table>
        <div className="mt-[4%] border border-line bg-[#fafaf7] p-[3%]">
          <h3 className="text-[1.5cqw] font-bold">CAMPAIGN HIGHLIGHTS</h3>
          <ul className="mt-[1.5%] space-y-[0.6%] text-[1.2cqw]">
            <li>• Strategic coverage across prime commercial nodes: {areas.join(", ")}.</li>
            <li>• 100% digital high-definition LED screens with high dwell time, {q.slotSeconds}-second slot in every loop.</li>
            <li>• Total {items.length} prime location{items.length === 1 ? "" : "s"} reaching {formatNumber(reach)}+ commuters every day.</li>
          </ul>
        </div>
      </Page>

      {/* ---------- divider ---------- */}
      <Page>
        <h2 className="font-anton absolute top-[14%] left-[7%] max-w-[80%] text-[7cqw] leading-[0.95] text-brand">Digital OOH Inventory in {q.city}</h2>
        <p className="absolute top-[52%] left-[7.5%] text-[2.6cqw] text-white/85">Media Inventory Breakdown and Details</p>
      </Page>

      {/* ---------- one page per location ---------- */}
      {items.map((it, i) => {
        const b = it.billboard!;
        const imgs = mediaUrls(b);
        const hours = hoursBetween(b.opsStart, b.opsEnd);
        const plays = Math.round((hours * 3600) / b.loopSeconds);
        const off = it.listPerMonth > it.netPerMonth ? Math.round((1 - Number(it.netPerMonth) / Number(it.listPerMonth)) * 100) : 0;
        const address = [b.addressLine, b.locality, b.city, b.state, b.pincode].filter(Boolean).join(", ");
        return (
          <Page key={it.id} className="p-[4%]">
            <div className="flex items-center justify-between">
              <span className="bg-[#14361f] px-[2.5%] py-[0.6%] text-[1.15cqw] font-bold tracking-wide text-brand">LOCATION {String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono text-[1.2cqw] text-white/60">{siteCode(b.city, b.code)}</span>
            </div>
            <h2 className="font-anton mt-[1.5%] text-[3.2cqw] leading-tight">{b.name} #{b.code}</h2>
            <p className="mt-[0.5%] text-[1.35cqw] text-white/70">{address}</p>
            <div className="mt-[2%] grid h-[46%] grid-cols-2 gap-[2%]">
              {[imgs[0], imgs[1] ?? "/img/map-detail.jpg"].map((src, k) => (
                <div key={k} className="relative overflow-hidden rounded-[0.6cqw] bg-[#1a1f1b]">{src && <Image src={src} alt="" fill sizes="50vw" className="object-cover" unoptimized priority />}</div>
              ))}
            </div>
            <div className="mt-[2.5%] grid grid-cols-5 gap-[1.2%]">
              {[
                ["MEDIA & SIZE", `${Number(b.widthFt)}ft x ${Number(b.heightFt)}ft (${Math.round(Number(b.widthFt) * Number(b.heightFt))}sqft)`],
                ["TRAFFIC", `${formatNumber(b.dailyImpressions)}+`],
                ["HOURS & PLAYS", `${Math.round(hours)} h · ${formatNumber(plays)} plays`],
                ["DURATION & SLOT", `${it.months} month${it.months > 1 ? "s" : ""} · ${q.slotSeconds}s`],
              ].map(([k, v]) => (
                <div key={k} className="border border-white/15 bg-[#121714] px-[1.2cqw] py-[1cqw]">
                  <p className="text-[0.95cqw] font-bold tracking-wide text-white/55">{k}</p>
                  <p className="mt-[0.9cqw] text-[1.3cqw] font-bold">{v}</p>
                </div>
              ))}
              <div className="border border-brand bg-[#0f2a1b] px-[1.2cqw] py-[1cqw]">
                <p className="text-[0.95cqw] font-bold tracking-wide text-brand">INVESTMENT{off > 0 ? ` (${off}% OFF)` : ""}</p>
                <p className="mt-[0.9cqw] text-[1.6cqw] font-bold text-brand">{inr(it.netPerMonth)}/ m</p>
              </div>
            </div>
          </Page>
        );
      })}

      {/* ---------- thank you ---------- */}
      <Page>
        <h2 className="font-anton absolute top-[26%] left-[11%] text-[8cqw] leading-none text-brand">THANK YOU</h2>
        <p className="absolute top-[44%] left-[11%] text-[2.3cqw]">Proposal Prepared for {who}.</p>
        <div className="absolute inset-x-[10%] top-[55%] border border-white/20 bg-[#121714] p-[3%] text-[1.5cqw]">
          <p className="text-[1.9cqw] font-bold">LOKY MEDIA — Bihar Outdoor Digital Network</p>
          <p className="mt-[0.6%] text-white/60">Patna | Hajipur | Gurugram</p>
          <p className="mt-[0.6%] text-brand">Contact: {CONTACT.phone} | <u>{CONTACT.sales}</u> / {CONTACT.email}</p>
          <p className="mt-[0.4%] text-white/60">Website: {CONTACT.site}</p>
          <p className="mt-[1.5%] text-[1.1cqw] text-white/45">Quotation {q.number} · valid until {formatDateLong(q.validUntil)}</p>
        </div>
      </Page>
    </div>
  );
}
