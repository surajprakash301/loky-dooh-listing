import { cache } from "react";
import { Op, type Transaction } from "sequelize";
import {
  Billboard,
  BillboardMedia,
  BillboardSlotPricing,
  Category,
  File as FileRow,
  OnboardingEvent,
  ReviewSection,
  User,
  Vendor,
  VendorBankAccount,
  VendorContact,
  VendorDocument,
  sequelize,
  type DocType,
  type MediaKind,
  type Section,
} from "@/db";
import { encrypt } from "@/lib/server/crypto";
import { fourDigits, hashPassword, slugify, temporaryPassword } from "@/lib/server/password";
import type { BankInput, BillboardInput, BusinessInput, ContactsInput, PricingRowInput } from "@/lib/validation";

export class OnboardingError extends Error {}

export { SECTION_LABEL, REQUIRED_DOCS, DOC_LABEL, VENDOR_STATUS_LABEL as STATUS_LABEL } from "@/lib/domain";
import { DOC_LABEL, REQUIRED_DOCS, SECTION_LABEL, type StepState } from "@/lib/domain";

/* ---------- loading ---------- */

export const VENDOR_INCLUDE = [
  { model: User, as: "user" },
  { model: User, as: "representative" },
  { model: FileRow, as: "logo" },
  { model: VendorContact, as: "contacts" },
  { model: VendorBankAccount, as: "bankAccount" },
  { model: VendorDocument, as: "documents", include: [{ model: FileRow, as: "file" }] },
  {
    model: Billboard,
    as: "billboards",
    include: [
      { model: Category, as: "category" },
      { model: BillboardMedia, as: "media", include: [{ model: FileRow, as: "file" }] },
      { model: BillboardSlotPricing, as: "pricing" },
    ],
  },
  { model: ReviewSection, as: "reviewSections", include: [{ model: User, as: "reviewer" }] },
];

/** Full vendor graph for review/edit screens. Memoised per request so a layout and its page share one query. */
export const loadVendor = cache(async (id: number): Promise<Vendor | null> => {
  if (!Number.isInteger(id) || id <= 0) return null;
  return Vendor.findByPk(id, {
    include: VENDOR_INCLUDE,
    order: [
      [{ model: Billboard, as: "billboards" }, "id", "ASC"],
      [{ model: Billboard, as: "billboards" }, { model: BillboardMedia, as: "media" }, "sortOrder", "ASC"],
      [{ model: VendorContact, as: "contacts" }, "isPrimary", "DESC"],
    ],
  });
});

/** Representative-scoped load: the rep only sees vendors they onboarded. */
export async function loadVendorForRep(id: number, repId: number): Promise<Vendor> {
  const v = await loadVendor(id);
  if (!v || v.onboardedBy !== repId) throw new OnboardingError("Onboarding not found");
  return v;
}

export async function listForRep(repId: number) {
  return Vendor.findAll({
    where: { onboardedBy: repId },
    include: [
      { model: Billboard, as: "billboards", attributes: ["id", "status"] },
      { model: ReviewSection, as: "reviewSections", attributes: ["id", "status", "remark"] },
    ],
    order: [["updatedAt", "DESC"]],
  });
}

export async function loadEvents(vendorId: number) {
  return OnboardingEvent.findAll({
    where: { vendorId },
    include: [{ model: User, as: "actor", attributes: ["id", "name", "role"] }],
    order: [["createdAt", "DESC"]],
  });
}

/* ---------- editability ---------- */

export function reviewRow(v: Vendor, section: Section, billboardId?: number | null) {
  return (v.reviewSections ?? []).find(
    (r) => r.section === section && (section !== "billboard" || r.billboardId === (billboardId ?? null)),
  );
}

/** Rep may edit a section while the onboarding is a draft, or when the admin sent that section back. */
export function canEdit(v: Vendor, section: Section, billboardId?: number | null): boolean {
  if (v.status === "draft") return true;
  if (v.status === "rejected") return false;
  if (section === "billboard" && billboardId) {
    const b = v.billboards?.find((x) => x.id === billboardId);
    if (b?.status === "draft") return true; // added after approval, not submitted yet
  }
  if (v.status === "changes_requested" || v.status === "approved") {
    return reviewRow(v, section, billboardId)?.status === "changes_requested";
  }
  return false;
}

