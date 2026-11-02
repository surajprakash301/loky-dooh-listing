"use client";

import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import type { ActionState } from "@/actions/types";
import { idle, pick } from "@/actions/types";
import { Checkbox, Field, FileInput, FormGrid, Notice, Select, SubmitButton, TextInput, Textarea } from "@/components/portal/form";
import { PACKAGES, PACKAGE_LABEL, SCREEN_TYPES, SLOT_SECONDS, TIERS, TIER_LABEL, type Package } from "@/lib/domain";
import { cn } from "@/lib/utils";

export type PricingRow = { slotSeconds: number; package: Package; listPrice: number | ""; offerPrice: number | "" };
export type MediaItem = { id: number; url: string; kind: string; isCover: boolean };
export type BillboardValues = Record<string, string | number | boolean | null>;


function PricingEditor({ initial, errors }: { initial: PricingRow[]; errors: Record<string, string> }) {
  const [rows, setRows] = useState<PricingRow[]>(initial.length ? initial : [{ slotSeconds: 20, package: "month", listPrice: "", offerPrice: "" }]);
  const update = (i: number, patch: Partial<PricingRow>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="pricing" value={JSON.stringify(rows)} />
      <div className="grid grid-cols-[90px_1fr_1fr_1fr_36px] gap-2 text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
        <span>Slot</span><span>Package</span><span>List price ₹</span><span>Offer price ₹</span><span />
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[90px_1fr_1fr_1fr_36px] items-start gap-2">
          <Select value={r.slotSeconds} onChange={(e) => update(i, { slotSeconds: Number(e.target.value) })} className="h-10">
            {SLOT_SECONDS.map((s) => <option key={s} value={s}>{s} s</option>)}
          </Select>
          <Select value={r.package} onChange={(e) => update(i, { package: e.target.value as Package })} className="h-10">
            {PACKAGES.map((p) => <option key={p} value={p}>{PACKAGE_LABEL[p]}</option>)}
          </Select>
          <TextInput type="number" min={1} value={r.listPrice} onChange={(e) => update(i, { listPrice: e.target.value === "" ? "" : Number(e.target.value) })} className={cn("h-10", errors[`pricing.${i}`] && "border-v-red")} />
          <TextInput type="number" min={1} value={r.offerPrice} onChange={(e) => update(i, { offerPrice: e.target.value === "" ? "" : Number(e.target.value) })} className={cn("h-10", errors[`pricing.${i}`] && "border-v-red")} />
          <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="grid h-10 place-items-center rounded-lg text-v-muted hover:bg-v-red-tint hover:text-v-red" aria-label="Remove row" disabled={rows.length === 1}>
            <Trash2 className="size-4" />
          </button>
          {errors[`pricing.${i}`] && <p className="col-span-5 -mt-1 text-[12px] text-v-red">{errors[`pricing.${i}`]}</p>}
        </div>
      ))}
      {errors.pricing && <p className="text-[12px] text-v-red">{errors.pricing}</p>}
      <button type="button" onClick={() => setRows((r) => [...r, { slotSeconds: 20, package: "quarter", listPrice: "", offerPrice: "" }])} className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-v-line bg-white px-3 text-[13px] font-medium hover:bg-v-panel">
        <Plus className="size-4" /> Add pricing row
      </button>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-v-line pt-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-[13px] font-semibold tracking-wide text-ink-soft uppercase">{title}</h3>
      {children}
    </div>
  );
}

