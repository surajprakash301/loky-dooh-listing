import { Notice } from "@/components/portal/form";
import { Panel } from "@/components/portal/shell";
import { StatusPill } from "@/components/portal/status";
import type { StepState } from "@/lib/domain";

/** Wraps a section form with its review status, the admin's remark, and the lock state. */
export function SectionFrame({ step, saved, children, title, warning }: { step: StepState; saved?: boolean; children: React.ReactNode; title?: string; warning?: string }) {
  return (
    <div className="flex flex-col gap-4">
      {saved && <Notice tone="success">Saved.</Notice>}
      {warning && <Notice tone="warn">{warning}</Notice>}
      {step.status === "changes_requested" && step.remark && (
        <Notice tone="warn">
          <b>Admin asked for changes (round {step.round}):</b> {step.remark}
        </Notice>
      )}
      {!step.editable && step.status === "pending" && <Notice tone="info">This section is with the admin for review and is locked until they respond.</Notice>}
      {!step.editable && step.status === "approved" && <Notice tone="success">Approved by the admin. This section is locked.</Notice>}
      <Panel title={title ?? step.label} aside={step.status !== "draft" ? <StatusPill status={step.status} /> : undefined}>
        {children}
      </Panel>
    </div>
  );
}
