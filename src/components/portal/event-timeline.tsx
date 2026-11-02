import { EVENT_LABEL, SECTION_LABEL, type EventAction, type Section } from "@/lib/domain";
import { formatDateTime } from "@/lib/format";

export type TimelineEvent = {
  id: number;
  createdAt: Date;
  action: EventAction;
  section: Section | null;
  billboardId: number | null;
  remark: string | null;
  actor?: { name: string } | null;
};

/** Audit trail of an onboarding, shared by the representative's review page and the admin review screen. */
export function EventTimeline({ events, billboardCode, hideRemarkFor = [] }: { events: TimelineEvent[]; billboardCode?: (id: number) => string | undefined; hideRemarkFor?: EventAction[] }) {
  if (!events.length) return <p className="text-[13.5px] text-v-muted">No activity yet.</p>;
  return (
    <ol className="divide-y divide-v-line text-[13.5px]">
      {events.map((e) => (
        <li key={e.id} className="flex flex-wrap gap-x-3 py-2">
          <span className="w-[130px] shrink-0 text-v-muted">{formatDateTime(e.createdAt)}</span>
          <span className="font-medium">
            {EVENT_LABEL[e.action] ?? e.action}
            {e.section && e.section !== "billboard" ? ` · ${SECTION_LABEL[e.section]}` : ""}
            {e.billboardId ? ` · billboard #${billboardCode?.(e.billboardId) ?? e.billboardId}` : ""}
          </span>
          <span className="text-ink-soft">by {e.actor?.name}</span>
          {e.remark && !hideRemarkFor.includes(e.action) && <span className="basis-full pl-[142px] text-ink-soft">{e.remark}</span>}
        </li>
      ))}
    </ol>
  );
}
