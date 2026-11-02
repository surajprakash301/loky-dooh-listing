"use server";

import { revalidatePath } from "next/cache";
import { Billboard, TIERS, type LiveStatus, type Tier } from "@/db";
import { assertRole } from "@/lib/server/auth";
import * as auth from "@/services/auth";
import * as review from "@/services/review";
import { type ActionState, messageOf, str } from "./types";

async function refreshPublic(vendorId: number) {
  revalidatePath("/admin/vendors", "layout");
  revalidatePath(`/rep/onboard/${vendorId}`, "layout");
  revalidatePath("/rep");
  revalidatePath("/vendor", "layout");
  revalidatePath("/");
  revalidatePath("/listing");
  for (const b of await Billboard.findAll({ where: { vendorId }, attributes: ["code"] })) revalidatePath(`/billboard/${b.code}`);
}

export async function approveSectionAction(vendorId: number, reviewSectionId: number, _: ActionState, __: FormData): Promise<ActionState> {
  const s = await assertRole("admin");
  try {
    await review.approveSection(reviewSectionId, s.uid);
    await refreshPublic(vendorId);
    return { ok: true };
  } catch (e) {
    return { error: messageOf(e) };
  }
}

export async function requestChangesAction(vendorId: number, reviewSectionId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("admin");
  try {
    await review.requestChanges(reviewSectionId, s.uid, str(fd, "remark"));
    await refreshPublic(vendorId);
    return { ok: true };
  } catch (e) {
    return { error: messageOf(e) };
  }
}

export async function rejectVendorAction(vendorId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("admin");
  try {
    await review.rejectVendor(vendorId, s.uid, str(fd, "reason"));
    await refreshPublic(vendorId);
    return { ok: true };
  } catch (e) {
    return { error: messageOf(e) };
  }
}

export async function setTierAction(vendorId: number, billboardId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await assertRole("admin");
  const tier = str(fd, "tier") as Tier;
  if (!TIERS.includes(tier)) return { error: "Pick a tier" };
  await review.setBillboardTier(billboardId, tier);
  await refreshPublic(vendorId);
  return { ok: true };
}

export async function adminLiveStatusAction(vendorId: number, billboardId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await assertRole("admin");
  try {
    await review.setLiveStatus(billboardId, str(fd, "liveStatus") as LiveStatus);
    await refreshPublic(vendorId);
    return { ok: true };
  } catch (e) {
    return { error: messageOf(e) };
  }
}

export async function resetVendorPasswordAction(vendorId: number, _: ActionState, __: FormData): Promise<ActionState<{ username: string; password: string }>> {
  const s = await assertRole("admin");
  try {
    const creds = await auth.resetVendorPassword(vendorId, s.uid);
    revalidatePath(`/admin/vendors/${vendorId}`);
    return { ok: true, data: creds };
  } catch (e) {
    return { error: messageOf(e) };
  }
}
