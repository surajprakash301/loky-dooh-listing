"use server";

import { revalidatePath } from "next/cache";
import { Voucher } from "@/db";
import { assertRole } from "@/lib/server/auth";
import { fieldErrors, voucherSchema } from "@/lib/validation";
import { type ActionState, failed, messageOf, toObject } from "./types";

function refresh() {
  revalidatePath("/admin/vouchers");
  revalidatePath("/quote/new");
}

export async function createVoucherAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertRole("admin");
    const parsed = voucherSchema.safeParse(toObject(fd));
    if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
    await Voucher.create({ title: parsed.data.title, subtitle: parsed.data.subtitle ?? null, discountPct: parsed.data.discountPct });
    refresh();
    return { ok: true };
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
}

export async function toggleVoucherAction(id: number): Promise<void> {
  await assertRole("admin");
  const v = await Voucher.findByPk(id);
  if (v) await v.update({ isActive: !v.isActive });
  refresh();
}

/** Removes the voucher. Quotations that used it keep their frozen title and discount. */
export async function deleteVoucherAction(id: number): Promise<void> {
  await assertRole("admin");
  await Voucher.destroy({ where: { id } });
  refresh();
}
