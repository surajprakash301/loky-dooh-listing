"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, setSessionCookie } from "@/lib/server/auth";
import { fieldErrors, otpSchema, phoneLoginSchema, quoteSchema } from "@/lib/validation";
import * as quotes from "@/services/quotes";
import { type ActionState, failed, messageOf, str, toObject } from "./types";

const OTP_UID = "loky_otp_uid";
const OTP_DEV = "loky_dev_otp";
const OTP_NEXT = "loky_otp_next";
const TEN_MIN = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 600 };

/** What the header's sign-in popup needs to know: step (phone or code) and the demo code. */
export type OtpState = { step: "phone" | "code"; devCode?: string | null; next?: string | null };

function safeNext(next: string): string | null {
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}

async function startOtp(userId: number, next: string | null): Promise<string> {
  const code = await quotes.issueCustomerOtp(userId);
  const store = await cookies();
  store.set(OTP_UID, String(userId), TEN_MIN);
  store.set(OTP_DEV, code, TEN_MIN); // demo only: no SMS provider yet, the popup shows it
  if (next) store.set(OTP_NEXT, next, TEN_MIN);
  else store.delete(OTP_NEXT);
  return code;
}

/** Priced lines for the builder; called from the client whenever the selection, months or slot change. */
export async function quoteLinesAction(codes: string[], months: number, slotSeconds: number): Promise<quotes.QuoteLine[]> {
  const parsed = quoteSchema.pick({ months: true, slotSeconds: true, codes: true }).safeParse({ codes, months, slotSeconds });
  if (!parsed.success) return [];
  return quotes.quoteLines(parsed.data.codes, parsed.data.months, parsed.data.slotSeconds);
}

export async function createQuotationAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = quoteSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  const session = await getSession();
  let target: string;
  try {
    const { quotation, user } = await quotes.createQuotation(parsed.data, session);
    target = `/orders/quotations/${quotation.id}?created=1`;
    if (session?.uid !== user.id) {
      // new or returning advertiser without a session: confirm the mobile number in the sign-in popup
      await startOtp(user.id, target);
      target = `/orders/quotations/${quotation.id}?created=1&login=1`;
    }
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  redirect(target);
}

/** Step 1 of the popup: mobile number → one-time code. Returns the next step instead of navigating. */
export async function requestOtpAction(_: ActionState<OtpState>, fd: FormData): Promise<ActionState<OtpState>> {
  const parsed = phoneLoginSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  const u = await quotes.findCustomerByPhone(parsed.data.phone);
  if (!u) return failed(fd, { phone: "No advertiser account uses this number yet" }, "Create a quotation first; a login is set up for you as part of it.");
  const next = safeNext(str(fd, "next"));
  const code = await startOtp(u.id, next);
  return { ok: true, data: { step: "code", devCode: code, next } };
}

/** Step 2 of the popup: code → session. Returns where to go next. */
export async function verifyOtpLoginAction(_: ActionState<OtpState>, fd: FormData): Promise<ActionState<OtpState>> {
  const parsed = otpSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  const store = await cookies();
  const uid = Number(store.get(OTP_UID)?.value);
  if (!uid) return { ...failed(fd, undefined, "This code request has expired. Enter your mobile number again."), data: { step: "phone" } };
  let next: string;
  try {
    const session = await quotes.verifyCustomerOtp(uid, parsed.data.code);
    await setSessionCookie(session);
    next = safeNext(str(fd, "next")) ?? safeNext(store.get(OTP_NEXT)?.value ?? "") ?? "/orders";
    store.delete(OTP_UID);
    store.delete(OTP_DEV);
    store.delete(OTP_NEXT);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  // Signing in re-renders the page the popup sits on (so it unmounts); when the destination is another
  // page the action itself navigates there, otherwise the refreshed page already shows the signed-in state.
  if (next.split("?")[0] !== str(fd, "current")) redirect(next);
  return { ok: true, data: { step: "code", next } };
}

export async function resendCustomerOtpAction(_: ActionState<OtpState>, fd: FormData): Promise<ActionState<OtpState>> {
  const store = await cookies();
  const uid = Number(store.get(OTP_UID)?.value);
  if (!uid) return { ...failed(fd, undefined, "This code request has expired. Enter your mobile number again."), data: { step: "phone" } };
  const code = await startOtp(uid, safeNext(store.get(OTP_NEXT)?.value ?? ""));
  return { ok: true, data: { step: "code", devCode: code } };
}
