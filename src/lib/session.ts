import { SignJWT, jwtVerify } from "jose";
import { type Role, homeFor } from "@/lib/domain";

export { homeFor };

// Shared by proxy.ts (edge runtime) and server code, so this file must stay free of Node-only imports.
export const SESSION_COOKIE = "loky_session";

export type SessionPayload = {
  uid: number;
  role: Role;
  name: string;
  vendorId?: number;
  agencyId?: number;
  mustChangePassword?: boolean;
};

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export async function signSession(payload: SessionPayload, days: number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secret());
}

export async function readSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