function assertEditable(v: Vendor, section: Section, billboardId?: number | null) {
  if (!canEdit(v, section, billboardId)) throw new OnboardingError("This section is locked for editing");
}

/* ---------- draft + sections ---------- */

export async function createDraft(repId: number): Promise<Vendor> {
  return sequelize.transaction(async (t) => {
    const v = await Vendor.create({ onboardedBy: repId, status: "draft" } as never, { transaction: t });
    await OnboardingEvent.create({ vendorId: v.id, actorId: repId, action: "created" } as never, { transaction: t });
    return v;
  });
}

export async function saveBusiness(vendorId: number, repId: number, data: BusinessInput, logoFileId?: number) {
  const v = await loadVendorForRep(vendorId, repId);
  assertEditable(v, "business");
  const dupe = await Vendor.findOne({ where: { gstNumber: data.gstNumber, id: { [Op.ne]: vendorId } } });
  if (dupe) throw new OnboardingError("A vendor with this GSTIN already exists");
  await v.update({ ...data, ...(logoFileId ? { logoFileId } : {}) });
  await markEdited(vendorId, "business");
}

export async function saveContacts(vendorId: number, repId: number, data: ContactsInput) {
  const v = await loadVendorForRep(vendorId, repId);
  assertEditable(v, "contacts");
  await sequelize.transaction(async (t) => {
    await VendorContact.destroy({ where: { vendorId }, transaction: t });
    await VendorContact.create(
      { vendorId, ...data.primary, designation: data.primary.designation ?? null, email: data.primary.email ?? null, isPrimary: true },
      { transaction: t },
    );
    const s = data.secondary;
    if (s?.name && s.phone) {
      await VendorContact.create(
        { vendorId, name: s.name, phone: s.phone, designation: s.designation ?? null, email: s.email ?? null, isPrimary: false },
        { transaction: t },
      );
    }
    await markEdited(vendorId, "contacts", null, t);
  });
}

export async function saveDocuments(
  vendorId: number,
  repId: number,
  docs: { docType: DocType; fileId: number; docNumber?: string | null }[],
) {
  const v = await loadVendorForRep(vendorId, repId);
  assertEditable(v, "documents");
  await sequelize.transaction(async (t) => {
    for (const d of docs) {
      await VendorDocument.destroy({ where: { vendorId, docType: d.docType }, transaction: t });
      await VendorDocument.create(
        { vendorId, docType: d.docType, fileId: d.fileId, docNumber: d.docNumber ?? null, expiresAt: null },
        { transaction: t },
      );
    }
    await markEdited(vendorId, "documents", null, t);
  });
}

export async function saveBank(vendorId: number, repId: number, data: BankInput) {
  const v = await loadVendorForRep(vendorId, repId);
  assertEditable(v, "bank");
  const row = {
    vendorId,
    accountHolder: data.accountHolder,
    bankName: data.bankName,
    branch: data.branch ?? null,
    accountNumberEnc: encrypt(data.accountNumber),
    accountLast4: data.accountNumber.slice(-4),
    ifsc: data.ifsc,
    upiId: data.upiId ?? null,
  };
  const existing = await VendorBankAccount.findOne({ where: { vendorId } });
  if (existing) await existing.update(row);
  else await VendorBankAccount.create(row);
  await markEdited(vendorId, "bank");
}

/* ---------- billboards ---------- */

async function nextCode(t: Transaction): Promise<string> {
  const last = await Billboard.findOne({ order: [["code", "DESC"]], transaction: t, lock: t.LOCK.UPDATE });
  const n = last ? parseInt(last.code, 10) + 10 : 1010;
  return String(n).padStart(5, "0");
}

