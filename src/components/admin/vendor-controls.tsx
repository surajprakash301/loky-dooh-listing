"use client";

import { useActionState, useState } from "react";
import { adminLiveStatusAction, rejectVendorAction, resetVendorPasswordAction, setTierAction } from "@/actions/review";
import { idle, type ActionState } from "@/actions/types";
import { CredentialsCard } from "@/components/portal/credentials-card";
import { Notice, Select, SubmitButton, Textarea } from "@/components/portal/form";
import { LIVE_STATUSES, TIERS, TIER_LABEL } from "@/lib/domain";

export function RejectVendor({ vendorId }: { vendorId: number }) {
  const [state, act] = useActionState(rejectVendorAction.bind(null, vendorId), idle);
  const [open, setOpen] = useState(false);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center rounded-lg border border-v-red/40 bg-white px-4 text-[13px] font-semibold text-v-red hover:bg-v-red-tint">Reject vendor</button>;
  return (
    <form action={act} className="w-full rounded-xl border border-v-red/40 bg-v-red-tint p-4">
      <p className="text-[14px] font-semibold text-v-red">Reject this vendor? This is final.</p>
      <p className="mt-1 text-[12.5px] text-ink-soft">All billboards are rejected and the vendor login is disabled. Use &ldquo;Request changes&rdquo; instead if the issue can be fixed.</p>
      {state.error && <Notice tone="error" className="mt-3">{state.error}</Notice>}
      <Textarea name="reason" placeholder="Reason (shown to the representative)" className="mt-3 bg-white" />
      <div className="mt-3 flex gap-3">
        <SubmitButton variant="danger" pendingText="Rejecting…">Confirm rejection</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-lg px-4 text-[14px] text-ink-soft">Cancel</button>
      </div>
    </form>
  );
}

export function ResetVendorPassword({ vendorId }: { vendorId: number }) {
  const [state, act] = useActionState(resetVendorPasswordAction.bind(null, vendorId), idle as ActionState<{ username: string; password: string }>);
  if (state.ok && state.data) return <CredentialsCard username={state.data.username} password={state.data.password} title="New temporary password" />;
  return (
    <form action={act} className="flex items-center gap-3">
      <SubmitButton variant="outline" className="h-10" pendingText="Resetting…">Reset vendor password</SubmitButton>
      {state.error && <span className="text-[13px] text-v-red">{state.error}</span>}
    </form>
  );
}

export function TierSelect({ vendorId, billboardId, tier }: { vendorId: number; billboardId: number; tier: string }) {
  const [state, act] = useActionState(setTierAction.bind(null, vendorId, billboardId), idle);
  return (
    <form action={act} className="flex items-center gap-2">
      <Select name="tier" defaultValue={tier} className="h-9 w-[180px] text-[13px]">
        {TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
      </Select>
      <SubmitButton variant="outline" className="h-9 px-3 text-[13px]">Set tier</SubmitButton>
      {state.ok && <span className="text-[12px] text-v-deep">Saved</span>}
      {state.error && <span className="text-[12px] text-v-red">{state.error}</span>}
    </form>
  );
}

export function LiveStatusSelect({ vendorId, billboardId, value }: { vendorId: number; billboardId: number; value: string | null }) {
  const [state, act] = useActionState(adminLiveStatusAction.bind(null, vendorId, billboardId), idle);
  return (
    <form action={act} className="flex items-center gap-2">
      <Select name="liveStatus" defaultValue={value ?? "live"} className="h-9 w-[150px] text-[13px]">
        {LIVE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <SubmitButton variant="outline" className="h-9 px-3 text-[13px]">Set</SubmitButton>
      {state.ok && <span className="text-[12px] text-v-deep">Saved</span>}
      {state.error && <span className="text-[12px] text-v-red">{state.error}</span>}
    </form>
  );
}
