"use server";

import { revalidatePath } from "next/cache";
import { Agency, Coupon } from "@/db";
import { assertRole } from "@/lib/server/auth";
import { couponSchema, fieldErrors } from "@/lib/validation";
import { logActivity } from "@/services/agency";
import { type ActionState, failed, messageOf, str, toObject } from "./types";

export async function createCouponAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await assertRole("admin");
  const parsed = couponSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    if (await Coupon.findOne({ where: { code: parsed.data.code } })) return failed(fd, { code: "This code already exists" });
    await Coupon.create({ code: parsed.data.code, type: parsed.data.type, value: parsed.data.value, description: parsed.data.description ?? null, expiresAt: null });
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
}

export async function toggleCouponAction(id: number): Promise<void> {
  await assertRole("admin");
  const c = await Coupon.findByPk(id);
  if (c) await c.update({ isActive: !c.isActive });
  revalidatePath("/admin/coupons");
}

export async function setAgencyCommissionAction(agencyId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("admin");
  const pct = Number(str(fd, "commissionPct"));
  if (!(pct >= 5 && pct <= 15)) return { error: "Commission must be between 5% and 15%" };
  const a = await Agency.findByPk(agencyId);
  if (!a) return { error: "Agency not found" };
  await a.update({ commissionPct: pct });
  await logActivity(agencyId, s.uid, "assessment_completed", `Loky admin set base commission to ${pct}%`);
  revalidatePath("/admin/agencies", "layout");
  revalidatePath("/agency", "layout");
  return { ok: true };
}

export async function setAgencyStatusAction(agencyId: number, status: "partner" | "suspended"): Promise<void> {
  await assertRole("admin");
  const a = await Agency.findByPk(agencyId);
  if (a) await a.update({ status });
  revalidatePath("/admin/agencies", "layout");
  revalidatePath("/agency", "layout");
}
