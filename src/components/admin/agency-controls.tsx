"use client";

import { useActionState } from "react";
import { createCouponAction, setAgencyCommissionAction } from "@/actions/admin-agency";
import { idle, pick } from "@/actions/types";
import { Field, FormGrid, Notice, Select, SubmitButton, TextInput } from "@/components/portal/form";

export function CommissionForm({ agencyId, value }: { agencyId: number; value: number }) {
  const [state, act] = useActionState(setAgencyCommissionAction.bind(null, agencyId), idle);
  return (
    <form action={act} className="flex items-end gap-3">
      <Field label="Base commission %" name="commissionPct" className="w-[160px]"><TextInput name="commissionPct" type="number" step="0.1" min={5} max={15} defaultValue={value} /></Field>
      <SubmitButton variant="outline" pendingText="Saving…">Set commission</SubmitButton>
      {state.ok && <span className="text-[12.5px] text-v-deep">Saved</span>}{state.error && <span className="text-[12.5px] text-v-red">{state.error}</span>}
    </form>
  );
}

export function CouponForm() {
  const [state, act] = useActionState(createCouponAction, idle);
  const e = state.errors ?? {}; const d = (k: string) => pick(state.values, k, "");
  return (
    <form action={act} className="flex flex-col gap-4" key={state.ok ? "done" : "edit"}>
      {state.ok && <Notice tone="success">Coupon created.</Notice>}{state.error && <Notice tone="error">{state.error}</Notice>}
      <FormGrid>
        <Field label="Code" name="code" error={e.code} required><TextInput name="code" defaultValue={d("code")} className="font-mono uppercase" error={e.code} /></Field>
        <Field label="Type" name="type" required><Select name="type" defaultValue={d("type") || "flat"}><option value="flat">Flat ₹ off</option><option value="percent">Percent off</option></Select></Field>
        <Field label="Value" name="value" error={e.value} required><TextInput name="value" type="number" min={1} defaultValue={d("value")} error={e.value} /></Field>
        <Field label="Description" name="description"><TextInput name="description" defaultValue={d("description")} /></Field>
      </FormGrid>
      <div className="flex justify-end"><SubmitButton pendingText="Creating…">Create coupon</SubmitButton></div>
    </form>
  );
}
