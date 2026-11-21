import { randomBytes, randomInt } from "node:crypto";
import { Billboard, CustomerQuotation, CustomerQuotationItem, OtpCode, User, sequelize } from "@/db";
import { GST_PCT, QUOTE_VALID_DAYS, packageForMonths, type Package, type QuoteStatus } from "@/lib/domain";
import { hashPassword, temporaryPassword } from "@/lib/server/password";
import type { SessionPayload } from "@/lib/session";
import { listByCodes, mediaUrls, rateFor } from "./catalog";

export class QuoteError extends Error {}

export type QuoteLine = {
  code: string;
  billboardId: number;
  name: string;
  address: string;
  locality: string;
  city: string;
  image: string | null;
  sizeFt: string;
  screenType: string;
  reach: number;
  listPerMonth: number;
  netPerMonth: number;
  months: number;
  lineTotal: number;
  /** true when the vendor has no rate for this slot/package and a fallback row was used */
  estimated: boolean;
};

/** Monthly list/net rate for one slot length and campaign length, with the catalogue's fallbacks. */
function monthlyRate(b: Billboard, slotSeconds: number, months: number): { list: number; net: number; estimated: boolean } | null {
  const r = rateFor(b, slotSeconds, packageForMonths(months));
  return r ? { list: r.list, net: r.offer, estimated: r.estimated } : null;
}

/** Priced lines for the builder, in the customer's order. Billboards without any rate are skipped. */
export async function quoteLines(codes: string[], months: number, slotSeconds: number): Promise<QuoteLine[]> {
  const rows = await listByCodes(codes);
  return rows.flatMap((b) => {
    const r = monthlyRate(b, slotSeconds, months);
    if (!r) return [];
    return [{
      code: b.code,
      billboardId: b.id,
      name: b.name,
      address: [b.addressLine, b.locality, b.city, b.state, b.pincode].filter(Boolean).join(", "),
      locality: b.locality,
      city: b.city,
      image: mediaUrls(b)[0] ?? null,
      sizeFt: `${Number(b.widthFt)}ft x ${Number(b.heightFt)}ft`,
      screenType: b.screenType.toUpperCase(),
      reach: b.dailyImpressions,
      listPerMonth: r.list,
      netPerMonth: r.net,
      months,
      lineTotal: r.net * months,
      estimated: r.estimated,
    }];
  });
}

export function totals(lines: { lineTotal: number }[]) {
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
  const gstAmount = Math.round(subtotal * GST_PCT) / 100;
  return { subtotal, gstAmount, total: Math.round(subtotal + gstAmount) };
}

const normPhone = (p: string) => p.replace(/\D/g, "").slice(-10);

/**
 * The advertiser a quotation belongs to. A signed-in customer keeps their account; otherwise the
 * mobile number (then the email) finds an existing customer, and failing that a new login is created
 * so the person can come back with mobile + OTP.
 */
export async function ensureCustomer(d: { name: string; email: string; phone: string }, session: SessionPayload | null): Promise<{ user: User; created: boolean }> {
  const phone = normPhone(d.phone);
  const email = d.email.toLowerCase();
  if (session?.role === "customer") {
    const u = await User.findByPk(session.uid);
    if (u) {
      if (!u.phone) await u.update({ phone });
      return { user: u, created: false };
    }
  }
  const byPhone = await User.findOne({ where: { role: "customer", phone } });
  if (byPhone) return { user: byPhone, created: false };
  const byEmail = await User.findOne({ where: { email } });
  if (byEmail) {
    if (byEmail.role !== "customer") throw new QuoteError("This email belongs to a Loky staff or partner account. Use a different email for the quotation.");
    if (!byEmail.phone) await byEmail.update({ phone });
    return { user: byEmail, created: false };
  }
  const user = await User.create({
    role: "customer",
    username: phone,
    email,
    phone,
    name: d.name,
    passwordHash: await hashPassword(temporaryPassword(16)),
    lastLoginAt: null,
  });
  return { user, created: true };
}

async function nextNumber(): Promise<string> {
  const ym = new Date().toISOString().slice(2, 7).replace("-", "");
  const n = (await CustomerQuotation.count()) + 1;
  return `LKY-Q${ym}-${String(n).padStart(4, "0")}`;
}

