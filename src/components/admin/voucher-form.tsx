"use client";

import { useActionState } from "react";
import { createVoucherAction } from "@/actions/vouchers";
import { idle, pick } from "@/actions/types";
import { Field, Notice, SubmitButton, TextInput } from "@/components/portal/form";

export function VoucherForm() {
  const [state, act] = useActionState(createVoucherAction, idle);
  const e = state.errors ?? {};
  const d = (k: string) => pick(state.values, k, "");
  return (
    <form action={act} className="flex flex-col gap-4" key={state.ok ? "done" : "edit"} data-testid="voucher-form">
      {state.ok && <Notice tone="success">Voucher created. Advertisers can apply it straight away.</Notice>}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Title" name="title" error={e.title} required>
        <TextInput name="title" defaultValue={d("title")} placeholder="e.g. Launch offer" maxLength={80} error={e.title} />
      </Field>
      <Field label="Small title" name="subtitle" error={e.subtitle}>
        <TextInput name="subtitle" defaultValue={d("subtitle")} placeholder="e.g. For first-time advertisers in Patna" maxLength={160} error={e.subtitle} />
      </Field>
      <Field label="Discount (%)" name="discountPct" error={e.discountPct} required>
        <TextInput name="discountPct" type="number" min={1} max={90} step="0.5" defaultValue={d("discountPct")} placeholder="10" error={e.discountPct} />
      </Field>
      <div className="flex justify-end"><SubmitButton pendingText="Creating…">Create voucher</SubmitButton></div>
    </form>
  );
}
