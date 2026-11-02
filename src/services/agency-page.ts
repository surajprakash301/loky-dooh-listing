import { redirect } from "next/navigation";
import { requireRole } from "@/lib/server/auth";
import { Campaign } from "@/db";
import { loadAgency } from "./agency";

/** Shared loader for agency pages: session + agency. Unverified owners are sent back to the OTP step. */
export async function loadAgencyPage(opts: { requirePartner?: boolean } = {}) {
  const s = await requireRole("agency", "agency_member");
  const a = s.agencyId ? await loadAgency(s.agencyId) : null;
  if (!a) redirect("/login");
  if (!a.verifiedAt) redirect("/agency/verify");
  if (a.status === "suspended") redirect("/agency/settings?suspended=1");
  if (opts.requirePartner && a.status !== "partner") redirect("/agency/assessment");
  const [orders, activeCampaigns] = await Promise.all([Campaign.count({ where: { agencyId: a.id } }), Campaign.count({ where: { agencyId: a.id, status: ["confirmed", "active"] } })]);
  return { s, a, stats: { orders, activeCampaigns } };
}
