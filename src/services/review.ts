import { Op, type Transaction } from "sequelize";
import {
  Billboard,
  OnboardingEvent,
  ReviewSection,
  User,
  Vendor,
  sequelize,
  type Tier,
  type VendorStatus,
} from "@/db";
import { loadVendor } from "./onboarding";

export class ReviewError extends Error {}

export type QueueTab = "pending" | "approved" | "rejected";

/** Pending = vendor under review, or an approved vendor with a new billboard waiting. */
function queueWhere(tab: QueueTab) {
  return tab === "pending"
    ? {
        [Op.or]: [
          { status: ["pending", "changes_requested"] as VendorStatus[] },
          { id: { [Op.in]: sequelize.literal("(SELECT vendor_id FROM review_sections WHERE status = 'pending')") } },
        ],
      }
    : { status: tab };
}

export async function listQueue(tab: QueueTab) {
  return Vendor.findAll({
    where: queueWhere(tab),
    include: [
      { model: User, as: "representative", attributes: ["id", "name"] },
      { model: Billboard, as: "billboards", attributes: ["id", "status"] },
      { model: ReviewSection, as: "reviewSections", attributes: ["id", "status", "round"] },
    ],
    order: [["submittedAt", "ASC"], ["updatedAt", "DESC"]],
  });
}

export async function queueCounts(): Promise<Record<QueueTab, number>> {
  const [pending, approved, rejected] = await Promise.all([
    Vendor.count({ where: queueWhere("pending") }),
    Vendor.count({ where: queueWhere("approved") }),
    Vendor.count({ where: queueWhere("rejected") }),
  ]);
  return { pending, approved, rejected };
}

async function finalizeIfComplete(vendorId: number, adminId: number, t: Transaction) {
  const v = await Vendor.findByPk(vendorId, { transaction: t, lock: t.LOCK.UPDATE });
  if (!v || v.status === "approved" || v.status === "rejected") return;
  const open = await ReviewSection.count({ where: { vendorId, status: { [Op.ne]: "approved" } }, transaction: t });
  if (open > 0) return;
  await v.update({ status: "approved", approvedAt: new Date(), approvedBy: adminId }, { transaction: t });
  await OnboardingEvent.create({ vendorId, actorId: adminId, action: "vendor_approved" } as never, { transaction: t });
}

export async function approveSection(reviewSectionId: number, adminId: number) {
  await sequelize.transaction(async (t) => {
    const r = await ReviewSection.findByPk(reviewSectionId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!r) throw new ReviewError("Section not found");
    if (r.status !== "pending") throw new ReviewError("Only a pending section can be approved");
    await r.update({ status: "approved", remark: null, reviewedBy: adminId, reviewedAt: new Date() }, { transaction: t });
    if (r.billboardId) {
      // A billboard goes live as soon as its own section is approved and the vendor is (or becomes) approved.
      await Billboard.update({ status: "approved", liveStatus: "live" }, { where: { id: r.billboardId }, transaction: t });
    }
    await OnboardingEvent.create(
      { vendorId: r.vendorId, actorId: adminId, action: "section_approved", section: r.section, billboardId: r.billboardId } as never,
      { transaction: t },
    );
    await finalizeIfComplete(r.vendorId, adminId, t);
  });
}

export async function requestChanges(reviewSectionId: number, adminId: number, remark: string) {
  if (remark.trim().length < 10) throw new ReviewError("Write a remark of at least 10 characters so the representative knows what to fix");
  await sequelize.transaction(async (t) => {
    const r = await ReviewSection.findByPk(reviewSectionId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!r) throw new ReviewError("Section not found");
    if (r.status !== "pending") throw new ReviewError("Only a pending section can be sent back");
    await r.update({ status: "changes_requested", remark: remark.trim(), reviewedBy: adminId, reviewedAt: new Date() }, { transaction: t });
    if (r.billboardId) await Billboard.update({ status: "changes_requested" }, { where: { id: r.billboardId }, transaction: t });
    const v = await Vendor.findByPk(r.vendorId, { transaction: t, lock: t.LOCK.UPDATE });
    if (v && v.status !== "approved") await v.update({ status: "changes_requested" }, { transaction: t });
    await OnboardingEvent.create(
      { vendorId: r.vendorId, actorId: adminId, action: "changes_requested", section: r.section, billboardId: r.billboardId, remark: remark.trim() } as never,
      { transaction: t },
    );
  });
}

export async function rejectVendor(vendorId: number, adminId: number, reason: string) {
  if (reason.trim().length < 10) throw new ReviewError("Give a reason of at least 10 characters");
  await sequelize.transaction(async (t) => {
    const v = await Vendor.findByPk(vendorId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!v) throw new ReviewError("Vendor not found");
    if (!(v.status === "pending" || v.status === "changes_requested")) throw new ReviewError("Only a vendor under review can be rejected");
    await v.update({ status: "rejected", rejectionReason: reason.trim() }, { transaction: t });
    await Billboard.update({ status: "rejected", liveStatus: null }, { where: { vendorId }, transaction: t });
    if (v.userId) await User.update({ status: "disabled" }, { where: { id: v.userId }, transaction: t });
    await OnboardingEvent.create({ vendorId, actorId: adminId, action: "vendor_rejected", remark: reason.trim() } as never, { transaction: t });
  });
}

export async function setBillboardTier(billboardId: number, tier: Tier) {
  await Billboard.update({ tier }, { where: { id: billboardId } });
}

export async function setLiveStatus(billboardId: number, liveStatus: "live" | "offline" | "maintenance" | "limited", vendorId?: number) {
  const where = vendorId ? { id: billboardId, vendorId, status: "approved" } : { id: billboardId, status: "approved" };
  const [n] = await Billboard.update({ liveStatus }, { where });
  if (!n) throw new ReviewError("Billboard not found or not approved");
}

export { loadVendor };
