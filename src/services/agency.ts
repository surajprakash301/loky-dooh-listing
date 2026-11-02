import { cache } from "react";
import { randomInt } from "node:crypto";
import { Op } from "sequelize";
import {
  Agency, AgencyActivity, AgencyAssessment, AgencyMember, Billboard, BillboardMedia, BillboardSlotPricing, Brand, BrandAsset, Campaign, CampaignScreen, Category, File as FileRow, OtpCode, Payment, Proposal, Quotation, User, Vendor, WalletTransaction, sequelize,
  type AgencyEvent, type VerificationPath,
} from "@/db";
import { TEAM_LIMIT, commissionForScore } from "@/lib/domain";
import { hashPassword } from "@/lib/server/password";
import type { AgencyProfileInput, AssessmentInput, BrandInput, FounderInput } from "@/lib/validation";

export class AgencyError extends Error {}

const FREE_DOMAINS = new Set(["gmail.com", "yahoo.com", "yahoo.in", "outlook.com", "hotmail.com", "rediffmail.com", "icloud.com", "proton.me", "protonmail.com", "live.com"]);

export function verificationPathFor(email: string, gst: string | undefined): VerificationPath {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!FREE_DOMAINS.has(domain)) return "enterprise";
  return gst ? "public" : "unregistered";
}

export async function logActivity(agencyId: number, actorId: number | null, action: AgencyEvent, message: string, t?: import("sequelize").Transaction) {
  await AgencyActivity.create({ agencyId, actorId, action, message }, { transaction: t });
}

/* ---------- registration (Phase 1) ---------- */

export type RegistrationResult = { userId: number; agencyId: number; path: VerificationPath; otp: string };

/** Creates the owner login + agency in one transaction and issues the first OTP. The OTP is returned so dev builds can display it (no SMS/email provider yet). */
export async function register(profile: AgencyProfileInput, founder: FounderInput): Promise<RegistrationResult> {
  if (await User.findOne({ where: { [Op.or]: [{ email: founder.founderEmail }, { username: founder.founderEmail }] } })) throw new AgencyError("An account with this email already exists. Sign in instead.");
  if (profile.gstNumber && (await Agency.findOne({ where: { gstNumber: profile.gstNumber } }))) throw new AgencyError("An agency with this GSTIN is already registered.");
  const path = verificationPathFor(founder.founderEmail, profile.gstNumber);
  return sequelize.transaction(async (t) => {
    const user = await User.create({
      role: "agency", username: founder.founderEmail, email: founder.founderEmail, phone: founder.founderPhone, name: founder.founderName,
      passwordHash: await hashPassword(founder.password), status: "active", lastLoginAt: null,
    }, { transaction: t });
    const agency = await Agency.create({
      ownerUserId: user.id, legalName: profile.legalName, gstNumber: profile.gstNumber ?? null, addressLine: profile.addressLine, city: profile.city, state: profile.state, pincode: profile.pincode ?? null,
      logoFileId: null, founderName: founder.founderName, founderPhone: founder.founderPhone, founderEmail: founder.founderEmail, founderRole: founder.founderRole,
      verificationPath: path, verifiedAt: null, assessmentScore: null, partnerSince: null,
      expertCallbackDueAt: path === "unregistered" ? new Date(Date.now() + 60 * 60_000) : null,
    }, { transaction: t });
    await AgencyMember.create({ agencyId: agency.id, userId: user.id, title: "Owner", isOwner: true }, { transaction: t });
    const otp = await issueOtp(user.id, path === "enterprise" ? "email" : "mobile", t);
    await logActivity(agency.id, user.id, "registered", `${profile.legalName} registered (${path} verification)`, t);
    return { userId: user.id, agencyId: agency.id, path, otp };
  });
}

export async function issueOtp(userId: number, channel: "email" | "mobile", t?: import("sequelize").Transaction): Promise<string> {
  const code = String(randomInt(100000, 999999));
  await OtpCode.update({ consumedAt: new Date() }, { where: { userId, consumedAt: null }, transaction: t });
  await OtpCode.create({ userId, channel, code, expiresAt: new Date(Date.now() + 10 * 60_000), consumedAt: null }, { transaction: t });
  return code;
}

