"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/types";
import { idle } from "@/actions/types";
import { CredentialsCard } from "@/components/portal/credentials-card";
import { Notice, SubmitButton } from "@/components/portal/form";

type Creds = { username: string; password: string };

/**
 * Rendered at a stable position on the review page for every vendor status, so the one-time
 * credentials returned by submit survive the server re-render that flips the status to pending.
 */
export function SubmitPanel({ action, mode, disabled, problems, statusNote }: { action: (p: ActionState<Creds>, fd: FormData) => Promise<ActionState<Creds>>; mode: "submit" | "resubmit" | "none"; disabled: boolean; problems: string[]; statusNote?: string }) {
  const [state, act] = useActionState(action, idle as ActionState<Creds>);
  if (state.ok && !state.data) {
    return <Notice tone="success">Resubmitted. Flagged sections are back with the admin.</Notice>;
  }
  if (mode === "none" && !state.ok) {
    return <p className="text-[13.5px] text-ink-soft">{statusNote}</p>;
  }
  if (state.ok && state.data) {
    return (
      <div className="flex flex-col gap-4">
        <Notice tone="success">Submitted. The admin will review each section; you will see remarks here if anything needs changing.</Notice>
        <CredentialsCard username={state.data.username} password={state.data.password} />
      </div>
    );
  }
  return (
    <form action={act} className="flex flex-col gap-4">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {problems.length > 0 && (
        <Notice tone="warn">
          <p className="font-semibold">Complete these before submitting:</p>
          <ul className="mt-1 list-disc pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </Notice>
      )}
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-ink-soft">
          {mode === "submit" ? "Submitting locks every section for admin review and issues the vendor's login." : "Resubmitting sends only the flagged sections back to the admin."}
        </p>
        <SubmitButton disabled={disabled} pendingText={mode === "submit" ? "Submitting…" : "Resubmitting…"}>
          {mode === "submit" ? "Submit for review" : "Resubmit for review"}
        </SubmitButton>
      </div>
    </form>
  );
}
