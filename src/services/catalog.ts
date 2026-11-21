import { Op } from "sequelize";
import { Billboard, BillboardMedia, BillboardSlotPricing, Category, File as FileRow, Vendor } from "@/db";
import { formatImpressions } from "@/lib/format";
import type { Billboard as CardBillboard } from "@/lib/data";
import type { Package } from "@/lib/domain";
import { likeOp } from "@/db/sequelize";
import { fileUrl } from "./files";

const PUBLIC_INCLUDE = [
  { model: Vendor, as: "vendor", attributes: ["id", "tradeName", "status"], where: { status: "approved" }, required: true },
  { model: Category, as: "category" },
  { model: BillboardMedia, as: "media", include: [{ model: FileRow, as: "file" }] },
  { model: BillboardSlotPricing, as: "pricing", where: { isActive: true }, required: false },
];

export type ListingFilters = { city?: string; locality?: string; category?: string; tier?: string; q?: string };

export async function listPublicBillboards(f: ListingFilters = {}): Promise<Billboard[]> {
  const where: Record<string, unknown> = { status: "approved" };
  if (f.city) where.city = f.city;
  if (f.locality) where.locality = f.locality;
  if (f.tier && f.tier !== "all") where.tier = f.tier;
  if (f.q) {
    const like = likeOp();
    where[Op.or as unknown as string] = [{ name: { [like]: `%${f.q}%` } }, { locality: { [like]: `%${f.q}%` } }, { city: { [like]: `%${f.q}%` } }];
  }
  const include = PUBLIC_INCLUDE.map((i) => (i.as === "category" && f.category && f.category !== "all" ? { ...i, where: { slug: f.category }, required: true } : i));
  return Billboard.findAll({
    where,
    include,
    order: [["updatedAt", "DESC"], [{ model: BillboardMedia, as: "media" }, "sortOrder", "ASC"]],
  });
}

export async function getPublicBillboard(code: string): Promise<Billboard | null> {
  return Billboard.findOne({
    where: { code, status: "approved" },
    include: PUBLIC_INCLUDE,
    order: [[{ model: BillboardMedia, as: "media" }, "sortOrder", "ASC"]],
  });
}

/** Locality chips with counts, for the listing header. */
export async function localityCounts(): Promise<{ name: string; count: number }[]> {
  const rows = (await Billboard.findAll({
    where: { status: "approved" },
    include: [{ model: Vendor, as: "vendor", attributes: [], where: { status: "approved" }, required: true }],
    attributes: ["locality", [Billboard.sequelize!.fn("COUNT", Billboard.sequelize!.col(`${Billboard.name}.id`)), "count"]],
    group: ["locality"],
    order: [[Billboard.sequelize!.literal("count"), "DESC"]],
    raw: true,
  })) as unknown as { locality: string; count: number }[];
  return rows.map((r) => ({ name: r.locality, count: Number(r.count) }));
}

export { formatImpressions };

/** The listing-card price: 20 s slot, cheapest package, else first active row. */
export function headlinePrice(b: Billboard) {
  const rows = (b.pricing ?? []).filter((p) => p.isActive);
  const twenty = rows.filter((p) => p.slotSeconds === 20);
  const pool = twenty.length ? twenty : rows;
  const pick = [...pool].sort((a, c) => Number(a.offerPrice) - Number(c.offerPrice))[0];
  if (!pick) return null;
  const per = pick.package === "day" ? "day" : "month";
  return { price: Number(pick.offerPrice), original: Number(pick.listPrice), label: `${pick.slotSeconds}s Slot /${per}` };
}

export function mediaUrls(b: Billboard): string[] {
  const media = [...(b.media ?? [])].sort((a, c) => Number(c.isCover) - Number(a.isCover) || a.sortOrder - c.sortOrder);
  return media.filter((m) => m.kind !== "traffic_video").map((m) => fileUrl(m.file)).filter((u): u is string => !!u);
}

/** Adapts a DB billboard to the shape the existing listing cards render. */
export function toCard(b: Billboard): CardBillboard {
  const images = mediaUrls(b);
  const price = headlinePrice(b);
  const specs = [
    b.refreshRateHz ? `${b.refreshRateHz}Hz (Flicker-Free)` : null,
    b.viewingAngleH && b.viewingAngleV ? `${b.viewingAngleH}° (H) / ${b.viewingAngleV}° (V)` : null,
    b.brightnessNits ? `${b.brightnessNits} nits` : null,
    `${Number(b.widthFt)} × ${Number(b.heightFt)} ft`,
  ].filter((s): s is string => !!s);
  return {
    id: b.code,
    name: b.name,
    locality: b.locality,
    city: b.city,
    tier: b.tier,
    category: b.category?.name ?? "DOOH",
    image: images[0] ?? "/img/billboard-day.jpg",
    images: images.length ? images : ["/img/billboard-day.jpg"],
    lokySense: b.lokySense,
    specs,
    stats: {
      dailyImpression: formatImpressions(b.dailyImpressions),
      loopTime: { m: Math.floor(b.loopSeconds / 60), s: b.loopSeconds % 60 },
      displayTech: { value: b.pixelPitch ?? b.screenType.toUpperCase(), unit: b.screenType === "static" ? "Static" : "LED" },
      adSlots: { used: 0, total: b.slotsPerLoop },
    },
    price: price?.price ?? 0,
    originalPrice: price?.original ?? 0,
    slotLabel: price?.label ?? "per slot",
    code: b.code,
    lat: b.lat == null ? null : Number(b.lat),
    lng: b.lng == null ? null : Number(b.lng),
    address: [b.addressLine, b.locality, b.city, b.state, b.pincode].filter(Boolean).join(", "),
    sizeFt: `${Number(b.widthFt)}×${Number(b.heightFt)} ft`,
    screenType: b.screenType.toUpperCase(),
    perDay: rate(b, 20, "day")?.offer ?? null,
    perMonth: rate(b, 20, "month")?.offer ?? null,
    perMonthList: rate(b, 20, "month")?.list ?? null,
    reach: b.dailyImpressions,
  };
}

/** One active pricing row as plain numbers. */
export function rate(b: Billboard, slotSeconds: number, pkg: Package): { list: number; offer: number } | null {
  const row = (b.pricing ?? []).find((p) => p.isActive && p.slotSeconds === slotSeconds && p.package === pkg);
  return row ? { list: Number(row.listPrice), offer: Number(row.offerPrice) } : null;
}

/** Approved billboards by code, in the order given, for the quotation builder. */
export async function listByCodes(codes: string[]): Promise<Billboard[]> {
  if (!codes.length) return [];
  const rows = await Billboard.findAll({ where: { code: codes, status: "approved" }, include: PUBLIC_INCLUDE, order: [[{ model: BillboardMedia, as: "media" }, "sortOrder", "ASC"]] });
  const byCode = new Map(rows.map((r) => [r.code, r]));
  return codes.map((c) => byCode.get(c)).filter((r): r is Billboard => !!r);
}

/** Compact row for the agency screen picker. */
export function toPicker(b: Billboard) {
  const price = headlinePrice(b);
  const booked = (b.bookings ?? []).filter((x) => x.campaign && ["confirmed", "active"].includes(x.campaign.status)).length;
  return { id: b.id, name: b.name, code: b.code, locality: b.locality, city: b.city, image: mediaUrls(b)[0] ?? null, reach: formatImpressions(b.dailyImpressions), from: price ? `from ₹${price.price.toLocaleString("en-IN")} · ${price.label}` : "no rates yet", booked: `${booked}/${b.slotsPerLoop}` };
}
