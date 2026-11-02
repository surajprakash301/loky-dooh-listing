"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/types";
import { idle, pick } from "@/actions/types";
import { Field, FormGrid, Notice, SubmitButton, TextInput } from "@/components/portal/form";

export type ContactValues = { name: string; designation: string; phone: string; email: string };

function Block({ prefix, title, values, errors, required, echoed }: { prefix: "primary" | "secondary"; title: string; values: ContactValues; errors: Record<string, string>; required: boolean; echoed?: Record<string, string> }) {
  const k = (f: string) => `${prefix}.${f}`;
  const d = (f: keyof ContactValues) => pick(echoed, k(f), values[f]);
  return (
    <div>
      <h3 className="mb-3 text-[13px] font-semibold tracking-wide text-ink-soft uppercase">{title}</h3>
      <FormGrid>
        <Field label="Name" name={k("name")} error={errors[k("name")]} required={required}><TextInput name={k("name")} defaultValue={d("name")} error={errors[k("name")]} /></Field>
        <Field label="Designation" name={k("designation")} error={errors[k("designation")]}><TextInput name={k("designation")} defaultValue={d("designation")} placeholder="Owner, Manager…" /></Field>
        <Field label="Mobile" name={k("phone")} error={errors[k("phone")]} required={required}><TextInput name={k("phone")} defaultValue={d("phone")} error={errors[k("phone")]} inputMode="numeric" maxLength={10} /></Field>
        <Field label="Email" name={k("email")} error={errors[k("email")]}><TextInput name={k("email")} type="email" defaultValue={d("email")} error={errors[k("email")]} /></Field>
      </FormGrid>
    </div>
  );
}

export function ContactsForm({ action, primary, secondary, locked }: { action: (p: ActionState, fd: FormData) => Promise<ActionState>; primary: ContactValues; secondary: ContactValues; locked: boolean }) {
  const [state, act] = useActionState(action, idle);
  const e = state.errors ?? {};
  return (
    <form action={act} className="flex flex-col gap-6">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <fieldset disabled={locked} className="contents">
        <Block prefix="primary" title="Primary contact (receives the login)" values={primary} errors={e} required echoed={state.values} />
        <Block prefix="secondary" title="Second contact (optional)" values={secondary} errors={e} required={false} echoed={state.values} />
      </fieldset>
      {!locked && <div className="flex justify-end border-t border-v-line pt-4"><SubmitButton pendingText="Saving…">Save & continue</SubmitButton></div>}
    </form>
  );
}
