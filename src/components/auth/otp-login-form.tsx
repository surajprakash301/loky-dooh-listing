"use client";

import { useActionState } from "react";
import { requestOtpAction, resendCustomerOtpAction, verifyOtpLoginAction } from "@/actions/quote";
import { idle } from "@/actions/types";
import { Field, Notice, SubmitButton, TextInput } from "@/components/portal/form";

export function PhoneForm({ next }: { next?: string }) {
  const [state, action] = useActionState(requestOtpAction, idle);
  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Mobile number" name="phone" error={state.errors?.phone} required>
        <TextInput name="phone" inputMode="numeric" autoComplete="tel" maxLength={10} autoFocus placeholder="10-digit mobile" defaultValue={state.values?.phone ?? ""} error={state.errors?.phone} />
      </Field>
      <SubmitButton className="mt-2 w-full" pendingText="Sending code…">Send one-time code</SubmitButton>
    </form>
  );
}

export function CodeForm({ devCode, resent, fresh }: { devCode: string | null; resent: boolean; fresh: boolean }) {
  const [state, action] = useActionState(verifyOtpLoginAction, idle);
  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        {fresh && <Notice tone="success">Your quotation is ready. Confirm your mobile number to open it; this number is now your Loky Media login.</Notice>}
        {resent && <Notice tone="success">A new code was sent.</Notice>}
        {state.error && <Notice tone="error">{state.error}</Notice>}
        {devCode && <Notice tone="info">Demo build (no SMS provider yet): your code is <b className="font-mono text-[16px]">{devCode}</b>.</Notice>}
        <Field label="6-digit code" name="code" error={state.errors?.code} required>
          <TextInput name="code" inputMode="numeric" maxLength={6} autoFocus className="font-mono text-[20px] tracking-[0.4em]" error={state.errors?.code} />
        </Field>
        <SubmitButton className="w-full" pendingText="Verifying…">Verify and continue</SubmitButton>
      </form>
      <form action={resendCustomerOtpAction} className="text-center text-[13px] text-ink-soft">
        <button type="submit" className="font-semibold text-v-green hover:underline">Resend code</button>
      </form>
    </div>
  );
}
