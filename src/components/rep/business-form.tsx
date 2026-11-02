"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/types";
import { idle, pick } from "@/actions/types";
import { Field, FileInput, FormGrid, Notice, Select, SubmitButton, TextInput } from "@/components/portal/form";
import { BUSINESS_TYPES, BUSINESS_TYPE_LABEL as TYPE_LABEL } from "@/lib/domain";

export type BusinessValues = { legalName: string; tradeName: string; businessType: string; gstNumber: string; panNumber: string; addressLine: string; city: string; state: string; pincode: string; logoUrl: string | null };

export function BusinessForm({ action, initial, locked }: { action: (p: ActionState, fd: FormData) => Promise<ActionState>; initial: BusinessValues; locked: boolean }) {
  const [state, act] = useActionState(action, idle);
  const e = state.errors ?? {};
  const d = (k: keyof BusinessValues) => pick(state.values, k, initial[k] as string);
  return (
    <form action={act} className="flex flex-col gap-5">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <fieldset disabled={locked} className="contents">
        <FormGrid>
          <Field label="Legal name" name="legalName" error={e.legalName} required><TextInput name="legalName" defaultValue={d("legalName")} error={e.legalName} placeholder="As on the GST certificate" /></Field>
          <Field label="Trade name" name="tradeName" error={e.tradeName} required hint="Shown on the vendor dashboard and used for the username."><TextInput name="tradeName" defaultValue={d("tradeName")} error={e.tradeName} /></Field>
          <Field label="Business type" name="businessType" error={e.businessType} required>
            <Select name="businessType" defaultValue={d("businessType") || "proprietorship"} error={e.businessType}>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </Select>
          </Field>
          <Field label="GSTIN" name="gstNumber" error={e.gstNumber} required><TextInput name="gstNumber" defaultValue={d("gstNumber")} error={e.gstNumber} placeholder="15 characters" className="font-mono uppercase" maxLength={15} /></Field>
          <Field label="PAN" name="panNumber" error={e.panNumber} required><TextInput name="panNumber" defaultValue={d("panNumber")} error={e.panNumber} placeholder="ABCDE1234F" className="font-mono uppercase" maxLength={10} /></Field>
          <Field label="Logo" name="logo" hint={initial.logoUrl ? "A logo is already uploaded; choose a file to replace it." : "PNG or JPG, optional."}><FileInput name="logo" accept="image/*" /></Field>
          <Field label="Registered address" name="addressLine" error={e.addressLine} required className="md:col-span-2"><TextInput name="addressLine" defaultValue={d("addressLine")} error={e.addressLine} /></Field>
          <Field label="City" name="city" error={e.city} required><TextInput name="city" defaultValue={d("city")} error={e.city} /></Field>
          <Field label="State" name="state" error={e.state} required><TextInput name="state" defaultValue={d("state")} error={e.state} /></Field>
          <Field label="Pincode" name="pincode" error={e.pincode} required><TextInput name="pincode" defaultValue={d("pincode")} error={e.pincode} inputMode="numeric" maxLength={6} /></Field>
        </FormGrid>
      </fieldset>
      {!locked && <div className="flex justify-end border-t border-v-line pt-4"><SubmitButton pendingText="Saving…">Save & continue</SubmitButton></div>}
    </form>
  );
}
