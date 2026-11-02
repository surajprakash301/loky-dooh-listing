import { notFound } from "next/navigation";
import { requireRole } from "@/lib/server/auth";
import { loadVendor, stepStates, type StepState } from "./onboarding";

/** Shared loader for every step page: session, vendor (rep-scoped) and stepper state. */
export async function loadStepPage(vendorIdParam: string) {
  const s = await requireRole("representative");
  const v = await loadVendor(Number(vendorIdParam));
  if (!v || v.onboardedBy !== s.uid) notFound();
  const steps = stepStates(v);
  const step = (key: StepState["key"]) => steps.find((x) => x.key === key)!;
  return { s, v, steps, step };
}