export async function upsertBillboard(
  vendorId: number,
  repId: number,
  billboardId: number | null,
  data: BillboardInput,
  pricing: PricingRowInput[],
  media: { fileId: number; kind: MediaKind }[],
  removeMediaIds: number[],
): Promise<Billboard> {
  const v = await loadVendorForRep(vendorId, repId);
  if (billboardId) assertEditable(v, "billboard", billboardId);
  else if (!(v.status === "draft" || v.status === "approved")) throw new OnboardingError("Billboards can only be added to a draft or an approved vendor");

  const fields = {
    name: data.name,
    categoryId: data.categoryId,
    tier: data.tier,
    addressLine: data.addressLine,
    landmark: data.landmark ?? null,
    locality: data.locality,
    city: data.city,
    state: data.state,
    pincode: data.pincode ?? null,
    lat: data.lat,
    lng: data.lng,
    screenType: data.screenType,
    widthFt: data.widthFt,
    heightFt: data.heightFt,
    pixelPitch: data.pixelPitch ?? null,
    refreshRateHz: data.refreshRateHz ?? null,
    brightnessNits: data.brightnessNits ?? null,
    viewingAngleH: data.viewingAngleH ?? null,
    viewingAngleV: data.viewingAngleV ?? null,
    opsStart: data.opsStart,
    opsEnd: data.opsEnd,
    loopSeconds: data.loopSeconds,
    slotsPerLoop: data.slotsPerLoop,
    dailyImpressions: data.dailyImpressions,
    lokySense: data.lokySense,
    description: data.description ?? null,
  };

  return sequelize.transaction(async (t) => {
    let b: Billboard;
    if (billboardId) {
      b = v.billboards!.find((x) => x.id === billboardId)!;
      await b.update(fields, { transaction: t });
      await markEdited(vendorId, "billboard", b.id, t);
    } else {
      b = await Billboard.create({ vendorId, code: await nextCode(t), status: "draft", liveStatus: null, ...fields }, { transaction: t });
      await OnboardingEvent.create({ vendorId, actorId: repId, action: "billboard_added", billboardId: b.id, section: "billboard" } as never, { transaction: t });
    }

    if (removeMediaIds.length) await BillboardMedia.destroy({ where: { billboardId: b.id, id: removeMediaIds }, transaction: t });
    const existingCount = await BillboardMedia.count({ where: { billboardId: b.id }, transaction: t });
    for (const [i, m] of media.entries()) {
      await BillboardMedia.create(
        { billboardId: b.id, fileId: m.fileId, kind: m.kind, sortOrder: existingCount + i, isCover: false },
        { transaction: t },
      );
    }
    // Cover = first day photo, else first media row.
    const all = await BillboardMedia.findAll({ where: { billboardId: b.id }, order: [["sortOrder", "ASC"]], transaction: t });
    const cover = all.find((m) => m.kind === "day_photo") ?? all[0];
    for (const m of all) if (m.isCover !== (m.id === cover?.id)) await m.update({ isCover: m.id === cover?.id }, { transaction: t });

    await BillboardSlotPricing.destroy({ where: { billboardId: b.id }, transaction: t });
    const seen = new Set<string>();
    for (const p of pricing) {
      const k = `${p.slotSeconds}-${p.package}`;
      if (seen.has(k)) continue;
      seen.add(k);
      await BillboardSlotPricing.create({ billboardId: b.id, ...p, isActive: true }, { transaction: t });
    }
    return b;
  });
}

export async function deleteBillboard(vendorId: number, repId: number, billboardId: number) {
  const v = await loadVendorForRep(vendorId, repId);
  const b = v.billboards?.find((x) => x.id === billboardId);
  if (!b || b.status !== "draft") throw new OnboardingError("Only unsubmitted billboards can be removed");
  await sequelize.transaction(async (t) => {
    await BillboardMedia.destroy({ where: { billboardId }, transaction: t });
    await BillboardSlotPricing.destroy({ where: { billboardId }, transaction: t });
    await ReviewSection.destroy({ where: { billboardId }, transaction: t });
    await b.destroy({ transaction: t });
  });
}

/* ---------- completeness ---------- */

export type Completeness = { ok: boolean; problems: { section: Section; billboardId?: number; message: string }[] };

export function billboardProblems(b: Billboard): string[] {
  const p: string[] = [];
  if (!(b.media ?? []).some((m) => m.kind === "day_photo")) p.push("needs at least one day photo");
  if (!(b.pricing ?? []).length) p.push("needs at least one pricing row");
  if (b.lat == null || b.lng == null) p.push("needs a map pin (lat/lng)");
  return p;
}

