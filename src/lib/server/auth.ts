import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/db/models";
import { SESSION_COOKIE, type SessionPayload, homeFor, readSession, signSession } from "@/lib/session";
import { env } from "./env";

/** Memoised per request: layouts, pages and the header all read the same decoded session. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  return readSession(store.get(SESSION_COOKIE)?.value);
});

export async function setSessionCookie(payload: SessionPayload) {
  const days = payload.role === "vendor" || payload.role === "customer" ? 30 : 7;
  const token = await signSession(payload, days);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env().NODE_ENV === "production",
    path: "/",
    maxAge: days * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Server-component / action guard. Redirects to login (or the role's own home) when the role doesn't match. */
export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!roles.includes(s.role)) redirect(homeFor(s.role));
  // The forced password change for vendors is enforced once, in proxy.ts, so pages never redirect to themselves.
  return s;
}

export class AuthError extends Error {}

/** Action-side guard that throws instead of redirecting, for use inside try/catch. */
export async function assertRole(...roles: Role[]): Promise<SessionPayload> {
  const s = await getSession();
  if (!s || !roles.includes(s.role)) throw new AuthError("Not allowed");
  return s;
}
