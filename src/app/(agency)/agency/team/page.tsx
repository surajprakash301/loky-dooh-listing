import { MemberForm } from "@/components/agency/brand-forms";
import { AgencyPageHeader } from "@/components/agency/shell";
import { TEAM_LIMIT } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { listMembers } from "@/services/agency";
import { loadAgencyPage } from "@/services/agency-page";

export default async function TeamPage() {
  const { s, a } = await loadAgencyPage();
  const members = await listMembers(a.id);
  return (
    <>
      <AgencyPageHeader title="Team Members" subtitle="Manage your agency team and campaign operators." />
      <div className="grid gap-6 px-8 py-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-v-line p-5"><p className="text-[11px] font-bold tracking-wide text-v-muted uppercase">Team limit · Pro plan</p><p className="mt-1 text-[26px] font-bold">{members.length} <span className="text-[14px] font-normal text-ink-soft">/ {TEAM_LIMIT} members used</span></p><div className="mt-2 h-2 rounded-full bg-v-panel"><div className="h-2 rounded-full bg-v-green" style={{ width: `${Math.min(100, (members.length / TEAM_LIMIT) * 100)}%` }} /></div></div>
          <div className="grid gap-4 md:grid-cols-2">
            {members.map((m) => (
              <div key={m.id} className="rounded-xl border border-v-line p-4">
                <div className="flex items-start justify-between"><div><p className="text-[15px] font-semibold">{m.user?.name}</p><p className="text-[12.5px] text-ink-soft">{m.title}{m.isOwner ? " · Owner" : ""}</p></div><span className="rounded-full bg-v-chip px-2 py-0.5 text-[10px] font-semibold text-v-deep uppercase">Active</span></div>
                <p className="mt-3 text-[12.5px] text-ink-soft">{m.user?.email}<br />{m.user?.phone ?? ""}</p>
                <p className="mt-3 text-[11px] font-semibold tracking-wide text-v-muted uppercase">Assigned brands</p>
                <div className="mt-1 flex flex-wrap gap-1.5">{(m.brands ?? []).map((b) => <span key={b.id} className="rounded bg-v-panel px-2 py-0.5 text-[12px]">{b.name}</span>)}{!m.brands?.length && <span className="text-[12px] text-v-muted">None yet</span>}</div>
                <p className="mt-3 text-[11.5px] text-v-muted">Last login {m.user?.lastLoginAt ? formatDate(m.user.lastLoginAt) : "never"}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-v-line p-5"><h2 className="text-[15px] font-bold">Invite new operator</h2><p className="text-[12.5px] text-ink-soft">Expand your agency&apos;s capacity by adding teammates.</p><div className="mt-4">{s.role === "agency" ? <MemberForm /> : <p className="text-[13px] text-v-muted">Only the agency owner can add members.</p>}</div></div>
      </div>
    </>
  );
}