export function checkCompleteness(v: Vendor): Completeness {
  const problems: Completeness["problems"] = [];
  if (!v.legalName || !v.gstNumber || !v.panNumber || !v.addressLine) problems.push({ section: "business", message: "Business details are incomplete" });
  if (!(v.contacts ?? []).some((c) => c.isPrimary)) problems.push({ section: "contacts", message: "A primary contact is required" });
  const have = new Set((v.documents ?? []).map((d) => d.docType));
  const missing = REQUIRED_DOCS.filter((d) => !have.has(d));
  if (missing.length) problems.push({ section: "documents", message: `Missing: ${missing.map((d) => DOC_LABEL[d]).join(", ")}` });
  if (!v.bankAccount) problems.push({ section: "bank", message: "Bank details are required" });
  const boards = v.billboards ?? [];
  if (!boards.length) problems.push({ section: "billboard", message: "At least one billboard is required" });
  for (const b of boards) for (const m of billboardProblems(b)) problems.push({ section: "billboard", billboardId: b.id, message: `${b.name} ${m}` });
  return { ok: problems.length === 0, problems };
}

/* ---------- submit / resubmit ---------- */

export type IssuedCredentials = { username: string; password: string };

async function issueLogin(v: Vendor, t: Transaction): Promise<IssuedCredentials> {
  const base = slugify(v.tradeName ?? v.legalName ?? "vendor");
  let username = `${base}-${fourDigits()}`;
  for (let i = 0; i < 5 && (await User.findOne({ where: { username }, transaction: t })); i++) username = `${base}-${fourDigits()}`;
  const password = temporaryPassword();
  const primary = v.contacts?.find((c) => c.isPrimary);
  const user = await User.create(
    {
      role: "vendor",
      username,
      email: null,
      phone: primary?.phone ?? null,
      name: v.tradeName ?? v.legalName ?? username,
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      lastLoginAt: null,
    },
    { transaction: t },
  );
  await v.update({ userId: user.id }, { transaction: t });
  return { username, password };
}

/** First submission: validates, creates review rows, issues the vendor login. */
export async function submit(vendorId: number, repId: number): Promise<IssuedCredentials> {
  const v = await loadVendorForRep(vendorId, repId);
  if (v.status !== "draft") throw new OnboardingError("Only a draft can be submitted");
  const c = checkCompleteness(v);
  if (!c.ok) throw new OnboardingError(c.problems.map((p) => p.message).join(" · "));

  return sequelize.transaction(async (t) => {
    const now = new Date();
    for (const s of ["business", "contacts", "documents", "bank"] as Section[]) {
      await ReviewSection.create({ vendorId, section: s, billboardId: null, status: "pending", remark: null, round: 1, reviewedBy: null, reviewedAt: null }, { transaction: t });
    }
    for (const b of v.billboards ?? []) {
      await ReviewSection.create({ vendorId, section: "billboard", billboardId: b.id, status: "pending", remark: null, round: 1, reviewedBy: null, reviewedAt: null }, { transaction: t });
      await b.update({ status: "pending" }, { transaction: t });
    }
    const creds = await issueLogin(v, t);
    await v.update({ status: "pending", submittedAt: now }, { transaction: t });
    await OnboardingEvent.create({ vendorId, actorId: repId, action: "submitted" } as never, { transaction: t });
    await OnboardingEvent.create({ vendorId, actorId: repId, action: "credentials_issued", remark: `username ${creds.username}` } as never, { transaction: t });
    return creds;
  });
}

