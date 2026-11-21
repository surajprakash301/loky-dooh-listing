"use client";

import Image from "next/image";
import Link from "next/link";
import { Map as MapIcon, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { createQuotationAction, quoteLinesAction } from "@/actions/quote";
import { idle } from "@/actions/types";
import { Field, Notice, SubmitButton, TextInput } from "@/components/portal/form";
import { campaign, useCampaign } from "@/lib/campaign-store";
import { GST_PCT, QUOTE_MONTHS, SLOT_SECONDS } from "@/lib/domain";
import { formatINR, formatImpressions } from "@/lib/format";
import type { QuoteLine } from "@/services/quotes";
import { cn } from "@/lib/utils";

type Prefill = { name?: string; email?: string; phone?: string };

const inr = (n: number) => formatINR(n, { space: true });

export function QuoteBuilder({ prefill, signedIn }: { prefill: Prefill; signedIn: boolean }) {
  const codes = useCampaign();
  const [months, setMonths] = useState<number>(1);
  const [slot, setSlot] = useState<number>(20);
  const [lines, setLines] = useState<QuoteLine[] | null>(null);
  const [pending, start] = useTransition();
  const [state, action] = useActionState(createQuotationAction, idle);

  useEffect(() => {
    if (codes.length === 0) return;
    start(async () => setLines(await quoteLinesAction([...codes], months, slot)));
  }, [codes, months, slot]);

  const priced = codes.length === 0 ? [] : lines;
  const subtotal = (priced ?? []).reduce((n, l) => n + l.lineTotal, 0);
  const gst = Math.round(subtotal * GST_PCT) / 100;
  const total = Math.round(subtotal + gst);
  const missing = codes.filter((c) => priced && !priced.some((l) => l.code === c));

  if (codes.length === 0) {
    return (
      <div className="mx-auto max-w-[720px] rounded-2xl border border-dashed border-line bg-white p-12 text-center">
        <h2 className="text-[22px] font-bold">Your campaign is empty</h2>
        <p className="mt-2 text-[14px] text-ink-soft">Pick billboards from the listing or straight off the map, then come back here to turn them into a quotation.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/listing?view=map" className="btn-3d inline-flex h-11 items-center gap-2 rounded-lg bg-green px-5 text-[15px] font-semibold text-white"><MapIcon className="size-4" /> Open the map</Link>
          <Link href="/listing" className="inline-flex h-11 items-center rounded-lg border border-ink/25 bg-white px-5 text-[15px] font-semibold">Browse the list</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_380px]" data-testid="quote-builder">
      <input type="hidden" name="codes" value={JSON.stringify(codes)} />
      <input type="hidden" name="months" value={months} />
      <input type="hidden" name="slotSeconds" value={slot} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-end gap-6 rounded-2xl border border-line bg-white p-5">
          <div>
            <p className="text-[12px] font-bold tracking-wide text-ink-soft uppercase">Campaign duration</p>
            <div className="mt-2 flex gap-2">
              {QUOTE_MONTHS.map((m) => (
                <button key={m} type="button" onClick={() => setMonths(m)} className={cn("h-10 rounded-lg border px-4 text-[14px] font-semibold", months === m ? "border-green bg-green text-white" : "border-line bg-white hover:border-ink/40")} data-testid={`months-${m}`}>
                  {m} month{m > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-bold tracking-wide text-ink-soft uppercase">Ad slot</p>
            <div className="mt-2 flex gap-2">
              {SLOT_SECONDS.map((s) => (
                <button key={s} type="button" onClick={() => setSlot(s)} className={cn("h-10 rounded-lg border px-4 text-[14px] font-semibold", slot === s ? "border-green bg-green text-white" : "border-line bg-white hover:border-ink/40")} data-testid={`slot-${s}`}>
                  {s}s
                </button>
              ))}
            </div>
          </div>
          <p className="ml-auto text-[12.5px] text-ink-soft">Rates are per month for one {slot}-second slot in every loop.</p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full text-[13.5px]">
            <thead className="bg-page text-left text-[11px] font-bold tracking-wide text-ink-soft uppercase">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-2 py-3">Media details &amp; address</th>
                <th className="px-2 py-3">Geography</th>
                <th className="px-2 py-3 text-right">List rate</th>
                <th className="px-2 py-3 text-right">Final net</th>
                <th className="px-2 py-3 text-right">{months} mo total</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className={cn(pending && "opacity-60")}>
              {(priced ?? []).map((l, i) => (
                <tr key={l.code} className="border-t border-line align-top" data-testid={`line-${l.code}`}>
                  <td className="px-4 py-3 text-ink-soft">{i + 1}.</td>
                  <td className="px-2 py-3">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-page">{l.image && <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />}</div>
                      <div className="min-w-0">
                        <p className="font-bold leading-tight">{l.name} <span className="font-normal text-ink-soft">#{l.code}</span></p>
                        <p className="mt-0.5 line-clamp-2 text-[12px] text-ink-soft">{l.address}</p>
                        <p className="mt-0.5 text-[11.5px] text-ink-soft">{l.sizeFt} · {l.screenType} · {formatImpressions(l.reach)}+ daily reach{l.estimated && " · estimated rate"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">{l.locality},<br />{l.city}</td>
                  <td className="px-2 py-3 text-right whitespace-nowrap text-ink-soft"><s>{inr(l.listPerMonth)}</s></td>
                  <td className="px-2 py-3 text-right font-bold whitespace-nowrap text-green">{inr(l.netPerMonth)}/m</td>
                  <td className="px-2 py-3 text-right font-bold whitespace-nowrap">{inr(l.lineTotal)}</td>
                  <td className="px-3 py-3 text-right">
                    <button type="button" onClick={() => campaign.remove(l.code)} className="text-ink-soft hover:text-coral" title="Remove"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
              {priced === null && <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-soft">Pricing your selection…</td></tr>}
            </tbody>
            <tfoot className="border-t-2 border-line bg-page text-[14px]">
              <tr><td colSpan={5} className="px-4 py-2 text-right font-semibold">Subtotal · Outdoor campaign net total</td><td className="px-2 py-2 text-right font-bold">{inr(subtotal)}</td><td /></tr>
              <tr><td colSpan={5} className="px-4 py-2 text-right">Total Gov. tax (inc. {GST_PCT}% GST)</td><td className="px-2 py-2 text-right">{inr(gst)}</td><td /></tr>
              <tr className="text-[16px]"><td colSpan={5} className="px-4 py-3 text-right font-bold">Grand total</td><td className="px-2 py-3 text-right font-bold text-green" data-testid="grand-total">{inr(total)}</td><td /></tr>
            </tfoot>
          </table>
          {missing.length > 0 && <p className="border-t border-line px-4 py-2 text-[12px] text-coral">{missing.length} selected billboard{missing.length > 1 ? "s have" : " has"} no rate for a {slot}s slot and {missing.length > 1 ? "are" : "is"} left out: {missing.join(", ")}.</p>}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-6">
        <h2 className="text-[18px] font-bold">Who is this quotation for?</h2>
        <p className="mt-1 text-[13px] text-ink-soft">{signedIn ? "It will be saved to your account." : "We set up your advertiser login with this mobile number so you can come back to it any time."}</p>
        <div className="mt-5 flex flex-col gap-4">
          {state.error && <Notice tone="error">{state.error}</Notice>}
          <Field label="Full name" name="name" error={state.errors?.name} required><TextInput name="name" autoComplete="name" defaultValue={state.values?.name ?? prefill.name ?? ""} error={state.errors?.name} /></Field>
          <Field label="Company / brand" name="company" error={state.errors?.company}><TextInput name="company" autoComplete="organization" defaultValue={state.values?.company ?? ""} placeholder="Optional" /></Field>
          <Field label="Email" name="email" error={state.errors?.email} required><TextInput name="email" type="email" autoComplete="email" defaultValue={state.values?.email ?? prefill.email ?? ""} error={state.errors?.email} /></Field>
          <Field label="Mobile number" name="phone" error={state.errors?.phone} required><TextInput name="phone" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="10-digit mobile" defaultValue={state.values?.phone ?? prefill.phone ?? ""} error={state.errors?.phone} /></Field>
          <SubmitButton className="mt-1 w-full" pendingText="Preparing your quotation…">Generate quotation</SubmitButton>
          <p className="text-center text-[12px] text-ink-soft">{signedIn ? "Opens the finished quotation." : "You will confirm the mobile number with a one-time code."}</p>
        </div>
      </aside>
    </form>
  );
}
