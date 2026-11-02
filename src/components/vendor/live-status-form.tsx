"use client";

import { useActionState } from "react";
import { vendorLiveStatusAction } from "@/actions/vendor";
import { idle } from "@/actions/types";
import { LIVE_STATUSES } from "@/lib/domain";

export function LiveStatusForm({ billboardId, value }: { billboardId: number; value: string | null }) {
  const [state, act] = useActionState(vendorLiveStatusAction.bind(null, billboardId), idle);
  return (
    <form action={act} className="flex items-center gap-2">
      <select name="liveStatus" defaultValue={value ?? "live"} className="h-9 rounded-lg border border-v-line bg-white px-2.5 text-[13px] capitalize">
        {LIVE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="submit" className="h-9 rounded-lg bg-v-chip px-3 text-[13px] font-semibold text-v-deep hover:bg-v-pale">Update status</button>
      {state.ok && <span className="text-[12px] text-v-deep">Saved</span>}
      {state.error && <span className="text-[12px] text-v-red">{state.error}</span>}
    </form>
  );
}
