"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { quoteLinesAction } from "@/actions/quote";
import { campaign, useCampaign } from "@/lib/campaign-store";
import { formatImpressions } from "@/lib/format";
import type { QuoteLine } from "@/services/quotes";

/**
 * Campaign draft bar in the reference platform's layout: selected screens as removable chips,
 * totals on the right, and the way into the quotation builder. Hidden while nothing is selected.
 */
export function CampaignBar() {
  const codes = useCampaign();
  const visible = codes.length > 0;
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const key = codes.join(",");

  useEffect(() => {
    document.body.classList.toggle("has-campaign-bar", visible);
    return () => document.body.classList.remove("has-campaign-bar");
  }, [visible]);
  useEffect(() => {
    if (!key) return;
    let live = true;
    quoteLinesAction(key.split(","), 1, 20).then((l) => live && setLines(l)).catch(() => {});
    return () => {
      live = false;
    };
  }, [key]);

  if (!visible) return null;
  const byCode = new Map(lines.map((l) => [l.code, l]));
  const shown = codes.map((c) => byCode.get(c));
  const perMonth = shown.reduce((n, l) => n + (l?.netPerMonth ?? 0), 0);
  const reach = shown.reduce((n, l) => n + (l?.reach ?? 0), 0);

  return (
    // above Leaflet's panes (400–700), below the sign-in popup (1000)
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[950] px-3 pb-3 md:px-6 md:pb-5 print:hidden">
      <div className="anim-rise pointer-events-auto mx-auto flex max-w-[1100px] flex-col gap-3 rounded-2xl border border-[#e0e0e0] bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur md:flex-row md:items-center md:gap-4 md:p-4" data-testid="campaign-bar">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.04em] text-lk uppercase">Campaign draft</p>
              <p className="truncate font-[family-name:var(--font-montserrat)] text-[14px] font-semibold text-[#212121]">{codes.length} billboard{codes.length === 1 ? "" : "s"} in your campaign</p>
            </div>
            <button type="button" onClick={() => campaign.clear()} className="text-[12px] font-semibold whitespace-nowrap text-lk hover:text-lk-hover">Clear all</button>
          </div>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {codes.map((code) => {
              const l = byCode.get(code);
              return (
                <div key={code} className="flex h-14 shrink-0 items-center gap-2 rounded-xl border border-[#e0e0e0] bg-[#f8f8f8] pr-2">
                  {l?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image} alt="" width={56} height={56} className="h-14 w-14 rounded-l-xl object-cover" />
                  ) : (
                    <span className="h-14 w-14 rounded-l-xl bg-[#eceff2]" />
                  )}
                  <div className="max-w-[140px] min-w-0">
                    <p className="truncate text-[11px] font-semibold text-[#212121]">{l?.name ?? `Screen #${code}`}</p>
                    <p className="text-[10px] whitespace-nowrap text-[#64748b]">{l ? `₹${l.netPerMonth.toLocaleString("en-IN")}/month · 20s` : `#${code}`}</p>
                  </div>
                  <button type="button" onClick={() => campaign.remove(code)} aria-label={`Remove ${l?.name ?? code}`} className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#dbdbdb] bg-white text-[12px] text-[#64748b] hover:border-[#212121] hover:text-[#212121]">×</button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-[#eee] pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-4">
          <div className="flex items-center justify-between gap-6 text-[12px] whitespace-nowrap md:flex-col md:items-start md:gap-1">
            <p className="text-[#64748b]"><span className="font-semibold text-[#212121]">{codes.length}</span> screen{codes.length === 1 ? "" : "s"}</p>
            <p className="text-[#64748b]"><span className="font-semibold text-[#212121]">₹{perMonth.toLocaleString("en-IN")}</span>/month</p>
            <p className="text-[#64748b]"><span className="font-semibold text-[#212121]">{formatImpressions(reach)}</span> footfall/day</p>
          </div>
          <Link href="/quote/new" className="btn-loky-cta inline-flex h-10 items-center justify-center rounded-lg border border-b-[3px] border-black/80 px-4 text-[13px] font-semibold whitespace-nowrap text-white" data-testid="create-quotation">
            Create quotation
          </Link>
        </div>
      </div>
    </div>
  );
}
