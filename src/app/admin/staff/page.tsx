import { StaffForm } from "@/components/admin/staff-form";
import { PageHeader, Panel } from "@/components/portal/shell";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/server/auth";
import { listStaff } from "@/services/auth";

export default async function StaffPage() {
  await requireRole("admin");
  const staff = await listStaff();
  return (
    <>
      <PageHeader title="Staff accounts" subtitle="Representatives onboard vendors in the field; admins review them." />
      <div className="grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_520px]">
        <Panel title={`Accounts (${staff.length})`}>
          <table className="w-full text-[13.5px]">
            <thead className="text-[11px] font-semibold tracking-wide text-v-muted uppercase"><tr><th className="py-2 text-left">Name</th><th className="py-2 text-left">Username</th><th className="py-2 text-left">Role</th><th className="py-2 text-left">Last login</th></tr></thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-t border-v-line">
                  <td className="py-2.5 font-medium">{u.name}<p className="text-[12px] font-normal text-v-muted">{u.email ?? u.phone ?? ""}</p></td>
                  <td className="py-2.5 font-mono text-[12.5px]">{u.username}</td>
                  <td className="py-2.5 capitalize">{u.role}</td>
                  <td className="py-2.5 text-ink-soft">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Add an account"><StaffForm /></Panel>
      </div>
    </>
  );
}
