"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/types";
import { idle, pick } from "@/actions/types";
import { Field, FormGrid, Notice, SubmitButton, TextInput } from "@/components/portal/form";

export type BankValues = { accountHolder: string; bankName: string; branch: string; accountLast4: string | null; ifsc: string; upiId: string };

export function BankForm({ action, initial, locked }: { action: (p: ActionState, fd: FormData) => Promise<ActionState>; initial: BankValues; locked: boolean }) {
  const [state, act] = useActionState(action, idle);
  const e = state.errors ?? {};
  const d = (k: string) => pick(state.values, k, (initial as unknown as Record<string, string>)[k]);
  return (
    <form action={act} className="flex flex-col gap-5">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {initial.accountLast4 && <Notice tone="info">An account ending in <b>{initial.accountLast4}</b> is on file. Re-enter the full number only to replace it.</Notice>}
      <fieldset disabled={locked} className="contents">
        <FormGrid>
          <Field label="Account holder" name="accountHolder" error={e.accountHolder} required><TextInput name="accountHolder" defaultValue={d("accountHolder")} error={e.accountHolder} /></Field>
          <Field label="Bank" name="bankName" error={e.bankName} required><TextInput name="bankName" defaultValue={d("bankName")} error={e.bankName} /></Field>
          <Field label="Branch" name="branch" error={e.branch}><TextInput name="branch" defaultValue={d("branch")} /></Field>
          <Field label="IFSC" name="ifsc" error={e.ifsc} required><TextInput name="ifsc" defaultValue={d("ifsc")} error={e.ifsc} className="font-mono uppercase" maxLength={11} /></Field>
          <Field label="Account number" name="accountNumber" error={e.accountNumber} required hint="Encrypted at rest; only the last 4 digits are ever shown."><TextInput name="accountNumber" error={e.accountNumber} inputMode="numeric" autoComplete="off" className="font-mono" placeholder={initial.accountLast4 ? `•••• ${initial.accountLast4}` : ""} /></Field>
          <Field label="UPI ID" name="upiId" error={e.upiId}><TextInput name="upiId" defaultValue={d("upiId")} placeholder="optional" /></Field>
        </FormGrid>
      </fieldset>
      {!locked && <div className="flex justify-end border-t border-v-line pt-4"><SubmitButton pendingText="Saving…">Save & continue</SubmitButton></div>}
    </form>
  );
}
