import { randomBytes } from "node:crypto";
import { Op } from "sequelize";
import {
  Agency, Billboard, BillboardMedia, BillboardSlotPricing, Brand, Campaign, CampaignScreen, Category, Coupon, File as FileRow, Payment, Proposal, ProposalFile, ProposalItem, Quotation, QuotationItem, User, Vendor, WalletTransaction, sequelize,
  type Package,
} from "@/db";
import { ADDON_CREATIVE_CHARGE, BRAND_LOCK_DAYS, EMI_MONTHS, EMI_UPFRONT_PCT, FIRST_ORDER_BONUS, LEVEL2_COMMISSION_BOOST, PACKAGE_MONTHS, UPFRONT_CASHBACK_PCT } from "@/lib/domain";
import type { ProposalInput, QuotationInput } from "@/lib/validation";
import { AgencyError, logActivity } from "./agency";

const token = () => randomBytes(12).toString("base64url");

const SCREEN_INCLUDE = [
  { model: Category, as: "category" },
  { model: Vendor, as: "vendor", attributes: ["id", "tradeName"] },
  { model: BillboardMedia, as: "media", include: [{ model: FileRow, as: "file" }] },
  { model: BillboardSlotPricing, as: "pricing", where: { isActive: true }, required: false },
];

async function approvedScreens(ids: number[]) {
  const rows = await Billboard.findAll({ where: { id: ids, status: "approved" }, include: SCREEN_INCLUDE });
  if (rows.length !== new Set(ids).size) throw new AgencyError("One of the selected screens is no longer live");
  return rows;
}

/* ================= proposals (Phase 3: no pricing) ================= */

export const PROPOSAL_INCLUDE = [
  { model: Brand, as: "brand", include: [{ model: FileRow, as: "logo" }] },
  { model: Agency, as: "agency", include: [{ model: FileRow, as: "logo" }] },
  { model: ProposalItem, as: "items", include: [{ model: Billboard, as: "billboard", include: SCREEN_INCLUDE }] },
  { model: ProposalFile, as: "files", include: [{ model: FileRow, as: "file" }] },
];

export async function createProposal(agencyId: number, actorId: number, d: ProposalInput, fileIds: number[]) {
  const brand = await Brand.findOne({ where: { id: d.brandId, agencyId } });
  if (!brand) throw new AgencyError("Brand not found");
  const screens = await approvedScreens(d.billboardIds);
  return sequelize.transaction(async (t) => {
    const p = await Proposal.create({ agencyId, brandId: brand.id, createdBy: actorId, title: d.title, theme: d.theme, objective: d.objective ?? null, status: "ready", shareToken: token() }, { transaction: t });
    for (const [i, b] of screens.entries()) await ProposalItem.create({ proposalId: p.id, billboardId: b.id, sortOrder: i }, { transaction: t });
    for (const fileId of fileIds) await ProposalFile.create({ proposalId: p.id, fileId }, { transaction: t });
    if (brand.status === "upcoming") await brand.update({ status: "active" }, { transaction: t });
    await logActivity(agencyId, actorId, "proposal_created", `Visual proposal "${d.title}" generated for ${brand.name} (${screens.length} screens)`, t);
    return p;
  });
}

export async function listProposals(agencyId: number) {
  return Proposal.findAll({ where: { agencyId }, include: [{ model: Brand, as: "brand" }, { model: ProposalItem, as: "items" }], order: [["createdAt", "DESC"]] });
}

export async function loadProposal(agencyId: number, id: number) {
  const p = await Proposal.findOne({ where: { id, agencyId }, include: PROPOSAL_INCLUDE, order: [[{ model: ProposalItem, as: "items" }, "sortOrder", "ASC"]] });
  if (!p) throw new AgencyError("Proposal not found");
  return p;
}

/** Public pitch page: counts a view each time it is opened by someone other than the agency. */
export async function openSharedProposal(shareToken: string, countView: boolean) {
  const p = await Proposal.findOne({ where: { shareToken }, include: PROPOSAL_INCLUDE, order: [[{ model: ProposalItem, as: "items" }, "sortOrder", "ASC"]] });
  if (!p) return null;
  if (countView) {
    await p.increment("viewCount");
    if (p.status === "ready") await p.update({ status: "sent" });
  }
  return p;
}

/* ================= quotations (Phase 4) ================= */

export type PricingLine = { billboardId: number; name: string; code: string; listPrice: number; offerPrice: number };
export type Totals = { lines: PricingLine[]; baseCost: number; couponDiscount: number; marginAmount: number; addonAmount: number; total: number; emi: number[]; coupon: Coupon | null; couponError: string | null };

