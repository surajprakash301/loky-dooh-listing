"use client";

import { useActionState } from "react";
import { agencyFounderStepAction, agencyProfileStepAction, verifyOtpAction } from "@/actions/agency";
import { idle, pick } from "@/actions/types";
import { Field, FileInput, FormGrid, Notice, Select, SubmitButton, TextInput } from "@/components/portal/form";
import { FOUNDER_ROLES, FOUNDER_ROLE_LABEL } from "@/lib/domain";

function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-5 flex gap-2">
      {["Agency profile", "Founder details", "Verification"].map((l, i) => (
        <li key={l} className="flex-1">
          <div className={`h-1.5 rounded-full ${i + 1 <= current ? "bg-v-green" : "bg-v-panel"}`} />
          <p className={`mt-1.5 text-[11px] font-semibold ${i + 1 === current ? "text-v-deep" : "text-v-muted"}`}>Step {i + 1} · {l}</p>
        </li>
      ))}
    </ol>
  );
}

export function AgencyProfileForm() {
  const [state, act] = useActionState(agencyProfileStepAction, idle);
  const e = state.errors ?? {}; const d = (k: string) => pick(state.values, k, "");
  return (
    <form action={act} className="flex flex-col gap-4">
      <Steps current={1} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Agency legal name" name="legalName" error={e.legalName} required><TextInput name="legalName" defaultValue={d("legalName")} error={e.legalName} autoFocus /></Field>
      <Field label="GSTIN" name="gstNumber" error={e.gstNumber} hint="Optional. With a GSTIN we verify your business registration instantly; without it an expert will call you."><TextInput name="gstNumber" defaultValue={d("gstNumber")} error={e.gstNumber} className="font-mono uppercase" maxLength={15} /></Field>
      <Field label="Address" name="addressLine" error={e.addressLine} required><TextInput name="addressLine" defaultValue={d("addressLine")} error={e.addressLine} /></Field>
      <FormGrid cols={3}>
        <Field label="City" name="city" error={e.city} required><TextInput name="city" defaultValue={d("city")} error={e.city} /></Field>
        <Field label="State" name="state" error={e.state} required><TextInput name="state" defaultValue={d("state")} error={e.state} /></Field>
        <Field label="PIN" name="pincode" error={e.pincode}><TextInput name="pincode" defaultValue={d("pincode")} error={e.pincode} maxLength={6} /></Field>
      </FormGrid>
      <Field label="Logo" name="logo" hint="PNG/SVG, optional. You can add it later in Settings."><FileInput name="logo" accept="image/*" /></Field>
      <SubmitButton className="mt-2 w-full" pendingText="Saving…">Continue to founder details</SubmitButton>
    </form>
  );
}

export function FounderForm() {
  const [state, act] = useActionState(agencyFounderStepAction, idle);
  const e = state.errors ?? {}; const d = (k: string) => pick(state.values, k, "");
  return (
    <form action={act} className="flex flex-col gap-4">
      <Steps current={2} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Founder / owner name" name="founderName" error={e.founderName} required><TextInput name="founderName" defaultValue={d("founderName")} error={e.founderName} autoFocus /></Field>
      <Field label="Direct contact number" name="founderPhone" error={e.founderPhone} required><TextInput name="founderPhone" defaultValue={d("founderPhone")} error={e.founderPhone} inputMode="numeric" maxLength={10} /></Field>
      <Field label="Work email" name="founderEmail" error={e.founderEmail} required hint="An agency-domain email verifies instantly by OTP; Gmail/Yahoo needs GST + mobile OTP."><TextInput name="founderEmail" type="email" defaultValue={d("founderEmail")} error={e.founderEmail} /></Field>
      <Field label="Primary role" name="founderRole" required>
        <Select name="founderRole" defaultValue={d("founderRole") || "ceo_founder"}>{FOUNDER_ROLES.map((r) => <option key={r} value={r}>{FOUNDER_ROLE_LABEL[r]}</option>)}</Select>
      </Field>
      <Field label="Set a password" name="password" error={e.password} required hint="This becomes your login."><TextInput name="password" type="password" autoComplete="new-password" error={e.password} /></Field>
      <SubmitButton className="mt-2 w-full" pendingText="Creating workspace…">Verify & create workspace</SubmitButton>
    </form>
  );
}

export function OtpForm({ channel, devCode, resent }: { channel: string; devCode: string | null; resent: boolean }) {
  const [state, act] = useActionState(verifyOtpAction, idle);
  return (
    <form action={act} className="flex flex-col gap-4">
      <Steps current={3} />
      {resent && <Notice tone="success">A new code was sent.</Notice>}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <p className="text-[14px] text-ink-soft">Enter the 6-digit code sent to your {channel}.</p>
      {devCode && <Notice tone="info">Development build (no SMS/email provider yet): your code is <b className="font-mono text-[16px]">{devCode}</b>.</Notice>}
      <Field label="Verification code" name="code" error={state.errors?.code} required><TextInput name="code" inputMode="numeric" maxLength={6} autoFocus className="font-mono text-[20px] tracking-[0.4em]" error={state.errors?.code} /></Field>
      <SubmitButton className="w-full" pendingText="Verifying…">Verify and open workspace</SubmitButton>
    </form>
  );
}
