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

function safeNext(next: string): string | null {
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}

async function startOtp(userId: number, next: string | null) {
  const code = await quotes.issueCustomerOtp(userId);
  const store = await cookies();
  store.set(OTP_UID, String(userId), TEN_MIN);
  store.set(OTP_DEV, code, TEN_MIN); // demo only: no SMS provider yet, the verify page shows it
  if (next) store.set(OTP_NEXT, next, TEN_MIN);
  else store.delete(OTP_NEXT);
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
    target = `/my/quotations/${quotation.id}?created=1`;
    if (session?.uid === user.id) {
      // already signed in as this advertiser: straight to the quotation
    } else {
      await startOtp(user.id, target);
      target = "/login/otp?sent=1&new=1";
    }
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  redirect(target);
}

export async function requestOtpAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = phoneLoginSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  const u = await quotes.findCustomerByPhone(parsed.data.phone);
  if (!u) return failed(fd, { phone: "No advertiser account uses this number yet" }, "Create a quotation first; a login is set up for you as part of it.");
  await startOtp(u.id, safeNext(str(fd, "next")));
  redirect("/login/otp?sent=1");
}

export async function verifyOtpLoginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = otpSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  const store = await cookies();
  const uid = Number(store.get(OTP_UID)?.value);
  if (!uid) return failed(fd, undefined, "This code request has expired. Enter your mobile number again.");
  let next: string;
  try {
    const session = await quotes.verifyCustomerOtp(uid, parsed.data.code);
    await setSessionCookie(session);
    next = safeNext(store.get(OTP_NEXT)?.value ?? "") ?? "/my/quotations";
    store.delete(OTP_UID);
    store.delete(OTP_DEV);
    store.delete(OTP_NEXT);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  redirect(next);
}

export async function resendCustomerOtpAction(): Promise<void> {
  const store = await cookies();
  const uid = Number(store.get(OTP_UID)?.value);
  if (!uid) redirect("/login/otp");
  await startOtp(uid, safeNext(store.get(OTP_NEXT)?.value ?? ""));
  redirect("/login/otp?sent=1&resent=1");
}
