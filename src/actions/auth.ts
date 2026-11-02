"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { assertRole, clearSessionCookie, getSession, setSessionCookie } from "@/lib/server/auth";
import { clearFailures, isLimited, recordFailure } from "@/lib/server/rate-limit";

const LOGIN_LIMIT = { limit: 8, windowMs: 10 * 60_000 };
import { homeFor } from "@/lib/session";
import { customerSignupSchema, fieldErrors, loginSchema, passwordChangeSchema, staffSchema } from "@/lib/validation";
import * as auth from "@/services/auth";
import { type ActionState, failed, messageOf, str, toObject } from "./types";

function safeNext(next: string): string | null {
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const key = `login:${ip}:${parsed.data.username.toLowerCase()}`;
  const gate = isLimited(key, LOGIN_LIMIT);
  if (gate.limited) return failed(fd, undefined, `Too many failed attempts. Try again in ${Math.max(1, Math.ceil(gate.retryAfterSec / 60))} min.`);
  let target: string;
  try {
    const session = await auth.login(parsed.data.username, parsed.data.password).catch((e) => {
      recordFailure(key, LOGIN_LIMIT.windowMs);
      throw e;
    });
    clearFailures(key);
    await setSessionCookie(session);
    const next = safeNext(str(fd, "next"));
    target = session.mustChangePassword && session.role === "vendor" ? "/vendor/settings/password" : next ?? homeFor(session.role);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  redirect(target);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function signupAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = customerSignupSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    const session = await auth.signupCustomer(parsed.data);
    await setSessionCookie(session);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  redirect(safeNext(str(fd, "next")) ?? "/");
}

export async function changePasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const s = await getSession();
  if (!s) redirect("/login");
  const parsed = passwordChangeSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    const session = await auth.changePassword(s.uid, parsed.data.current, parsed.data.next);
    await setSessionCookie(session);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  redirect(homeFor(s.role));
}

export async function createStaffAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await assertRole("admin");
  const parsed = staffSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    await auth.createStaff(parsed.data);
    revalidatePath("/admin/staff");
    return { ok: true };
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
}
