import { AgencyMember, OnboardingEvent, User, Vendor, type Role } from "@/db";
import { hashPassword, temporaryPassword, verifyPassword } from "@/lib/server/password";
import type { SessionPayload } from "@/lib/session";

export class LoginError extends Error {}

export async function login(username: string, password: string): Promise<SessionPayload> {
  const u = await User.findOne({
    where: { username: username.trim().toLowerCase() },
    include: [{ model: Vendor, as: "vendor", attributes: ["id", "status"] }, { model: AgencyMember, as: "agencyMembership", attributes: ["agencyId"] }],
  });
  if (!u || !(await verifyPassword(password, u.passwordHash))) throw new LoginError("Wrong username or password");
  if (u.status === "disabled") throw new LoginError("This account has been disabled. Contact Loky Media.");
  await u.update({ lastLoginAt: new Date() });
  return {
    uid: u.id,
    role: u.role,
    name: u.name,
    vendorId: u.vendor?.id,
    agencyId: u.agencyMembership?.agencyId,
    mustChangePassword: u.mustChangePassword,
  };
}

export async function changePassword(userId: number, current: string, next: string): Promise<SessionPayload> {
  const u = await User.findByPk(userId, { include: [{ model: Vendor, as: "vendor", attributes: ["id"] }, { model: AgencyMember, as: "agencyMembership", attributes: ["agencyId"] }] });
  if (!u || !(await verifyPassword(current, u.passwordHash))) throw new LoginError("Current password is wrong");
  await u.update({ passwordHash: await hashPassword(next), mustChangePassword: false });
  return { uid: u.id, role: u.role, name: u.name, vendorId: u.vendor?.id, agencyId: u.agencyMembership?.agencyId, mustChangePassword: false };
}

export async function signupCustomer(d: { name: string; email: string; phone: string; password: string }): Promise<SessionPayload> {
  const email = d.email.toLowerCase();
  if (await User.findOne({ where: { email } })) throw new LoginError("An account with this email already exists");
  const u = await User.create({
    role: "customer",
    username: email,
    email,
    phone: d.phone,
    name: d.name,
    passwordHash: await hashPassword(d.password),
    lastLoginAt: new Date(),
  });
  return { uid: u.id, role: "customer", name: u.name };
}

export async function createStaff(d: { role: Role; name: string; username: string; email?: string; phone?: string; password: string }) {
  if (await User.findOne({ where: { username: d.username } })) throw new LoginError("Username already taken");
  return User.create({
    role: d.role,
    username: d.username,
    email: d.email ?? null,
    phone: d.phone ?? null,
    name: d.name,
    passwordHash: await hashPassword(d.password),
    lastLoginAt: null,
  });
}

export async function listStaff() {
  return User.findAll({ where: { role: ["admin", "representative"] }, order: [["role", "ASC"], ["name", "ASC"]] });
}

/** Admin reset of a vendor login: new temporary password, forced change on next login. */
export async function resetVendorPassword(vendorId: number, adminId: number): Promise<{ username: string; password: string }> {
  const v = await Vendor.findByPk(vendorId, { include: [{ model: User, as: "user" }] });
  if (!v?.user) throw new LoginError("This vendor has no login yet");
  const password = temporaryPassword();
  await v.user.update({ passwordHash: await hashPassword(password), mustChangePassword: true, status: "active" });
  await OnboardingEvent.create({ vendorId, actorId: adminId, action: "password_reset" } as never);
  return { username: v.user.username, password };
}
