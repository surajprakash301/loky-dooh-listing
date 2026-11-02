"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { idle } from "@/actions/types";
import { Field, Notice, SubmitButton, TextInput } from "@/components/portal/form";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, idle);
  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Username or email" name="username" error={state.errors?.username} required>
        <TextInput name="username" autoComplete="username" autoFocus error={state.errors?.username} placeholder="e.g. bulzads-4821" defaultValue={state.values?.username ?? ""} />
      </Field>
      <Field label="Password" name="password" error={state.errors?.password} required>
        <TextInput name="password" type="password" autoComplete="current-password" error={state.errors?.password} />
      </Field>
      <SubmitButton className="mt-2 w-full" pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
