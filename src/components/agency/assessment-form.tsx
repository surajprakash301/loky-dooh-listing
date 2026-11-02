"use client";

import { useActionState } from "react";
import { assessmentAction } from "@/actions/agency";
import { idle } from "@/actions/types";
import { Notice, Select, SubmitButton, Field } from "@/components/portal/form";
import { AGENCY_SECTORS, AGENCY_SECTOR_LABEL, AGENCY_SERVICES, AGENCY_SERVICE_LABEL, DOOH_EXPERIENCE, DOOH_EXPERIENCE_LABEL, PORTFOLIO_SIZES } from "@/lib/domain";

function Checks({ name, options, labels }: { name: string; options: readonly string[]; labels: Record<string, string> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-v-line px-3 py-2.5 text-[14px] hover:bg-v-tint has-[:checked]:border-v-green has-[:checked]:bg-v-chip">
          <input type="checkbox" name={name} value={o} className="size-4 accent-v-green" /> {labels[o]}
        </label>
      ))}
    </div>
  );
}

export function AssessmentForm() {
  const [state, act] = useActionState(assessmentAction, idle);
  const e = state.errors ?? {};
  return (
    <form action={act} className="flex flex-col gap-6">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <div><h3 className="mb-2 text-[14px] font-semibold">Services your agency offers <span className="text-v-red">*</span></h3><Checks name="services" options={AGENCY_SERVICES} labels={AGENCY_SERVICE_LABEL} />{e.services && <p className="mt-1 text-[12px] text-v-red">{e.services}</p>}</div>
      <div><h3 className="mb-2 text-[14px] font-semibold">Specialised sectors <span className="text-v-red">*</span></h3><Checks name="sectors" options={AGENCY_SECTORS} labels={AGENCY_SECTOR_LABEL} />{e.sectors && <p className="mt-1 text-[12px] text-v-red">{e.sectors}</p>}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Active client portfolio" name="portfolioSize" required><Select name="portfolioSize" defaultValue="6-15">{PORTFOLIO_SIZES.map((p) => <option key={p} value={p}>{p} brands</option>)}</Select></Field>
        <Field label="Prior DOOH experience" name="doohExperience" required><Select name="doohExperience" defaultValue="some">{DOOH_EXPERIENCE.map((d) => <option key={d} value={d}>{DOOH_EXPERIENCE_LABEL[d]}</option>)}</Select></Field>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-v-line pt-4">
        <p className="text-[13px] text-ink-soft">The diagnostic scores your profile and sets your starting commission (7.5–8.4 %, up to 10.9 % with Level 2).</p>
        <SubmitButton pendingText="Running diagnostic…">Run diagnostic scan</SubmitButton>
      </div>
    </form>
  );
}
