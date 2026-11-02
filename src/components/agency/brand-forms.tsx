"use client";

import { useActionState } from "react";
import { addMemberAction, assignManagerAction, createBrandAction, uploadAssetAction } from "@/actions/agency";
import { idle, pick } from "@/actions/types";
import { Field, FileInput, FormGrid, Notice, Select, SubmitButton, TextInput } from "@/components/portal/form";

export function BrandForm() {
  const [state, act] = useActionState(createBrandAction, idle);
  const e = state.errors ?? {}; const d = (k: string) => pick(state.values, k, "");
  return (
    <form action={act} className="flex flex-col gap-4">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <FormGrid>
        <Field label="Brand / client name" name="name" error={e.name} required className="md:col-span-2"><TextInput name="name" defaultValue={d("name")} error={e.name} autoFocus /></Field>
        <Field label="Global HQ" name="hq" error={e.hq}><TextInput name="hq" defaultValue={d("hq")} placeholder="City, Country" /></Field>
        <Field label="Category" name="category" error={e.category}><TextInput name="category" defaultValue={d("category")} placeholder="FMCG, Luxury Goods, Real estate…" /></Field>
        <Field label="Website" name="website" error={e.website}><TextInput name="website" defaultValue={d("website")} placeholder="https://" /></Field>
        <Field label="Logo" name="logo"><FileInput name="logo" accept="image/*" /></Field>
      </FormGrid>
      <div className="flex justify-end border-t border-v-line pt-4"><SubmitButton pendingText="Saving…">Add brand</SubmitButton></div>
    </form>
  );
}

export function AssignManagerForm({ brandId, members, current }: { brandId: number; members: { id: number; name: string; title: string; load: number }[]; current: number | null }) {
  const [state, act] = useActionState(assignManagerAction.bind(null, brandId), idle);
  return (
    <form action={act} className="flex flex-wrap items-end gap-3">
      <Field label="Account manager" name="memberId" className="min-w-[260px]">
        <Select name="memberId" defaultValue={current ?? ""}><option value="">Unassigned</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.title} ({m.load} brands)</option>)}</Select>
      </Field>
      <SubmitButton variant="outline" pendingText="Assigning…">Assign</SubmitButton>
      {state.ok && <span className="text-[12.5px] text-v-deep">Assigned</span>}{state.error && <span className="text-[12.5px] text-v-red">{state.error}</span>}
    </form>
  );
}

export function AssetUploadForm({ brandId }: { brandId: number }) {
  const [state, act] = useActionState(uploadAssetAction.bind(null, brandId), idle);
  return (
    <form action={act} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end" key={state.ok ? "done" : "edit"}>
      <Field label="Creative file" name="file" error={state.errors?.file} required><FileInput name="file" accept="image/*,video/*" /></Field>
      <Field label="Asset name" name="name"><TextInput name="name" placeholder="Holiday_Promo_Main" /></Field>
      <Field label="Specs" name="specs"><TextInput name="specs" placeholder="1920×1080, 15s" /></Field>
      <SubmitButton pendingText="Uploading…">Upload</SubmitButton>
      {state.error && <p className="text-[12.5px] text-v-red md:col-span-4">{state.error}</p>}
    </form>
  );
}

export function MemberForm() {
  const [state, act] = useActionState(addMemberAction, idle);
  const e = state.errors ?? {}; const d = (k: string) => pick(state.values, k, "");
  return (
    <form action={act} className="flex flex-col gap-4" key={state.ok ? "done" : "edit"}>
      {state.ok && <Notice tone="success">Team member added. Share their email and password so they can sign in.</Notice>}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <FormGrid>
        <Field label="Full name" name="name" error={e.name} required><TextInput name="name" defaultValue={d("name")} error={e.name} /></Field>
        <Field label="Role title" name="title" error={e.title} required><TextInput name="title" defaultValue={d("title")} placeholder="Campaign Manager" error={e.title} /></Field>
        <Field label="Email (login)" name="email" error={e.email} required><TextInput name="email" type="email" defaultValue={d("email")} error={e.email} /></Field>
        <Field label="Mobile" name="phone" error={e.phone}><TextInput name="phone" defaultValue={d("phone")} maxLength={10} error={e.phone} /></Field>
        <Field label="Temporary password" name="password" error={e.password} required className="md:col-span-2"><TextInput name="password" type="text" autoComplete="off" error={e.password} className="font-mono" /></Field>
      </FormGrid>
      <div className="flex justify-end"><SubmitButton pendingText="Adding…">Send invite</SubmitButton></div>
    </form>
  );
}