export async function verifyOtp(userId: number, code: string): Promise<Agency> {
  const otp = await OtpCode.findOne({ where: { userId, consumedAt: null }, order: [["createdAt", "DESC"]] });
  if (!otp || otp.code !== code) throw new AgencyError("That code is not right. Check the latest code and try again.");
  if (otp.expiresAt < new Date()) throw new AgencyError("This code has expired. Request a new one.");
  const agency = await Agency.findOne({ where: { ownerUserId: userId } });
  if (!agency) throw new AgencyError("Registration not found");
  await sequelize.transaction(async (t) => {
    await otp.update({ consumedAt: new Date() }, { transaction: t });
    await agency.update({ verifiedAt: new Date() }, { transaction: t });
    await logActivity(agency.id, userId, "verified", "Identity verified; workspace opened in restricted mode", t);
  });
  return agency;
}

/* ---------- assessment (Phase 2) ---------- */

export function scoreAssessment(a: AssessmentInput): number {
  let s = 4;
  s += Math.min(a.services.length, 4) * 0.5;
  s += Math.min(a.sectors.length, 4) * 0.4;
  s += { "1-5": 0.4, "6-15": 1.0, "16-50": 1.6, "50+": 2.0 }[a.portfolioSize];
  s += { none: 0.2, some: 0.8, regular: 1.4, expert: 2.0 }[a.doohExperience];
  return Math.min(10, Math.round(s * 10) / 10);
}

export async function completeAssessment(agencyId: number, actorId: number, a: AssessmentInput) {
  const agency = await Agency.findByPk(agencyId);
  if (!agency) throw new AgencyError("Agency not found");
  if (agency.status !== "registered") throw new AgencyError("Assessment already completed");
  const score = scoreAssessment(a);
  const commissionPct = commissionForScore(score);
  await sequelize.transaction(async (t) => {
    await AgencyAssessment.create({ agencyId, services: a.services, sectors: a.sectors, portfolioSize: a.portfolioSize, doohExperience: a.doohExperience, score, commissionPct }, { transaction: t });
    await agency.update({ status: "partner", assessmentScore: score, commissionPct, partnerSince: new Date(), expertCallbackDueAt: new Date(Date.now() + 60 * 60_000) }, { transaction: t });
    await logActivity(agencyId, actorId, "assessment_completed", `Partner assessment complete: ${score}/10 → ${commissionPct}% base commission`, t);
  });
  return { score, commissionPct };
}

/* ---------- loading ---------- */

export const loadAgency = cache(async (id: number) =>
  Agency.findByPk(id, {
    include: [{ model: User, as: "owner", attributes: ["id", "name", "email", "username"] }, { model: FileRow, as: "logo" }, { model: AgencyMember, as: "members", include: [{ model: User, as: "user", attributes: ["id", "name", "email", "phone"] }] }],
  }),
);

export async function dashboardStats(agencyId: number) {
  const [brands, activeCampaigns, orders, spendRow, pendingApprovals, walletRow, recent] = await Promise.all([
    Brand.count({ where: { agencyId } }),
    Campaign.count({ where: { agencyId, status: ["confirmed", "active"] } }),
    Campaign.count({ where: { agencyId } }),
    Payment.findOne({ where: { agencyId, status: "paid" }, attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "total"]], raw: true }) as Promise<{ total: string | null } | null>,
    Campaign.count({ where: { agencyId, status: "pending_payment" } }),
    WalletTransaction.findOne({ where: { agencyId }, attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "total"]], raw: true }) as Promise<{ total: string | null } | null>,
    AgencyActivity.findAll({ where: { agencyId }, order: [["createdAt", "DESC"]], limit: 6, include: [{ model: User, as: "actor", attributes: ["name"] }] }),
  ]);
  return { brands, activeCampaigns, orders, totalSpend: Number(spendRow?.total ?? 0), pendingApprovals, wallet: Number(walletRow?.total ?? 0), recent };
}

/* ---------- brands & clients ---------- */

export const BRAND_INCLUDE = [
  { model: FileRow, as: "logo" },
  { model: AgencyMember, as: "manager", include: [{ model: User, as: "user", attributes: ["name"] }] },
  { model: Campaign, as: "campaigns", attributes: ["id", "title", "status", "total", "startDate", "endDate", "workOrderNo"] },
];

export async function listBrands(agencyId: number) {
  return Brand.findAll({ where: { agencyId }, include: BRAND_INCLUDE, order: [["createdAt", "DESC"]] });
}

export async function loadBrand(agencyId: number, brandId: number) {
  const b = await Brand.findOne({
    where: { id: brandId, agencyId },
    include: [
      ...BRAND_INCLUDE,
      { model: BrandAsset, as: "assets", include: [{ model: FileRow, as: "file" }] },
      { model: Proposal, as: "proposals", attributes: ["id", "title", "status", "viewCount", "shareToken", "createdAt"] },
      { model: Quotation, as: "quotations", attributes: ["id", "title", "status", "total", "shareToken", "createdAt"] },
    ],
    order: [[{ model: BrandAsset, as: "assets" }, "createdAt", "DESC"]],
  });
  if (!b) throw new AgencyError("Brand not found");
  return b;
}

