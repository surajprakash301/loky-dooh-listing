import Link from "next/link";
import { resubmitAction, submitAction } from "@/actions/onboarding";
import { EventTimeline } from "@/components/portal/event-timeline";
import { Notice } from "@/components/portal/form";
import { Panel } from "@/components/portal/shell";
import { StatusPill } from "@/components/portal/status";
import { SubmitPanel } from "@/components/rep/submit-panel";
import { checkCompleteness, loadEvents } from "@/services/onboarding";
import { loadStepPage } from "@/services/rep-page";


export default async function ReviewPage(props: PageProps<"/rep/onboard/[vendorId]/review">) {
  const { vendorId } = await props.params;
  const sp = await props.searchParams;
  const { v, steps } = await loadStepPage(vendorId);
  const completeness = checkCompleteness(v);
  const events = await loadEvents(v.id);
  const user = v.user;
  const flagged = steps.some((st) => st.status === "changes_requested");
  const mode = v.status === "draft" ? "submit" : flagged && v.status !== "rejected" ? "resubmit" : "none";

  return (
    <div className="flex flex-col gap-4">
      {sp.resubmitted && <Notice tone="success">Resubmitted. Flagged sections are back with the admin.</Notice>}
      {v.status === "approved" && flagged && <Notice tone="warn">The admin asked for changes on a billboard. Fix it and resubmit below.</Notice>}
      {v.status === "approved" && !flagged && <Notice tone="success">This vendor is approved. Their billboards are live on the customer site. You can still add new billboards; each goes through review on its own.</Notice>}
      {v.status === "rejected" && <Notice tone="error"><b>Rejected by admin:</b> {v.rejectionReason}</Notice>}
      {v.status === "pending" && <Notice tone="info">Under admin review. You will see remarks here if any section is sent back.</Notice>}

      <Panel title="Section status">
        <ul className="divide-y divide-v-line">
          {steps.map((s) => (
            <li key={s.key} className="flex flex-wrap items-center gap-3 py-2.5">
              <Link href={s.href} className="min-w-0 flex-1 truncate text-[14px] font-medium hover:underline">{s.label}</Link>
              {s.status === "draft" ? (
                <span className={s.filled ? "text-[12.5px] font-semibold text-v-deep" : "text-[12.5px] text-v-muted"}>{s.filled ? "Complete" : "Incomplete"}</span>
              ) : (
                <StatusPill status={s.status} />
              )}
              {s.remark && <p className="basis-full text-[12.5px] text-v-rust">Admin: {s.remark}</p>}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={mode === "resubmit" ? "Resubmit" : "Submit for review"}>
        <SubmitPanel
          action={(mode === "resubmit" ? resubmitAction : submitAction).bind(null, v.id)}
          mode={mode}
          disabled={v.status === "draft" && !completeness.ok}
          problems={v.status === "draft" ? completeness.problems.map((p) => p.message) : []}
          statusNote={v.status === "pending" ? "Submitted. Waiting for the admin." : v.status === "approved" ? "Approved. Nothing to submit." : "Rejected. This onboarding is closed."}
        />
      </Panel>

      {user && (
        <Panel title="Vendor login">
          <p className="text-[14px]">Username <span className="font-mono font-semibold">{user.username}</span> · {user.mustChangePassword ? "temporary password not yet changed" : "password set by vendor"} · {user.status === "active" ? "active" : "disabled"}</p>
          <p className="mt-1 text-[12.5px] text-v-muted">Lost the temporary password? An admin can reset it from the review screen.</p>
        </Panel>
      )}

      <Panel title="History">
        <EventTimeline events={events} hideRemarkFor={["credentials_issued"]} />
      </Panel>
    </div>
  );
}
