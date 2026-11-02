"use client";

import { useActionState } from "react";
import { signupAction } from "@/actions/auth";
import { idle } from "@/actions/types";
import { Field, Notice, SubmitButton, TextInput } from "@/components/portal/form";

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signupAction, idle);
  const e = state.errors ?? {};
  const d = (k: string) => state.values?.[k] ?? "";
  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Your name" name="name" error={e.name} required>
        <TextInput name="name" autoComplete="name" error={e.name} defaultValue={d("name")} />
      </Field>
      <Field label="Email" name="email" error={e.email} required hint="This becomes your username.">
        <TextInput name="email" type="email" autoComplete="email" error={e.email} defaultValue={d("email")} />
      </Field>
      <Field label="Mobile number" name="phone" error={e.phone} required>
        <TextInput name="phone" inputMode="numeric" autoComplete="tel" error={e.phone} placeholder="10 digits" defaultValue={d("phone")} />
      </Field>
      <Field label="Password" name="password" error={e.password} required hint="At least 8 characters.">
        <TextInput name="password" type="password" autoComplete="new-password" error={e.password} />
      </Field>
      <SubmitButton className="mt-2 w-full" pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}
