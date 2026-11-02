"use client";

import { useActionState } from "react";
import { submitNewBillboardAction } from "@/actions/onboarding";
import { idle } from "@/actions/types";

export function SubmitNewBillboard({ vendorId, billboardId, disabled }: { vendorId: number; billboardId: number; disabled: boolean }) {
  const [state, act] = useActionState(submitNewBillboardAction.bind(null, vendorId, billboardId), idle);
  return (
    <form action={act} className="inline">
      <button type="submit" disabled={disabled} className="font-semibold text-v-deep hover:underline disabled:opacity-50">Submit for review</button>
      {state.error && <span className="ml-2 text-v-red">{state.error}</span>}
    </form>
  );
}