export async function findCoupon(code: string | undefined): Promise<{ coupon: Coupon | null; error: string | null }> {
  if (!code) return { coupon: null, error: null };
  const c = await Coupon.findOne({ where: { code } });
  if (!c || !c.isActive || (c.expiresAt && c.expiresAt < new Date())) return { coupon: null, error: "This coupon is not valid" };
  return { coupon: c, error: null };
}

/** The dynamic pricing matrix from the Phase 4 board. Base cost = sum of the chosen slot/package offer price per screen. */
export async function computeTotals(d: Pick<QuotationInput, "billboardIds" | "slotSeconds" | "package" | "couponCode" | "marginPct" | "addonCreatives" | "emiEnabled">): Promise<Totals> {
  const screens = await approvedScreens(d.billboardIds);
  const lines: PricingLine[] = screens.map((b) => {
    const row = (b.pricing ?? []).find((p) => p.slotSeconds === d.slotSeconds && p.package === d.package);
    if (!row) throw new AgencyError(`${b.name} has no ${d.slotSeconds}s / ${d.package} rate`);
    return { billboardId: b.id, name: b.name, code: b.code, listPrice: Number(row.listPrice), offerPrice: Number(row.offerPrice) };
  });
  const baseCost = lines.reduce((s, l) => s + l.offerPrice, 0);
  const { coupon, error } = await findCoupon(d.couponCode);
  const couponDiscount = coupon ? Math.min(baseCost, coupon.type === "flat" ? Number(coupon.value) : (baseCost * Number(coupon.value)) / 100) : 0;
  const marginAmount = Math.round(((baseCost - couponDiscount) * d.marginPct) / 100);
  const addonAmount = d.addonCreatives ? ADDON_CREATIVE_CHARGE : 0;
  const total = Math.round(baseCost - couponDiscount + marginAmount + addonAmount);
  const emi = d.emiEnabled ? Array.from({ length: EMI_MONTHS }, () => Math.round(total / EMI_MONTHS)) : [];
  return { lines, baseCost, couponDiscount, marginAmount, addonAmount, total, emi, coupon, couponError: error };
}

export async function createQuotation(agencyId: number, actorId: number, d: QuotationInput) {
  const brand = await Brand.findOne({ where: { id: d.brandId, agencyId } });
  if (!brand) throw new AgencyError("Brand not found");
  if (brand.lockedUntil && brand.lockedUntil > new Date() && brand.agencyId !== agencyId) throw new AgencyError("This brand is locked to another agency's pitch");
  const totals = await computeTotals(d);
  if (totals.couponError) throw new AgencyError(totals.couponError);
  return sequelize.transaction(async (t) => {
    const lockUntil = new Date(Date.now() + BRAND_LOCK_DAYS * 86_400_000);
    const q = await Quotation.create({
      agencyId, brandId: brand.id, proposalId: d.proposalId ?? null, createdBy: actorId, title: d.title, status: "draft", shareToken: token(), layout: d.layout,
      slotSeconds: d.slotSeconds, package: d.package, baseCost: totals.baseCost, couponId: totals.coupon?.id ?? null, couponDiscount: totals.couponDiscount,
      marginPct: d.marginPct, marginAmount: totals.marginAmount, addonCreatives: d.addonCreatives, addonAmount: totals.addonAmount, total: totals.total, emiEnabled: d.emiEnabled, lockUntil,
    }, { transaction: t });
    for (const l of totals.lines) await QuotationItem.create({ quotationId: q.id, billboardId: l.billboardId, listPrice: l.listPrice, offerPrice: l.offerPrice }, { transaction: t });
    await brand.update({ lockedUntil: lockUntil }, { transaction: t });
    await logActivity(agencyId, actorId, "quotation_created", `Quotation "${d.title}" for ${brand.name}: ₹${totals.total.toLocaleString("en-IN")} (brand locked ${BRAND_LOCK_DAYS} days)`, t);
    return q;
  });
}

export const QUOTATION_INCLUDE = [
  { model: Brand, as: "brand", include: [{ model: FileRow, as: "logo" }] },
  { model: Agency, as: "agency", include: [{ model: FileRow, as: "logo" }] },
  { model: Coupon, as: "coupon" },
  { model: QuotationItem, as: "items", include: [{ model: Billboard, as: "billboard", include: SCREEN_INCLUDE }] },
  { model: Campaign, as: "campaign" },
];

export async function listQuotations(agencyId: number) {
  return Quotation.findAll({ where: { agencyId }, include: [{ model: Brand, as: "brand" }, { model: Campaign, as: "campaign", attributes: ["id", "status"] }], order: [["createdAt", "DESC"]] });
}

export async function loadQuotation(agencyId: number, id: number) {
  const q = await Quotation.findOne({ where: { id, agencyId }, include: QUOTATION_INCLUDE });
  if (!q) throw new AgencyError("Quotation not found");
  return q;
}