export async function createQuotation(d: { name: string; email: string; phone: string; company?: string; months: number; slotSeconds: number; codes: string[] }, session: SessionPayload | null) {
  const lines = await quoteLines(d.codes, d.months, d.slotSeconds);
  if (!lines.length) throw new QuoteError("None of the selected billboards has rates for that slot length yet.");
  const { user, created } = await ensureCustomer(d, session);
  const t = totals(lines);
  const quotation = await sequelize.transaction(async (tx) => {
    let number = await nextNumber();
    while (await CustomerQuotation.findOne({ where: { number }, transaction: tx })) number = `${number}-${randomInt(10, 99)}`;
    const q = await CustomerQuotation.create(
      {
        number,
        userId: user.id,
        shareToken: randomBytes(18).toString("base64url"),
        clientName: d.name.trim(),
        clientEmail: d.email.toLowerCase(),
        clientPhone: normPhone(d.phone),
        company: d.company?.trim() || null,
        city: lines[0].city,
        months: d.months,
        slotSeconds: d.slotSeconds,
        package: packageForMonths(d.months),
        subtotal: t.subtotal,
        gstPct: GST_PCT,
        gstAmount: t.gstAmount,
        total: t.total,
        validUntil: new Date(Date.now() + QUOTE_VALID_DAYS * 86_400_000),
      },
      { transaction: tx },
    );
    await CustomerQuotationItem.bulkCreate(
      lines.map((l, i) => ({ quotationId: q.id, billboardId: l.billboardId, sortOrder: i, listPerMonth: l.listPerMonth, netPerMonth: l.netPerMonth, months: l.months, lineTotal: l.lineTotal })),
      { transaction: tx },
    );
    return q;
  });
  return { quotation, user, created };
}

const ITEM_INCLUDE = [{ model: CustomerQuotationItem, as: "items", include: [{ model: Billboard, as: "billboard", include: [{ association: "media", include: ["file"] }, { association: "category" }] }] }];

export async function listMyQuotations(userId: number) {
  const rows = await CustomerQuotation.findAll({ where: { userId }, include: ITEM_INCLUDE, order: [["createdAt", "DESC"]] });
  return rows.map(withStatus);
}

export async function getMyQuotation(userId: number, id: number) {
  const q = await CustomerQuotation.findOne({ where: { id, userId }, include: ITEM_INCLUDE, order: [[{ model: CustomerQuotationItem, as: "items" }, "sortOrder", "ASC"]] });
  return q ? withStatus(q) : null;
}

export async function getQuotationByToken(token: string) {
  const q = await CustomerQuotation.findOne({ where: { shareToken: token }, include: ITEM_INCLUDE, order: [[{ model: CustomerQuotationItem, as: "items" }, "sortOrder", "ASC"]] });
  return q ? withStatus(q) : null;
}

export type QuotationView = CustomerQuotation & { status: QuoteStatus };

/** Expiry is derived at read time so nothing has to run on a schedule. */
function withStatus(q: CustomerQuotation): QuotationView {
  if (q.status === "active" && q.validUntil < new Date()) q.status = "expired";
  return q as QuotationView;
}

/* ---------- mobile OTP login for customers (code shown on screen until an SMS provider exists) ---------- */

export async function issueCustomerOtp(userId: number): Promise<string> {
  const code = String(randomInt(100000, 999999));
  await OtpCode.update({ consumedAt: new Date() }, { where: { userId, consumedAt: null } });
  await OtpCode.create({ userId, channel: "mobile", code, expiresAt: new Date(Date.now() + 10 * 60_000), consumedAt: null });
  return code;
}

export async function findCustomerByPhone(phone: string): Promise<User | null> {
  return User.findOne({ where: { role: "customer", phone: normPhone(phone), status: "active" } });
}

export async function verifyCustomerOtp(userId: number, code: string): Promise<SessionPayload> {
  const otp = await OtpCode.findOne({ where: { userId, consumedAt: null }, order: [["createdAt", "DESC"]] });
  if (!otp || otp.code !== code.trim()) throw new QuoteError("That code is not right. Check the latest code and try again.");
  if (otp.expiresAt < new Date()) throw new QuoteError("This code has expired. Request a new one.");
  const u = await User.findByPk(userId);
  if (!u || u.role !== "customer" || u.status !== "active") throw new QuoteError("This login is not available.");
  await otp.update({ consumedAt: new Date() });
  await u.update({ lastLoginAt: new Date() });
  return { uid: u.id, role: "customer", name: u.name };
}
