"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { requestOtpAction, resendCustomerOtpAction, verifyOtpLoginAction, type OtpState } from "@/actions/quote";
import { type ActionState, idle } from "@/actions/types";
import { Field, Notice, SubmitButton, TextInput } from "@/components/portal/form";
import { cn } from "@/lib/utils";

type Props = {
  /** a code was already issued (cookie present): open straight on the code step */
  pendingCode: string | null;
  /** header colour scheme */
  light?: boolean;
  /** render only the popup (no trigger), opened by `?login=1` */
  triggerless?: boolean;
  /** react to `?login=1` in the URL (only the header instance should, so one popup opens, not two) */
  autoOpen?: boolean;
  /** trigger look: header text link or a solid button */
  variant?: "link" | "button";
};

/**
 * The advertiser's sign-in: mobile number → one-time code, in a popup over whatever marketplace page
 * they are on. Opens automatically with `?login=1` in the URL (used right after a quotation is created).
 */
export function AdvertiserLogin({ pendingCode, light = false, triggerless = false, autoOpen = true, variant = "link" }: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const wanted = autoOpen && params.get("login") === "1";
  // open = asked for by the URL (until dismissed) or by the header button
  const [manual, setManual] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = manual || (wanted && !dismissed);
  const setOpen = (v: boolean) => {
    setManual(v);
    if (!v) setDismissed(true);
  };
  const [step, setStep] = useState<"phone" | "code">(pendingCode ? "code" : "phone");
  const [devCode, setDevCode] = useState<string | null>(pendingCode);
  const [resent, setResent] = useState(false);

  const next = (() => {
    const qs = new URLSearchParams(params.toString());
    qs.delete("login");
    const s = qs.toString();
    return pathname === "/" ? "/orders" : `${pathname}${s ? `?${s}` : ""}`;
  })();

  const onDone = (target: string | null | undefined) => {
    setOpen(false);
    const to = target ?? next;
    // Cross-page destinations are handled by the action's own redirect; here only a same-page landing is left.
    if (to.split("?")[0] !== pathname) window.location.assign(to);
    else router.refresh();
  };

  return (
    <>
      {!triggerless && (
        <button type="button" onClick={() => setOpen(true)} className={cn(variant === "button" ? "btn-3d inline-flex h-10 items-center rounded-lg bg-green px-5 text-[14px] font-semibold text-white" : cn("text-[17px] font-medium", light && "text-[15px]"))} data-testid={variant === "button" ? "open-login-inline" : "open-login"}>
          {variant === "button" ? "Sign in with mobile" : "login/ signup"}
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4 print:hidden" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Sign in" data-testid="login-dialog">
          <div className="relative w-full max-w-[440px] rounded-2xl bg-white p-7 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.35)]" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-ink-soft hover:bg-page" aria-label="Close">
              <X className="size-4" />
            </button>
            {step === "phone" ? (
              <PhoneStep next={next} onSent={(s) => { setDevCode(s.devCode ?? null); setResent(false); setStep("code"); }} />
            ) : (
              <CodeStep devCode={devCode} resent={resent} next={next} current={pathname} onBack={() => setStep("phone")} onResent={(s) => { setDevCode(s.devCode ?? null); setResent(true); }} onExpired={() => setStep("phone")} onDone={onDone} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PhoneStep({ next, onSent }: { next: string; onSent: (s: OtpState) => void }) {
  const [state, action] = useActionState(requestOtpAction, idle as ActionState<OtpState>);
  useEffect(() => {
    if (state.ok && state.data?.step === "code") onSent(state.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Sign in to Loky Media</h2>
        <p className="mt-1 text-[13.5px] text-ink-soft">Advertisers sign in with the mobile number used on a quotation. No password needed.</p>
      </div>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Mobile number" name="phone" error={state.errors?.phone} required>
        <TextInput name="phone" inputMode="numeric" autoComplete="tel" maxLength={10} autoFocus placeholder="10-digit mobile" defaultValue={state.values?.phone ?? ""} error={state.errors?.phone} />
      </Field>
      <SubmitButton className="w-full" pendingText="Sending code…">Send one-time code</SubmitButton>
      <p className="text-center text-[12.5px] text-ink-soft">
        New here? Pick billboards and <Link href="/quote/new" className="font-semibold text-green hover:underline">create a quotation</Link>; your login is set up with it.
        <br />
        Staff, vendor or agency? <Link href="/login" className="font-semibold text-green hover:underline">Sign in with a password</Link>
      </p>
    </form>
  );
}

function CodeStep({ devCode, resent, next, current, onBack, onResent, onExpired, onDone }: { devCode: string | null; resent: boolean; next: string; current: string; onBack: () => void; onResent: (s: OtpState) => void; onExpired: () => void; onDone: (next?: string | null) => void }) {
  const [state, action] = useActionState(verifyOtpLoginAction, idle as ActionState<OtpState>);
  const [resendState, resend] = useActionState(resendCustomerOtpAction, idle as ActionState<OtpState>);
  useEffect(() => {
    if (state.ok) onDone(state.data?.next);
    else if (state.error && state.data?.step === "phone") onExpired();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  useEffect(() => {
    if (resendState.ok && resendState.data) onResent(resendState.data);
    else if (resendState.error && resendState.data?.step === "phone") onExpired();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resendState]);
  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="current" value={current} />
        <div>
          <h2 className="text-[22px] font-bold tracking-tight">Enter your code</h2>
          <p className="mt-1 text-[13.5px] text-ink-soft">We sent a one-time code to your mobile number. Confirming it signs you in.</p>
        </div>
        {resent && <Notice tone="success">A new code was sent.</Notice>}
        {state.error && <Notice tone="error">{state.error}</Notice>}
        {devCode && <Notice tone="info">Demo build (no SMS provider yet): your code is <b className="font-mono text-[16px]" data-testid="dev-code">{devCode}</b>.</Notice>}
        <Field label="6-digit code" name="code" error={state.errors?.code} required>
          <TextInput name="code" inputMode="numeric" maxLength={6} autoFocus className="font-mono text-[20px] tracking-[0.4em]" error={state.errors?.code} />
        </Field>
        <SubmitButton className="w-full" pendingText="Verifying…">Verify and continue</SubmitButton>
      </form>
      <div className="flex items-center justify-center gap-3 text-[13px] text-ink-soft">
        <form action={resend}><button type="submit" className="font-semibold text-green hover:underline">Resend code</button></form>
        <span className="text-line">|</span>
        <button type="button" onClick={onBack} className="hover:underline">Use a different number</button>
      </div>
    </div>
  );
}
