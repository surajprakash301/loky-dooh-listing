"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DocType, MediaKind } from "@/db";
import { assertRole } from "@/lib/server/auth";
import {
  bankSchema,
  billboardSchema,
  businessSchema,
  contactsSchema,
  fieldErrors,
  pricingRowSchema,
  type PricingRowInput,
} from "@/lib/validation";
import { hasFile, storeUpload } from "@/services/files";
import * as ob from "@/services/onboarding";
import { type ActionState, failed, messageOf, str, toObject } from "./types";

const page = (vendorId: number) => `/rep/onboard/${vendorId}`;

function refresh(vendorId: number) {
  revalidatePath(page(vendorId), "layout");
  revalidatePath("/rep");
}

export async function createDraftAction() {
  const s = await assertRole("representative");
  const v = await ob.createDraft(s.uid);
  redirect(`${page(v.id)}/business`);
}

export async function saveBusinessAction(vendorId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("representative");
  const parsed = businessSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    const logo = fd.get("logo");
    const logoId = hasFile(logo) ? (await storeUpload(logo, s.uid, { public: true })).id : undefined;
    await ob.saveBusiness(vendorId, s.uid, parsed.data, logoId);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh(vendorId);
  redirect(`${page(vendorId)}/contacts?saved=business`);
}

export async function saveContactsAction(vendorId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("representative");
  const o = toObject(fd);
  const parsed = contactsSchema.safeParse({
    primary: { name: o["primary.name"], designation: o["primary.designation"], phone: o["primary.phone"], email: o["primary.email"] },
    secondary: { name: o["secondary.name"], designation: o["secondary.designation"], phone: o["secondary.phone"], email: o["secondary.email"] },
  });
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    await ob.saveContacts(vendorId, s.uid, parsed.data);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh(vendorId);
  redirect(`${page(vendorId)}/documents?saved=contacts`);
}

export async function saveDocumentsAction(vendorId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("representative");
  const errors: Record<string, string> = {};
  const docs: { docType: DocType; fileId: number; docNumber?: string }[] = [];
  try {
    for (const docType of ["gst_certificate", "pan_card", "cancelled_cheque", "agreement", "other"] as DocType[]) {
      const f = fd.get(docType);
      if (!hasFile(f)) continue;
      const stored = await storeUpload(f, s.uid, { public: false });
      docs.push({ docType, fileId: stored.id, docNumber: str(fd, `${docType}_number`) || undefined });
    }
    if (docs.length) await ob.saveDocuments(vendorId, s.uid, docs);
    const v = await ob.loadVendorForRep(vendorId, s.uid);
    const have = new Set((v.documents ?? []).map((d) => d.docType));
    for (const d of ob.REQUIRED_DOCS) if (!have.has(d)) errors[d] = `${ob.DOC_LABEL[d]} is required`;
    if (Object.keys(errors).length) return failed(fd, errors, "Upload every required document before continuing");
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh(vendorId);
  redirect(`${page(vendorId)}/bank?saved=documents`);
}

export async function saveBankAction(vendorId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("representative");
  const parsed = bankSchema.safeParse(toObject(fd));
  if (!parsed.success) return failed(fd, fieldErrors(parsed.error));
  try {
    await ob.saveBank(vendorId, s.uid, parsed.data);
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  refresh(vendorId);
  redirect(`${page(vendorId)}/billboards?saved=bank`);
}

export async function saveBillboardAction(vendorId: number, billboardId: number | null, _: ActionState, fd: FormData): Promise<ActionState> {
  const s = await assertRole("representative");
  const o = toObject(fd);
  const parsed = billboardSchema.safeParse({ ...o, lokySense: o.lokySense === "on" || o.lokySense === "true" });
  const errors = parsed.success ? {} : fieldErrors(parsed.error);

  let pricing: PricingRowInput[] = [];
  try {
    const raw = JSON.parse(str(fd, "pricing") || "[]") as unknown[];
    pricing = raw.map((r, i) => {
      const p = pricingRowSchema.safeParse(r);
      if (!p.success) errors[`pricing.${i}`] = Object.values(fieldErrors(p.error))[0];
      return p.success ? p.data : null;
    }).filter((p): p is PricingRowInput => !!p);
    for (const [i, p] of pricing.entries()) if (p.offerPrice > p.listPrice) errors[`pricing.${i}`] = "Offer price cannot exceed list price";
  } catch {
    errors.pricing = "Pricing rows are invalid";
  }
  if (!pricing.length && !errors.pricing) errors.pricing = "Add at least one pricing row";
  if (Object.keys(errors).length || !parsed.success) return failed(fd, errors, "Fix the highlighted fields");

  let target: string;
  try {
    const media: { fileId: number; kind: MediaKind }[] = [];
    for (const [field, kind] of [["day_photos", "day_photo"], ["night_photos", "night_photo"], ["traffic_video", "traffic_video"]] as const) {
      for (const f of fd.getAll(field)) if (hasFile(f)) media.push({ fileId: (await storeUpload(f, s.uid, { public: true })).id, kind });
    }
    const remove = fd.getAll("remove_media").map(Number).filter((n) => Number.isInteger(n) && n > 0);
    const b = await ob.upsertBillboard(vendorId, s.uid, billboardId, parsed.data, pricing, media, remove);
    const problems = ob.billboardProblems((await ob.loadVendorForRep(vendorId, s.uid)).billboards!.find((x) => x.id === b.id)!);
    refresh(vendorId);
    // Saved but not yet submittable: land on the saved record (never back on /new) with the gaps spelled out.
    target = problems.length ? `${page(vendorId)}/billboards/${b.id}?warn=${encodeURIComponent(problems.join(" and "))}` : `${page(vendorId)}/billboards?saved=billboard`;
  } catch (e) {
    return failed(fd, undefined, messageOf(e));
  }
  redirect(target);
}

export async function deleteBillboardAction(vendorId: number, billboardId: number) {
  const s = await assertRole("representative");
  await ob.deleteBillboard(vendorId, s.uid, billboardId);
  refresh(vendorId);
  redirect(`${page(vendorId)}/billboards`);
}

export async function submitAction(vendorId: number, _: ActionState, __: FormData): Promise<ActionState<ob.IssuedCredentials>> {
  const s = await assertRole("representative");
  try {
    const creds = await ob.submit(vendorId, s.uid);
    refresh(vendorId);
    revalidatePath("/admin/vendors");
    return { ok: true, data: creds };
  } catch (e) {
    return { error: messageOf(e) };
  }
}

export async function resubmitAction(vendorId: number, _: ActionState, __: FormData): Promise<ActionState<ob.IssuedCredentials>> {
  const s = await assertRole("representative");
  try {
    await ob.resubmit(vendorId, s.uid);
  } catch (e) {
    return { error: messageOf(e) };
  }
  refresh(vendorId);
  revalidatePath("/admin/vendors");
  return { ok: true };
}

export async function submitNewBillboardAction(vendorId: number, billboardId: number, _: ActionState, __: FormData): Promise<ActionState> {
  const s = await assertRole("representative");
  try {
    await ob.submitNewBillboard(vendorId, s.uid, billboardId);
  } catch (e) {
    return { error: messageOf(e) };
  }
  refresh(vendorId);
  revalidatePath("/admin/vendors");
  redirect(`${page(vendorId)}/billboards?saved=submitted`);
}