/** After "changes requested": flagged sections go back to pending with round + 1. */
export async function resubmit(vendorId: number, repId: number) {
  const v = await loadVendorForRep(vendorId, repId);
  const flagged = (v.reviewSections ?? []).filter((r) => r.status === "changes_requested");
  // An approved vendor can have a flagged *new* billboard; the vendor itself stays approved.
  if (!flagged.length || !(v.status === "changes_requested" || v.status === "approved")) throw new OnboardingError("Nothing to resubmit");
  const stale = flagged.filter((r) => !r.lastEditedAt || (r.reviewedAt && r.lastEditedAt <= r.reviewedAt));
  if (stale.length) {
    const label = (r: ReviewSection) => {
      const b = r.billboardId ? v.billboards?.find((x) => x.id === r.billboardId) : null;
      return b ? `E · ${b.name} #${b.code}` : SECTION_LABEL[r.section];
    };
    throw new OnboardingError(`Edit these sections before resubmitting: ${stale.map(label).join(", ")}`);
  }
  await sequelize.transaction(async (t) => {
    for (const r of flagged) {
      await r.update({ status: "pending", round: r.round + 1, remark: null, reviewedAt: null, reviewedBy: null }, { transaction: t });
      if (r.billboardId) await Billboard.update({ status: "pending" }, { where: { id: r.billboardId }, transaction: t });
    }
    if (v.status === "changes_requested") await v.update({ status: "pending" }, { transaction: t });
    await OnboardingEvent.create({ vendorId, actorId: repId, action: "resubmitted" } as never, { transaction: t });
  });
}

/** A billboard added after approval is submitted on its own and reviewed as a single section E. */
export async function submitNewBillboard(vendorId: number, repId: number, billboardId: number) {
  const v = await loadVendorForRep(vendorId, repId);
  const b = v.billboards?.find((x) => x.id === billboardId);
  if (!b || b.status !== "draft" || v.status !== "approved") throw new OnboardingError("This billboard cannot be submitted");
  const problems = billboardProblems(b);
  if (problems.length) throw new OnboardingError(`${b.name} ${problems.join(", ")}`);
  await sequelize.transaction(async (t) => {
    await ReviewSection.create({ vendorId, section: "billboard", billboardId: b.id, status: "pending", remark: null, round: 1, reviewedBy: null, reviewedAt: null }, { transaction: t });
    await b.update({ status: "pending" }, { transaction: t });
    await OnboardingEvent.create({ vendorId, actorId: repId, action: "submitted", section: "billboard", billboardId: b.id } as never, { transaction: t });
  });
}

/** Records that the representative saved a section, so the resubmit gate knows it was touched after the remark. */
async function markEdited(vendorId: number, section: Section, billboardId: number | null = null, t?: Transaction) {
  await ReviewSection.update({ lastEditedAt: new Date() }, { where: { vendorId, section, billboardId }, transaction: t });
}

/* ---------- stepper view model (plain data for client components) ---------- */

export type { StepState } from "@/lib/domain";

export function stepStates(v: Vendor): StepState[] {
  const base = `/rep/onboard/${v.id}`;
  const have = new Set((v.documents ?? []).map((d) => d.docType));
  const core: { section: Section; href: string; filled: boolean }[] = [
    { section: "business", href: `${base}/business`, filled: !!(v.legalName && v.gstNumber && v.panNumber && v.addressLine) },
    { section: "contacts", href: `${base}/contacts`, filled: (v.contacts ?? []).some((c) => c.isPrimary) },
    { section: "documents", href: `${base}/documents`, filled: REQUIRED_DOCS.every((d) => have.has(d)) },
    { section: "bank", href: `${base}/bank`, filled: !!v.bankAccount },
  ];
  const steps: StepState[] = core.map((c) => {
    const r = reviewRow(v, c.section);
    return { key: c.section, section: c.section, label: SECTION_LABEL[c.section], href: c.href, filled: c.filled, status: r?.status ?? "draft", remark: r?.remark ?? null, round: r?.round ?? 0, editable: canEdit(v, c.section) };
  });
  for (const b of v.billboards ?? []) {
    const r = reviewRow(v, "billboard", b.id);
    steps.push({
      key: `billboard:${b.id}`,
      section: "billboard",
      billboardId: b.id,
      label: `E · ${b.name || "Billboard"} #${b.code}`,
      href: `${base}/billboards/${b.id}`,
      filled: billboardProblems(b).length === 0,
      status: r?.status ?? "draft",
      remark: r?.remark ?? null,
      round: r?.round ?? 0,
      editable: canEdit(v, "billboard", b.id),
    });
  }
  return steps;
}
