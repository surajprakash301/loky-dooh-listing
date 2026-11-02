"use client";

import { useActionState } from "react";
import { lockCampaignAction, payAction, signWorkOrderAction } from "@/actions/agency";
import { idle } from "@/actions/types";
import { Field, FileInput, Notice, Select, SubmitButton, TextInput } from "@/components/portal/form";
import { EMI_MONTHS, EMI_UPFRONT_PCT, UPFRONT_CASHBACK_PCT } from "@/lib/domain";
import { formatINR } from "@/lib/format";

export function LockCampaignForm({ quotationId, total, defaultStart }: { quotationId: number; total: number; defaultStart: string }) {
  const [state, act] = useActionState(lockCampaignAction.bind(null, quotationId), idle);
  const e = state.errors ?? {};
  const today = defaultStart;
  return (
    <form action={act} className="space-y-4">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <p className="text-[13px] font-semibold">Payment path</p>
      <label className="flex cursor-pointer gap-3 rounded-xl border border-v-line p-3 has-[:checked]:border-v-green has-[:checked]:bg-v-chip"><input type="radio" name="paymentPath" value="upfront" defaultChecked className="mt-1 accent-v-green" /><span><b>Path A · 100 % upfront</b> (maximise ROI)<br /><span className="text-[12.5px] text-ink-soft">Pay {formatINR(total)} now; {UPFRONT_CASHBACK_PCT}% ({formatINR(Math.round((total * UPFRONT_CASHBACK_PCT) / 100))}) cashback credited to your Loky Wallet.</span></span></label>
      <label className="flex cursor-pointer gap-3 rounded-xl border border-v-line p-3 has-[:checked]:border-v-green has-[:checked]:bg-v-chip"><input type="radio" name="paymentPath" value="emi" className="mt-1 accent-v-green" /><span><b>Path B · Easy EMI</b> (flexible split)<br /><span className="text-[12.5px] text-ink-soft">{EMI_UPFRONT_PCT}% upfront ({formatINR(Math.round((total * EMI_UPFRONT_PCT) / 100))}) + {EMI_MONTHS} equal monthly EMIs of {formatINR(Math.round((total * (100 - EMI_UPFRONT_PCT)) / 100 / EMI_MONTHS))}.</span></span></label>
      <Field label="Campaign start date" name="startDate" error={e.startDate} required><TextInput name="startDate" type="date" defaultValue={today} error={e.startDate} /></Field>
      <label className="flex items-start gap-2.5 text-[13px]"><input type="checkbox" name="acceptTerms" className="mt-0.5 size-4 accent-v-green" /> I accept the terms of placement & EMI agreements on behalf of the brand.</label>
      {e.acceptTerms && <p className="text-[12px] text-v-red">{e.acceptTerms}</p>}
      <SubmitButton className="w-full bg-v-orange hover:bg-v-orange/90" pendingText="Locking…">Lock campaign & proceed to payment</SubmitButton>
    </form>
  );
}

export function PayButton({ paymentId, amount }: { paymentId: number; amount: number }) {
  const [state, act] = useActionState(payAction.bind(null, paymentId), idle);
  return (
    <form action={act} className="flex items-center gap-2">
      <Select name="method" defaultValue="upi" className="h-9 w-[120px] text-[12.5px]"><option value="upi">UPI</option><option value="netbanking">Net banking</option><option value="card">Card</option><option value="wallet">Wallet</option></Select>
      <SubmitButton className="h-9 px-3 text-[12.5px]" pendingText="Paying…">Pay {formatINR(amount)}</SubmitButton>
      {state.error && <span className="text-[12px] text-v-red">{state.error}</span>}
    </form>
  );
}

export function SignWorkOrderForm({ campaignId }: { campaignId: number }) {
  const [state, act] = useActionState(signWorkOrderAction.bind(null, campaignId), idle);
  return (
    <form action={act} className="flex flex-wrap items-end gap-3">
      <Field label="Signed campaign agreement (PDF/image)" name="agreement" className="min-w-[260px]"><FileInput name="agreement" accept="application/pdf,image/*" /></Field>
      <SubmitButton pendingText="Activating…">Sign & activate campaign</SubmitButton>
      {state.error && <span className="text-[12.5px] text-v-red">{state.error}</span>}
    </form>
  );
}