export function BillboardForm({
  action,
  initial,
  media,
  pricing,
  categories,
  locked,
  isNew,
}: {
  action: (p: ActionState, fd: FormData) => Promise<ActionState>;
  initial: BillboardValues;
  media: MediaItem[];
  pricing: PricingRow[];
  categories: { id: number; name: string }[];
  locked: boolean;
  isNew: boolean;
}) {
  const [state, act] = useActionState(action, idle);
  const e = state.errors ?? {};
  const v = (k: string) => pick(state.values, k, initial[k] as string | number | null);
  return (
    <form action={act} className="flex flex-col gap-6">
      {state.error && <Notice tone={state.ok ? "warn" : "error"}>{state.error}</Notice>}
      <fieldset disabled={locked} className="contents">
        <Group title="Identity">
          <FormGrid cols={3}>
            <Field label="Billboard name" name="name" error={e.name} required className="md:col-span-3"><TextInput name="name" defaultValue={v("name")} error={e.name} placeholder="e.g. BHIVE LED Digital Billboard – HSR Prime Junction" /></Field>
            <Field label="Category" name="categoryId" error={e.categoryId} required>
              <Select name="categoryId" defaultValue={v("categoryId")} error={e.categoryId}>
                <option value="">Pick a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Tier" name="tier" error={e.tier} required hint="Admin can change this during review.">
              <Select name="tier" defaultValue={v("tier") || "partner"}>{TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}</Select>
            </Field>
            <Field label="Screen type" name="screenType" required>
              <Select name="screenType" defaultValue={v("screenType") || "led"}>{SCREEN_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}</Select>
            </Field>
          </FormGrid>
        </Group>

        <Group title="Location">
          <FormGrid cols={3}>
            <Field label="Address" name="addressLine" error={e.addressLine} required className="md:col-span-2"><TextInput name="addressLine" defaultValue={v("addressLine")} error={e.addressLine} /></Field>
            <Field label="Landmark" name="landmark"><TextInput name="landmark" defaultValue={v("landmark")} /></Field>
            <Field label="Locality" name="locality" error={e.locality} required><TextInput name="locality" defaultValue={v("locality")} error={e.locality} placeholder="HSR Layout" /></Field>
            <Field label="City" name="city" error={e.city} required><TextInput name="city" defaultValue={v("city")} error={e.city} /></Field>
            <Field label="State" name="state" error={e.state} required><TextInput name="state" defaultValue={v("state")} error={e.state} /></Field>
            <Field label="Pincode" name="pincode" error={e.pincode}><TextInput name="pincode" defaultValue={v("pincode")} error={e.pincode} inputMode="numeric" maxLength={6} /></Field>
            <Field label="Latitude" name="lat" error={e.lat} required hint="From Google Maps, e.g. 12.9121"><TextInput name="lat" defaultValue={v("lat")} error={e.lat} inputMode="decimal" /></Field>
            <Field label="Longitude" name="lng" error={e.lng} required hint="e.g. 77.6446"><TextInput name="lng" defaultValue={v("lng")} error={e.lng} inputMode="decimal" /></Field>
          </FormGrid>
        </Group>

        <Group title="Screen specs">
          <FormGrid cols={3}>
            <Field label="Width (ft)" name="widthFt" error={e.widthFt} required><TextInput name="widthFt" type="number" step="0.5" min={1} defaultValue={v("widthFt")} error={e.widthFt} /></Field>
            <Field label="Height (ft)" name="heightFt" error={e.heightFt} required><TextInput name="heightFt" type="number" step="0.5" min={1} defaultValue={v("heightFt")} error={e.heightFt} /></Field>
            <Field label="Pixel pitch" name="pixelPitch" error={e.pixelPitch}><TextInput name="pixelPitch" defaultValue={v("pixelPitch")} placeholder="P4" /></Field>
            <Field label="Refresh rate (Hz)" name="refreshRateHz" error={e.refreshRateHz}><TextInput name="refreshRateHz" type="number" defaultValue={v("refreshRateHz")} placeholder="3840" /></Field>
            <Field label="Brightness (nits)" name="brightnessNits" error={e.brightnessNits}><TextInput name="brightnessNits" type="number" defaultValue={v("brightnessNits")} placeholder="7500" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Angle H (°)" name="viewingAngleH" error={e.viewingAngleH}><TextInput name="viewingAngleH" type="number" defaultValue={v("viewingAngleH")} placeholder="160" /></Field>
              <Field label="Angle V (°)" name="viewingAngleV" error={e.viewingAngleV}><TextInput name="viewingAngleV" type="number" defaultValue={v("viewingAngleV")} placeholder="140" /></Field>
            </div>
          </FormGrid>
        </Group>

        <Group title="Operations & audience">
          <FormGrid cols={3}>
            <Field label="Operational from" name="opsStart" error={e.opsStart} required><TextInput name="opsStart" type="time" defaultValue={v("opsStart") || "09:00"} error={e.opsStart} /></Field>
            <Field label="Operational till" name="opsEnd" error={e.opsEnd} required><TextInput name="opsEnd" type="time" defaultValue={v("opsEnd") || "23:00"} error={e.opsEnd} /></Field>
            <Field label="Daily impressions" name="dailyImpressions" error={e.dailyImpressions} required><TextInput name="dailyImpressions" type="number" min={0} defaultValue={v("dailyImpressions")} error={e.dailyImpressions} placeholder="103000" /></Field>
            <Field label="Loop length (seconds)" name="loopSeconds" error={e.loopSeconds} required hint="Total loop all ads cycle through."><TextInput name="loopSeconds" type="number" min={10} defaultValue={v("loopSeconds")} error={e.loopSeconds} placeholder="225" /></Field>
            <Field label="Ad slots per loop" name="slotsPerLoop" error={e.slotsPerLoop} required><TextInput name="slotsPerLoop" type="number" min={1} defaultValue={v("slotsPerLoop")} error={e.slotsPerLoop} placeholder="8" /></Field>
            <div className="flex items-end pb-2"><Checkbox name="lokySense" label="LokySense AI device installed" defaultChecked={state.values ? state.values.lokySense === "on" : initial.lokySense === true} /></div>
          </FormGrid>
          <Field label="Description" name="description" error={e.description} className="mt-4"><Textarea name="description" defaultValue={v("description")} placeholder="Anything an advertiser should know about this location." /></Field>
        </Group>

        <Group title="Media">
          {media.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {media.map((m) => (
                <label key={m.id} className="group relative block overflow-hidden rounded-lg border border-v-line bg-v-panel">
                  {m.kind === "traffic_video" ? (
                    <video src={m.url} className="aspect-square w-full object-cover" muted />
                  ) : (
                    <Image src={m.url} alt="" width={160} height={160} className="aspect-square w-full object-cover" unoptimized />
                  )}
                  <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">{m.kind.replace("_", " ")}{m.isCover ? " · cover" : ""}</span>
                  {!locked && (
                    <span className="absolute right-1 bottom-1 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[10.5px]">
                      <input type="checkbox" name="remove_media" value={m.id} className="size-3 accent-v-red" /> remove
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
          <FormGrid cols={3}>
            <Field label="Day photos" name="day_photos" required={isNew || !media.some((m) => m.kind === "day_photo")} hint="At least one. JPG/PNG up to 10 MB."><FileInput name="day_photos" accept="image/*" multiple /></Field>
            <Field label="Night photos" name="night_photos"><FileInput name="night_photos" accept="image/*" multiple /></Field>
            <Field label="Traffic video" name="traffic_video" hint="MP4 up to 100 MB."><FileInput name="traffic_video" accept="video/*" /></Field>
          </FormGrid>
        </Group>

        <Group title="Slot pricing">
          <PricingEditor initial={pricing} errors={e} />
        </Group>
      </fieldset>
      {!locked && (
        <div className="flex justify-end gap-3 border-t border-v-line pt-4">
          <SubmitButton pendingText="Saving…">{isNew ? "Add billboard" : "Save billboard"}</SubmitButton>
        </div>
      )}
    </form>
  );
}
