import { AgencyShell } from "@/components/agency/shell";
import { loadAgencyPage } from "@/services/agency-page";

export const metadata = { title: "Agency console — Loky Media" };

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const { s, a, stats } = await loadAgencyPage();
  return <AgencyShell session={s} agency={a} stats={stats}>{children}</AgencyShell>;
}
