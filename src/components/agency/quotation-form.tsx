"use client";

import { useActionState, useState } from "react";
import { createQuotationAction, quotePreviewAction } from "@/actions/agency";
import { idle, pick, type ActionState } from "@/actions/types";
import { Field, FormGrid, Notice, Select, SubmitButton, TextInput } from "@/components/portal/form";
import { ADDON_CREATIVE_CHARGE, BRAND_LOCK_DAYS, EMI_MONTHS, PACKAGES, PACKAGE_LABEL, QUOTE_LAYOUTS, SLOT_SECONDS } from "@/lib/domain";
import { formatINR } from "@/lib/format";
import { ScreenPicker, type PickerScreen } from "./screen-picker";

type Preview = import("@/actions/agency").QuotePreview;

export function QuotationForm({ brands, screens, brandId, proposalId, initialScreens = [], title }: { brands: { id: number; name: string }[]; screens: PickerScreen[]; brandId?: number; proposalId?: number; initialScreens?: number[]; title?: string }) {
  const [preview, previewAct] = useActionState(quotePreviewAction, idle as ActionState<Preview>);
  const [create, createAct] = useActionState(createQuotationAction, idle);
  const [margin, setMargin] = useState(Number(pick(preview.values, "marginPct", 10)));
  const e = { ...(preview.errors ?? {}), ...(create.errors ?? {}) }; const vals = create.values ?? preview.values; const d = (k: string, f = "") => pick(vals, k, f);
  const p = preview.data;
  return (
    <form className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
      <div className="space-y-4 rounded-xl border border-v-line p-5">
        <h2 className="text-[15px] font-bold">Step 1 · Configuration & package</h2>
        {(create.error || preview.error) && <Notice tone="error">{create.error ?? preview.error}</Notice>}
        {proposalId && <input type="hidden" name="proposalId" value={proposalId} />}
        <Field label="Brand" name="brandId" error={e.brandId} required><Select name="brandId" defaultValue={d("brandId", brandId ? String(brandId) : "")} error={e.brandId}><option value="">Pick a brand</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field>
        <Field label="Quotation title" name="title" error={e.title} required><TextInput name="title" defaultValue={d("title", title ?? "")} error={e.title} /></Field>
        <FormGrid>
          <Field label="Slot length" name="slotSeconds" required><Select name="slotSeconds" defaultValue={d("slotSeconds", "20")}>{SLOT_SECONDS.map((s) => <option key={s} value={s}>{s} seconds</option>)}</Select></Field>
          <Field label="Package" name="package" required><Select name="package" defaultValue={d("package", "month")}>{PACKAGES.map((pk) => <option key={pk} value={pk}>{PACKAGE_LABEL[pk]}</option>)}</Select></Field>
        </FormGrid>
        <Field label="Promo / coupon code" name="couponCode" error={e.couponCode ?? p?.couponError ?? undefined} hint="Loky partner codes or pre-discounted promo codes."><TextInput name="couponCode" defaultValue={d("couponCode")} className="font-mono uppercase" placeholder="LOKYPARTNER10" /></Field>
        <Field label={`Agency margin · ${margin}%`} name="marginPct" hint="Your markup on the wholesale rate."><input type="range" name="marginPct" min={0} max={40} step={1} value={margin} onChange={(ev) => setMargin(Number(ev.target.value))} className="w-full accent-v-green" /></Field>
        <label className="flex items-center gap-2.5 text-[14px]"><input type="checkbox" name="addonCreatives" defaultChecked={d("addonCreatives") === "on"} className="size-4 accent-v-green" /> Add-on: production & custom creatives (+{formatINR(ADDON_CREATIVE_CHARGE)})</label>
        <label className="flex items-center gap-2.5 text-[14px]"><input type="checkbox" name="emiEnabled" defaultChecked={d("emiEnabled") === "on"} className="size-4 accent-v-green" /> Offer Easy EMI (split into {EMI_MONTHS} monthly instalments)</label>
        <Field label="Export layout" name="layout"><Select name="layout" defaultValue={d("layout", "detailed")}>{QUOTE_LAYOUTS.map((l) => <option key={l} value={l}>{l === "summary" ? "1-page summary" : "5–10 page detailed report"}</option>)}</Select></Field>
      </div>
      <div className="rounded-xl border border-v-line p-5"><h2 className="mb-3 text-[15px] font-bold">Step 2 · Locations</h2><ScreenPicker screens={screens} initial={initialScreens} error={e.billboardIds} /></div>
      <div className="space-y-4">
        <div className="rounded-xl border border-v-line p-5">
          <h2 className="text-[15px] font-bold">Dynamic pricing matrix</h2>
          <SubmitButton formAction={previewAct} variant="outline" className="mt-3 w-full" pendingText="Calculating…">Calculate live estimate</SubmitButton>
          {p && (
            <dl className="mt-4 space-y-2 text-[13.5px]">
              {p.lines.map((l) => <div key={l.code} className="flex justify-between text-ink-soft"><dt className="truncate pr-2">#{l.code} {l.name}</dt><dd className="shrink-0">{formatINR(l.offerPrice)}</dd></div>)}
              <div className="flex justify-between border-t border-v-line pt-2"><dt>Fixed base cost</dt><dd>{formatINR(p.baseCost)}</dd></div>
              <div className="flex justify-between text-v-deep"><dt>Coupon {p.couponCode ? `(${p.couponCode})` : ""}</dt><dd>− {formatINR(p.couponDiscount)}</dd></div>
              <div className="flex justify-between"><dt>Agency margin</dt><dd>+ {formatINR(p.marginAmount)}</dd></div>
              <div className="flex justify-between"><dt>Add-ons</dt><dd>+ {formatINR(p.addonAmount)}</dd></div>
              <div className="flex justify-between rounded-lg bg-v-chip px-3 py-2 text-[15px] font-bold text-v-deep"><dt>Net invoice total</dt><dd>{formatINR(p.total)}</dd></div>
              {p.emi.length > 0 && <div className="rounded-lg bg-v-panel px-3 py-2 text-[12.5px]">Easy EMI: {p.emi.map((m, i) => `Month ${i + 1}: ${formatINR(m)}`).join(" · ")}</div>}
              <p className="text-[11.5px] text-v-muted">Data check: passed · Inventory sync: verified</p>
            </dl>
          )}
        </div>
        <div className="rounded-xl border border-v-line p-5">
          <p className="text-[12.5px] text-ink-soft">Generating the quotation locks <b>this brand to your agency for {BRAND_LOCK_DAYS} days</b> and produces a co-branded, shareable quote.</p>
          <SubmitButton formAction={createAct} className="mt-3 w-full" pendingText="Generating…">Generate co-branded quotation</SubmitButton>
        </div>
      </div>
    </form>
  );
}