export async function createBrand(agencyId: number, actorId: number, data: BrandInput, logoFileId?: number) {
  const b = await Brand.create({ agencyId, name: data.name, hq: data.hq ?? null, category: data.category ?? null, website: data.website ?? null, logoFileId: logoFileId ?? null, managerMemberId: null, lockedUntil: null });
  await logActivity(agencyId, actorId, "brand_added", `Brand "${data.name}" added`);
  return b;
}

export async function assignManager(agencyId: number, actorId: number, brandId: number, memberId: number) {
  const [brand, member] = await Promise.all([Brand.findOne({ where: { id: brandId, agencyId } }), AgencyMember.findOne({ where: { id: memberId, agencyId }, include: [{ model: User, as: "user" }] })]);
  if (!brand || !member) throw new AgencyError("Brand or team member not found");
  await brand.update({ managerMemberId: member.id });
  await logActivity(agencyId, actorId, "manager_assigned", `${member.user?.name} assigned to ${brand.name}`);
}

export async function addAsset(agencyId: number, actorId: number, brandId: number, fileId: number, name: string, specs: string | null) {
  const brand = await Brand.findOne({ where: { id: brandId, agencyId } });
  if (!brand) throw new AgencyError("Brand not found");
  const version = (await BrandAsset.count({ where: { brandId, name } })) + 1;
  const asset = await BrandAsset.create({ brandId, fileId, name, version, specs });
  await logActivity(agencyId, actorId, "asset_uploaded", `Creative "${name}" v${version} uploaded for ${brand.name}`);
  return asset;
}

export async function setAssetStatus(agencyId: number, assetId: number, status: "approved" | "reviewing" | "rejected") {
  const asset = await BrandAsset.findByPk(assetId, { include: [{ model: Brand, as: "brand" }] });
  if (!asset || asset.brand?.agencyId !== agencyId) throw new AgencyError("Asset not found");
  await asset.update({ status });
}

/* ---------- team ---------- */

export async function addMember(agencyId: number, actorId: number, d: { name: string; title: string; email: string; phone?: string; password: string }) {
  const count = await AgencyMember.count({ where: { agencyId } });
  if (count >= TEAM_LIMIT) throw new AgencyError(`Your plan allows ${TEAM_LIMIT} team members. Upgrade to add more.`);
  if (await User.findOne({ where: { [Op.or]: [{ email: d.email }, { username: d.email }] } })) throw new AgencyError("A user with this email already exists");
  return sequelize.transaction(async (t) => {
    const user = await User.create({ role: "agency_member", username: d.email, email: d.email, phone: d.phone ?? null, name: d.name, passwordHash: await hashPassword(d.password), status: "active", lastLoginAt: null }, { transaction: t });
    const m = await AgencyMember.create({ agencyId, userId: user.id, title: d.title, isOwner: false }, { transaction: t });
    await logActivity(agencyId, actorId, "member_added", `${d.name} joined the team as ${d.title}`, t);
    return m;
  });
}

export async function listMembers(agencyId: number) {
  return AgencyMember.findAll({ where: { agencyId }, include: [{ model: User, as: "user", attributes: ["id", "name", "email", "phone", "lastLoginAt"] }, { model: Brand, as: "brands", attributes: ["id", "name"] }], order: [["isOwner", "DESC"], ["createdAt", "ASC"]] });
}

/* ---------- catalog for proposals ---------- */

export async function liveScreens() {
  return Billboard.findAll({
    where: { status: "approved" },
    include: [
      { model: Vendor, as: "vendor", attributes: ["id", "tradeName", "status"], where: { status: "approved" }, required: true },
      { model: Category, as: "category" },
      { model: BillboardMedia, as: "media", include: [{ model: FileRow, as: "file" }] },
      { model: BillboardSlotPricing, as: "pricing", where: { isActive: true }, required: false },
      { model: CampaignScreen, as: "bookings", required: false, include: [{ model: Campaign, as: "campaign", attributes: ["status"] }] },
    ],
    order: [["city", "ASC"], ["name", "ASC"]],
  });
}

export async function activityFeed(agencyId: number, limit = 30) {
  return AgencyActivity.findAll({ where: { agencyId }, order: [["createdAt", "DESC"]], limit, include: [{ model: User, as: "actor", attributes: ["name"] }] });
}
