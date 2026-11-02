"use server";

import { revalidatePath } from "next/cache";
import { Billboard, type LiveStatus } from "@/db";
import { assertRole } from "@/lib/server/auth";
import * as review from "@/services/review";
import { type ActionState, messageOf, str } from "./types";

export async function vendorLiveStatusAction(billboardId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("vendor");
  if (!s.vendorId) return { error: "No vendor linked to this login" };
  try {
    await review.setLiveStatus(billboardId, str(fd, "liveStatus") as LiveStatus, s.vendorId);
    revalidatePath("/vendor", "layout");
    revalidatePath("/listing");
    const b = await Billboard.findByPk(billboardId, { attributes: ["code"] });
    if (b) revalidatePath(`/billboard/${b.code}`);
    return { ok: true };
  } catch (e) {
    return { error: messageOf(e) };
  }
}
