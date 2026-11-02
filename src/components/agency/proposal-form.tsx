"use client";

import { useActionState } from "react";
import { createProposalAction } from "@/actions/agency";
import { idle, pick } from "@/actions/types";
import { Field, FileInput, FormGrid, Notice, Select, SubmitButton, TextInput, Textarea } from "@/components/portal/form";
import { PROPOSAL_THEMES, PROPOSAL_THEME_LABEL } from "@/lib/domain";
import { ScreenPicker, type PickerScreen } from "./screen-picker";

export function ProposalForm({ brands, screens, brandId }: { brands: { id: number; name: string }[]; screens: PickerScreen[]; brandId?: number }) {
  const [state, act] = useActionState(createProposalAction, idle);
  const e = state.errors ?? {}; const d = (k: string, f = "") => pick(state.values, k, f);
  return (
    <form action={act} className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="space-y-4 rounded-xl border border-v-line p-5">
        <h2 className="text-[15px] font-bold">Step 1 · Campaign & assets</h2>
        {state.error && <Notice tone="error">{state.error}</Notice>}
        <Field label="Select brand" name="brandId" error={e.brandId} required><Select name="brandId" defaultValue={d("brandId", brandId ? String(brandId) : "")} error={e.brandId}><option value="">Pick a brand</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field>
        <Field label="Campaign title" name="title" error={e.title} required><TextInput name="title" defaultValue={d("title")} placeholder="Festive Launch" error={e.title} /></Field>
        <Field label="Theme template" name="theme" required><Select name="theme" defaultValue={d("theme", "aesthetic")}>{PROPOSAL_THEMES.map((t) => <option key={t} value={t}>{PROPOSAL_THEME_LABEL[t]}</option>)}</Select></Field>
        <Field label="Client creatives" name="creatives" hint="MP4 / PNG / JPG. Shown as perspective mockups on the chosen screens."><FileInput name="creatives" accept="image/*,video/*" multiple /></Field>
        <Field label="Objective / target demographics" name="objective"><Textarea name="objective" defaultValue={d("objective")} placeholder="Youth, retail shoppers & commuters on the Boring Road corridor…" /></Field>
        <FormGrid cols={1}><SubmitButton pendingText="Rendering proposal…">Render draft proposal</SubmitButton></FormGrid>
        <p className="text-[12px] text-v-muted">Strictly no pricing in this document: the pitch builds excitement before the commercial discussion.</p>
      </div>
      <div className="rounded-xl border border-v-line p-5"><h2 className="mb-3 text-[15px] font-bold">Step 2 · Choose location combos</h2><ScreenPicker screens={screens} error={e.billboardIds} /></div>
    </form>
  );
}
