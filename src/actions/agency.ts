"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertRole, setSessionCookie } from "@/lib/server/auth";
import { readSession, signSession } from "@/lib/session";
import {
  agencyProfileSchema, assessmentSchema, brandSchema, fieldErrors, founderSchema, lockCampaignSchema, memberSchema, otpSchema, proposalSchema, quotationSchema,
  type AgencyProfileInput,
} from "@/lib/validation";
import * as agency from "@/services/agency";
import * as deals from "@/services/deals";
import { hasFile, storeUpload } from "@/services/files";
import { type ActionState, failed, messageOf, str, toObject } from "./types";

const PENDING_COOKIE = "loky_agency_signup";

async function agencySession() {
  const s = await assertRole("agency", "agency_member");
  if (!s.agencyId) throw new Error("No agency linked to this login");
  return s;
}
function refresh() {
  revalidatePath("/agency", "layout");
}

/* ---------- Phase 1: registration ---------- */

/** Step 1 keeps the profile in a short-lived signed cookie until the founder step creates the account. */
export async function agencyProfileStepAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = agencyProfileSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  const token = await signSession({ uid: 0, role: "agency", name: "signup", ...({ profile: parsed.data } as object) }, 1);
  (await cookies()).set(PENDING_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 3600 });
  redirect("/agency/register/founder");
}

export async function agencyFounderStepAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = founderSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  const pending = await readSession((await cookies()).get(PENDING_COOKIE)?.value);
  const profile = (pending as unknown as { profile?: AgencyProfileInput } | null)?.profile;
  if (!profile) return failed(fd, undefined, "Your agency details expired. Start again from step 1.");
  let result: agency.RegistrationResult;
  try {
    result = await agency.register(profile, parsed.data);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  // Signed in immediately, but the proxy keeps the workspace closed until the OTP is verified (verifiedAt).
  await setSessionCookie({ uid: result.userId, role: "agency", name: parsed.data.founderName, agencyId: result.agencyId });
  const store = await cookies();
  store.delete(PENDING_COOKIE);
  store.set("loky_dev_otp", result.otp, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 }); // dev only: no SMS/email provider yet
  redirect("/agency/verify");
}

export async function verifyOtpAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  const parsed = otpSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    await agency.verifyOtp(s.uid, parsed.data.code);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  (await cookies()).delete("loky_dev_otp");
  refresh();
  redirect("/agency?welcome=1");
}

export async function resendOtpAction(): Promise<void> {
  const s = await agencySession();
  const a = await agency.loadAgency(s.agencyId!);
  const code = await agency.issueOtp(s.uid, a?.verificationPath === "enterprise" ? "email" : "mobile");
  (await cookies()).set("loky_dev_otp", code, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  redirect("/agency/verify?resent=1");
}

/* ---------- Phase 2: assessment ---------- */

export async function assessmentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  const parsed = assessmentSchema.safeParse({ services: fd.getAll("services"), sectors: fd.getAll("sectors"), portfolioSize: str(fd, "portfolioSize"), doohExperience: str(fd, "doohExperience") });
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    await agency.completeAssessment(s.agencyId!, s.uid, parsed.data);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh();
  redirect("/agency/assessment/success");
}

/* ---------- brands & team ---------- */

export async function createBrandAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  const parsed = brandSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  let id: number;
  try {
    const logo = fd.get("logo");
    const logoId = hasFile(logo) ? (await storeUpload(logo, s.uid, { public: true })).id : undefined;
    id = (await agency.createBrand(s.agencyId!, s.uid, parsed.data, logoId)).id;
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh();
  redirect(`/agency/brands/${id}?created=1`);
}

export async function assignManagerAction(brandId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  try {
    await agency.assignManager(s.agencyId!, s.uid, brandId, Number(str(fd, "memberId")));
    refresh();
    return { ok: true };
  } catch (e) {
    return { error: messageOf(e) };
  }
}

export async function uploadAssetAction(brandId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  try {
    const f = fd.get("file");
    if (!hasFile(f)) return failed(fd, { file: "Choose a file" });
    const stored = await storeUpload(f, s.uid, { public: true });
    await agency.addAsset(s.agencyId!, s.uid, brandId, stored.id, str(fd, "name") || f.name, str(fd, "specs") || null);
    refresh();
    return { ok: true };
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
}

export async function assetStatusAction(assetId: number, status: "approved" | "reviewing" | "rejected"): Promise<void> {
  const s = await agencySession();
  await agency.setAssetStatus(s.agencyId!, assetId, status);
  refresh();
}

export async function addMemberAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("agency");
  const parsed = memberSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    await agency.addMember(s.agencyId!, s.uid, parsed.data);
    refresh();
    return { ok: true };
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
}

/* ---------- Phase 3: proposals ---------- */

export async function createProposalAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  const parsed = proposalSchema.safeParse({ ...toObject(fd), billboardIds: fd.getAll("billboardIds") });
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  let id: number;
  try {
    const fileIds: number[] = [];
    for (const f of fd.getAll("creatives")) if (hasFile(f)) fileIds.push((await storeUpload(f, s.uid, { public: true })).id);
    id = (await deals.createProposal(s.agencyId!, s.uid, parsed.data, fileIds)).id;
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh();
  redirect(`/agency/proposals/${id}`);
}

/* ---------- Phase 4: quotations ---------- */

function parseQuotation(fd: FormData) {
  const o = toObject(fd);
  return quotationSchema.safeParse({ ...o, billboardIds: fd.getAll("billboardIds"), addonCreatives: o.addonCreatives === "on", emiEnabled: o.emiEnabled === "on" });
}

/** Live estimate for the pricing matrix panel; never persists. */
export type QuotePreview = Omit<deals.Totals, "coupon"> & { couponCode: string | null };

export async function quotePreviewAction(_: ActionState, fd: FormData): Promise<ActionState<QuotePreview>> {
  await agencySession();
  const parsed = parseQuotation(fd);
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    const t = await deals.computeTotals(parsed.data);
    const { coupon, ...rest } = t;
    return { ok: true, values: toObject(fd), data: { ...rest, couponCode: coupon?.code ?? null } };
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
}

export async function createQuotationAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  const parsed = parseQuotation(fd);
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  let id: number;
  try {
    id = (await deals.createQuotation(s.agencyId!, s.uid, parsed.data)).id;
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh();
  redirect(`/agency/quotations/${id}`);
}

/* ---------- Phase 5: work order, payments ---------- */

export async function lockCampaignAction(quotationId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  const parsed = lockCampaignSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  let id: number;
  try {
    id = (await deals.lockCampaign(s.agencyId!, s.uid, quotationId, parsed.data)).id;
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh();
  revalidatePath("/vendor", "layout");
  redirect(`/agency/campaigns/${id}?locked=1`);
}

export async function payAction(paymentId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  try {
    await deals.recordPayment(s.agencyId!, s.uid, paymentId, str(fd, "method") || "upi");
    refresh();
    revalidatePath("/vendor", "layout");
    return { ok: true };
  } catch (e) {
    return { error: messageOf(e) };
  }
}

export async function signWorkOrderAction(campaignId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await agencySession();
  try {
    const f = fd.get("agreement");
    const fileId = hasFile(f) ? (await storeUpload(f, s.uid, { public: false })).id : null;
    await deals.signWorkOrder(s.agencyId!, s.uid, campaignId, fileId);
    refresh();
    revalidatePath("/vendor", "layout");
    return { ok: true };
  } catch (e) {
    return { error: messageOf(e) };
  }
}
