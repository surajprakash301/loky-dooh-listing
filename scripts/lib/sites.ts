/* Loads the real Loky Media network (scripts/data/lokymedia-sites.json, written by import-lokymedia.ts)
   into the billboards tables, and removes every billboard that is not part of it. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Op } from "sequelize";
import { Billboard, BillboardMedia, BillboardSlotPricing, Category, File as FileRow, OnboardingEvent, ReviewSection, sequelize } from "../../src/db/models";
import { CampaignScreen, ProposalItem, QuotationItem } from "../../src/db/agency-models";
import { CustomerQuotation, CustomerQuotationItem } from "../../src/db/quote-models";
import type { SiteRecord } from "../import-lokymedia";

export async function loadSites(): Promise<SiteRecord[]> {
  const raw = await readFile(path.join(process.cwd(), "scripts/data/lokymedia-sites.json"), "utf8");
  return (JSON.parse(raw) as { sites: SiteRecord[] }).sites;
}

async function staticFile(url: string, uploadedBy: number) {
  const key = `static:${url}`;
  const [row] = await FileRow.findOrCreate({
    where: { storageKey: key },
    defaults: { storageKey: key, publicUrl: url, originalName: url.split("/").pop()!, mimeType: /\.mp4$/i.test(url) ? "video/mp4" : "image/jpeg", sizeBytes: 0, uploadedBy },
  });
  return row;
}

/** Per-month equivalents of the website's rates for the site's own slot length. No invented discounts: list = net. */
function pricingRows(s: SiteRecord) {
  const rows: { slotSeconds: number; package: "day" | "month" | "quarter"; listPrice: number; offerPrice: number }[] = [];
  const p = s.pricing;
  if (p.perDay) rows.push({ slotSeconds: s.slotSeconds, package: "day", listPrice: p.perDay, offerPrice: p.perDay });
  if (p.perMonth) rows.push({ slotSeconds: s.slotSeconds, package: "month", listPrice: p.perMonth, offerPrice: p.perMonth });
  if (p.perQuarter) {
    const perMonth = Math.round(p.perQuarter / 3);
    rows.push({ slotSeconds: s.slotSeconds, package: "quarter", listPrice: p.perMonth ?? perMonth, offerPrice: perMonth });
  }
  return rows;
}

/** Creates or refreshes one billboard per site under the given vendor. Returns the billboards. */
export async function upsertSites(vendorId: number, uploaderId: number, approverId: number): Promise<{ created: Billboard[]; updated: Billboard[] }> {
  const sites = await loadSites();
  const cats = Object.fromEntries((await Category.findAll()).map((c) => [c.slug, c]));
  const created: Billboard[] = [];
  const updated: Billboard[] = [];
  for (const s of sites) {
    const cat = cats[s.category] ?? cats.road;
    const loop = 180;
    const data = {
      vendorId,
      categoryId: cat.id,
      code: s.code,
      name: s.name,
      tier: s.tier,
      addressLine: s.addressLine,
      landmark: s.landmark,
      locality: s.locality,
      city: s.city,
      state: s.state,
      pincode: s.pincode,
      lat: s.lat,
      lng: s.lng,
      screenType: s.screenType,
      widthFt: s.widthFt,
      heightFt: s.heightFt,
      pixelPitch: s.screenType === "led" ? "P4" : null,
      refreshRateHz: s.screenType === "led" ? 3840 : null,
      brightnessNits: s.screenType === "led" ? 6500 : 2500,
      viewingAngleH: 160,
      viewingAngleV: 140,
      opsStart: "06:00",
      opsEnd: "23:00",
      loopSeconds: loop,
      slotsPerLoop: Math.max(1, Math.floor(loop / s.slotSeconds)),
      dailyImpressions: s.dailyImpressions,
      lokySense: s.tier === "exclusive",
      description: s.description,
      status: "approved" as const,
      liveStatus: "live" as const,
    };
    let b = await Billboard.findOne({ where: { code: s.code } });
    if (b) {
      await b.update(data);
      updated.push(b);
    } else {
      b = await Billboard.create(data as never);
      created.push(b);
    }
    // media: replace with the snapshot's photos (+ the website video, served from S3)
    await BillboardMedia.destroy({ where: { billboardId: b.id } });
    let i = 0;
    for (const url of s.images) await BillboardMedia.create({ billboardId: b.id, fileId: (await staticFile(url, uploaderId)).id, kind: i === 0 || i % 2 === 0 ? "day_photo" : "night_photo", sortOrder: i++, isCover: i === 1 });
    if (s.video) await BillboardMedia.create({ billboardId: b.id, fileId: (await staticFile(s.video, uploaderId)).id, kind: "traffic_video", sortOrder: i++, isCover: false });
    // pricing: replace with the website's rates
    await BillboardSlotPricing.destroy({ where: { billboardId: b.id } });
    for (const r of pricingRows(s)) await BillboardSlotPricing.create({ billboardId: b.id, ...r, isActive: true });
    // review trail so the vendor console shows it as approved
    if (!(await ReviewSection.findOne({ where: { vendorId, section: "billboard", billboardId: b.id } }))) {
      await ReviewSection.create({ vendorId, section: "billboard", billboardId: b.id, status: "approved", remark: null, round: 1, reviewedBy: approverId, reviewedAt: new Date() });
    }
  }
  return { created, updated };
}

/** Deletes every billboard whose code is not in the snapshot, with everything hanging off it. */
export async function purgeOtherBillboards(): Promise<string[]> {
  const keep = (await loadSites()).map((s) => s.code);
  const gone = await Billboard.findAll({ where: { code: { [Op.notIn]: keep } } });
  if (!gone.length) return [];
  const ids = gone.map((b) => b.id);
  await sequelize.transaction(async (transaction) => {
    const items = await CustomerQuotationItem.findAll({ where: { billboardId: ids }, transaction });
    const qids = Array.from(new Set(items.map((i) => i.quotationId)));
    await CustomerQuotationItem.destroy({ where: { billboardId: ids }, transaction });
    for (const qid of qids) {
      if ((await CustomerQuotationItem.count({ where: { quotationId: qid }, transaction })) === 0) await CustomerQuotation.destroy({ where: { id: qid }, transaction });
    }
    await CampaignScreen.destroy({ where: { billboardId: ids }, transaction });
    await QuotationItem.destroy({ where: { billboardId: ids }, transaction });
    await ProposalItem.destroy({ where: { billboardId: ids }, transaction });
    await OnboardingEvent.update({ billboardId: null }, { where: { billboardId: ids }, transaction });
    await ReviewSection.destroy({ where: { billboardId: ids }, transaction });
    await BillboardMedia.destroy({ where: { billboardId: ids }, transaction });
    await BillboardSlotPricing.destroy({ where: { billboardId: ids }, transaction });
    await Billboard.destroy({ where: { id: ids }, transaction });
  });
  return gone.map((b) => `${b.code} ${b.name}`);
}
