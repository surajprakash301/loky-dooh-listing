"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/actions/auth";
import { idle } from "@/actions/types";
import { Field, Notice, SubmitButton, TextInput } from "@/components/portal/form";

export function PasswordForm({ forced }: { forced?: boolean }) {
  const [state, action] = useActionState(changePasswordAction, idle);
  const e = state.errors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      {forced && <Notice tone="warn">You signed in with a temporary password. Set your own password to continue.</Notice>}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label={forced ? "Temporary password" : "Current password"} name="current" error={e.current} required>
        <TextInput name="current" type="password" autoComplete="current-password" error={e.current} autoFocus />
      </Field>
      <Field label="New password" name="next" error={e.next} required hint="At least 8 characters.">
        <TextInput name="next" type="password" autoComplete="new-password" error={e.next} />
      </Field>
      <Field label="Confirm new password" name="confirm" error={e.confirm} required>
        <TextInput name="confirm" type="password" autoComplete="new-password" error={e.confirm} />
      </Field>
      <SubmitButton className="mt-2 w-full" pendingText="Saving…">Save password</SubmitButton>
    </form>
  );
}
