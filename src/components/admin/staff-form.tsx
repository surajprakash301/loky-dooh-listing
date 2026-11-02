"use client";

import { useActionState } from "react";
import { createStaffAction } from "@/actions/auth";
import { idle } from "@/actions/types";
import { Field, FormGrid, Notice, Select, SubmitButton, TextInput } from "@/components/portal/form";

export function StaffForm() {
  const [state, act] = useActionState(createStaffAction, idle);
  const e = state.errors ?? {};
  const d = (k: string) => state.values?.[k] ?? "";
  return (
    <form action={act} className="flex flex-col gap-4" key={state.ok ? "done" : "edit"}>
      {state.ok && <Notice tone="success">Account created. Share the username and password with them directly.</Notice>}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <FormGrid>
        <Field label="Role" name="role" required>
          <Select name="role" defaultValue="representative"><option value="representative">Representative</option><option value="admin">Admin</option></Select>
        </Field>
        <Field label="Full name" name="name" error={e.name} required><TextInput name="name" error={e.name} defaultValue={d("name")} /></Field>
        <Field label="Username" name="username" error={e.username} required hint="Lowercase letters, digits, dots."><TextInput name="username" error={e.username} className="font-mono" defaultValue={d("username")} /></Field>
        <Field label="Password" name="password" error={e.password} required><TextInput name="password" type="text" autoComplete="off" error={e.password} className="font-mono" /></Field>
        <Field label="Email" name="email" error={e.email}><TextInput name="email" type="email" error={e.email} defaultValue={d("email")} /></Field>
        <Field label="Mobile" name="phone" error={e.phone}><TextInput name="phone" inputMode="numeric" maxLength={10} error={e.phone} defaultValue={d("phone")} /></Field>
      </FormGrid>
      <div className="flex justify-end"><SubmitButton pendingText="Creating…">Create account</SubmitButton></div>
    </form>
  );
}
