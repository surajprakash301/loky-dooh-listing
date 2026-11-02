"use client";

import { useActionState, useState } from "react";
import { approveSectionAction, requestChangesAction } from "@/actions/review";
import { idle } from "@/actions/types";
import { Notice, SubmitButton, Textarea } from "@/components/portal/form";

/** Approve / request-changes controls for one review section. */
export function SectionActions({ vendorId, reviewSectionId }: { vendorId: number; reviewSectionId: number }) {
  const [approve, approveAct] = useActionState(approveSectionAction.bind(null, vendorId, reviewSectionId), idle);
  const [changes, changesAct] = useActionState(requestChangesAction.bind(null, vendorId, reviewSectionId), idle);
  const [open, setOpen] = useState(false);
  const error = approve.error ?? changes.error;
  return (
    <div className="flex flex-col gap-3 border-t border-v-line pt-4">
      {error && <Notice tone="error">{error}</Notice>}
      {!open ? (
        <div className="flex flex-wrap gap-3">
          <form action={approveAct}><SubmitButton pendingText="Approving…">Approve section</SubmitButton></form>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center rounded-lg border border-v-orange bg-v-orange-tint px-5 text-[14px] font-semibold text-v-rust hover:bg-v-orange/20">Request changes</button>
        </div>
      ) : (
        <form action={changesAct} className="flex flex-col gap-3">
          <label className="text-[13px] font-semibold" htmlFor={`remark-${reviewSectionId}`}>What should the representative change?</label>
          <Textarea id={`remark-${reviewSectionId}`} name="remark" autoFocus placeholder="Be specific: which field, what is wrong, what you need instead." />
          <div className="flex gap-3">
            <SubmitButton variant="danger" pendingText="Sending…">Send back with remark</SubmitButton>
            <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-lg px-4 text-[14px] text-ink-soft hover:bg-v-panel">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