export async function openSharedQuotation(shareToken: string, countView: boolean) {
  const q = await Quotation.findOne({ where: { shareToken }, include: QUOTATION_INCLUDE });
  if (!q) return null;
  if (countView) { await q.increment("viewCount"); if (q.status === "draft") await q.update({ status: "sent" }); }
  return q;
}

/* ================= campaigns / media orders (Phase 5) ================= */

function addDays(iso: string, days: number) { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
function addMonths(iso: string, months: number) { const d = new Date(iso + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + months); return d.toISOString().slice(0, 10); }

/** "Lock Campaign & Proceed to Payment": creates the work order and its payment schedule. */
export async function lockCampaign(agencyId: number, actorId: number, quotationId: number, d: { paymentPath: "upfront" | "emi"; startDate: string }) {
  const q = await loadQuotation(agencyId, quotationId);
  if (q.campaign) throw new AgencyError("A work order already exists for this quotation");
  const total = Number(q.total);
  const upfront = d.paymentPath === "upfront" ? total : Math.round((total * EMI_UPFRONT_PCT) / 100);
  const months = PACKAGE_MONTHS[q.package as Package];
  const endDate = q.package === "day" ? d.startDate : addMonths(d.startDate, months);
  return sequelize.transaction(async (t) => {
    const n = (await Campaign.count({ transaction: t })) + 1;
    const c = await Campaign.create({
      agencyId, brandId: q.brandId, quotationId: q.id, workOrderNo: `WO-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`, title: q.title,
      paymentPath: d.paymentPath, total, upfrontRequired: upfront, slotSeconds: q.slotSeconds, package: q.package, startDate: d.startDate, endDate, agreementFileId: null, signedAt: null, confirmedAt: null, liveAt: null,
    }, { transaction: t });
    for (const it of q.items ?? []) await CampaignScreen.create({ campaignId: c.id, billboardId: it.billboardId, amount: Number(it.offerPrice) }, { transaction: t });
    if (d.paymentPath === "upfront") {
      await Payment.create({ campaignId: c.id, agencyId, kind: "full", installmentNo: 1, amount: total, dueDate: d.startDate }, { transaction: t });
    } else {
      await Payment.create({ campaignId: c.id, agencyId, kind: "upfront", installmentNo: 1, amount: upfront, dueDate: d.startDate }, { transaction: t });
      const rest = total - upfront; const per = Math.round(rest / EMI_MONTHS);
      for (let i = 1; i <= EMI_MONTHS; i++) await Payment.create({ campaignId: c.id, agencyId, kind: "emi", installmentNo: i, amount: i === EMI_MONTHS ? rest - per * (EMI_MONTHS - 1) : per, dueDate: addDays(d.startDate, 30 * i) }, { transaction: t });
    }
    await q.update({ status: "converted" }, { transaction: t });
    await logActivity(agencyId, actorId, "campaign_locked", `Work order ${c.workOrderNo} created for "${q.title}" (${d.paymentPath === "upfront" ? "100% upfront" : `${EMI_UPFRONT_PCT}% + ${EMI_MONTHS} EMIs`})`, t);
    return c;
  });
}

export const CAMPAIGN_INCLUDE = [
  { model: Brand, as: "brand" },
  { model: Quotation, as: "quotation", attributes: ["id", "shareToken", "marginAmount", "marginPct"] },
  { model: CampaignScreen, as: "screens", include: [{ model: Billboard, as: "billboard", include: SCREEN_INCLUDE }] },
  { model: Payment, as: "payments" },
  { model: FileRow, as: "agreement" },
];

export async function listCampaigns(agencyId: number) {
  return Campaign.findAll({ where: { agencyId }, include: [{ model: Brand, as: "brand" }, { model: CampaignScreen, as: "screens" }, { model: Payment, as: "payments" }], order: [["createdAt", "DESC"]] });
}

export async function loadCampaign(agencyId: number, id: number) {
  const c = await Campaign.findOne({ where: { id, agencyId }, include: CAMPAIGN_INCLUDE, order: [[{ model: Payment, as: "payments" }, "installmentNo", "ASC"], [{ model: Payment, as: "payments" }, "kind", "ASC"]] });
  if (!c) throw new AgencyError("Work order not found");
  return c;
}

/** Simulated gateway callback: marks one scheduled payment paid, then re-evaluates the campaign state (Stage 2 validation gateway). */
export async function recordPayment(agencyId: number, actorId: number, paymentId: number, method: string) {
  await sequelize.transaction(async (t) => {
    const p = await Payment.findOne({ where: { id: paymentId, agencyId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!p) throw new AgencyError("Payment not found");
    if (p.status === "paid") throw new AgencyError("Already paid");
    await p.update({ status: "paid", paidAt: new Date(), method, reference: `TXN${Date.now().toString(36).toUpperCase()}` }, { transaction: t });
    const c = await Campaign.findByPk(p.campaignId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!c) throw new AgencyError("Work order not found");
    const paid = Number(c.paidAmount) + Number(p.amount);
    const updates: Partial<{ paidAmount: number; status: "confirmed" | "active"; confirmedAt: Date; liveAt: Date }> = { paidAmount: paid };
    await logActivity(agencyId, actorId, "payment_received", `₹${Number(p.amount).toLocaleString("en-IN")} received for ${c.workOrderNo} (${p.kind}${p.kind === "emi" ? ` ${p.installmentNo}/${EMI_MONTHS}` : ""})`, t);
    if (c.status === "pending_payment" && paid >= Number(c.upfrontRequired)) {
      updates.status = "confirmed"; updates.confirmedAt = new Date();
      await logActivity(agencyId, actorId, "campaign_confirmed", `${c.workOrderNo} confirmed: screen loops locked, timeline updated`, t);
      const agency = await Agency.findByPk(agencyId, { transaction: t, lock: t.LOCK.UPDATE });
      if (agency) {
        // Gamified "First Order Rush": first confirmed order unlocks Level 2 (+2.5% commission, ₹2,500 wallet bonus).
        const prior = await Campaign.count({ where: { agencyId, status: ["confirmed", "active", "completed"], id: { [Op.ne]: c.id } }, transaction: t });
        if (prior === 0 && agency.level < 2) {
          const boosted = Number(agency.commissionPct) + LEVEL2_COMMISSION_BOOST;
          await agency.update({ level: 2, commissionPct: boosted }, { transaction: t });
          await WalletTransaction.create({ agencyId, kind: "bonus", amount: FIRST_ORDER_BONUS, note: "First Order Rush: Level 2 unlocked", campaignId: c.id }, { transaction: t });
          await logActivity(agencyId, actorId, "wallet_credit", `Level 2 unlocked: ₹${FIRST_ORDER_BONUS.toLocaleString("en-IN")} bonus credited, commission now ${boosted.toFixed(1)}%`, t);
        }
        if (c.paymentPath === "upfront") {
          const cashback = Math.round((Number(c.total) * UPFRONT_CASHBACK_PCT) / 100);
          await WalletTransaction.create({ agencyId, kind: "cashback", amount: cashback, note: `${UPFRONT_CASHBACK_PCT}% upfront-pay cashback on ${c.workOrderNo}`, campaignId: c.id }, { transaction: t });
          await logActivity(agencyId, actorId, "wallet_credit", `₹${cashback.toLocaleString("en-IN")} upfront cashback credited to Loky Wallet`, t);
        }
      }
    }
    await c.update(updates, { transaction: t });
  });
}

export async function signWorkOrder(agencyId: number, actorId: number, campaignId: number, agreementFileId: number | null) {
  const c = await Campaign.findOne({ where: { id: campaignId, agencyId } });
  if (!c) throw new AgencyError("Work order not found");
  if (c.status === "pending_payment") throw new AgencyError("Complete the upfront payment before signing");
  await sequelize.transaction(async (t) => {
    await c.update({ signedAt: new Date(), agreementFileId, status: c.status === "confirmed" ? "active" : c.status, liveAt: c.status === "confirmed" ? new Date() : c.liveAt }, { transaction: t });
    await logActivity(agencyId, actorId, "work_order_signed", `${c.workOrderNo} signed; campaign activated`, t);
    if (c.status === "active") await logActivity(agencyId, actorId, "campaign_live", `"${c.title}" is live on ${await CampaignScreen.count({ where: { campaignId }, transaction: t })} screens`, t);
  });
}

export async function paymentsLedger(agencyId: number) {
  const [payments, wallet] = await Promise.all([
    Payment.findAll({ where: { agencyId }, include: [{ model: Campaign, as: "campaign", include: [{ model: Brand, as: "brand", attributes: ["name"] }] }], order: [["dueDate", "ASC"], ["installmentNo", "ASC"]] }),
    WalletTransaction.findAll({ where: { agencyId }, order: [["createdAt", "DESC"]] }),
  ]);
  return { payments, wallet, walletBalance: wallet.reduce((s, w) => s + Number(w.amount), 0) };
}

/** Vendor-side view: confirmed/active campaign screens on a vendor's billboards (used by the vendor console). */
export async function vendorBookings(vendorId: number) {
  return CampaignScreen.findAll({
    include: [
      { model: Billboard, as: "billboard", where: { vendorId }, attributes: ["id", "code", "name"] },
      { model: Campaign, as: "campaign", where: { status: ["confirmed", "active"] }, include: [{ model: Brand, as: "brand", attributes: ["name"] }, { model: Agency, as: "agency", attributes: ["legalName"] }] },
    ],
  });
}

export { User };
