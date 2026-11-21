/*
 * Snapshots the live Loky Media catalogue (www.lokymedia.com/api/product/list) into
 * scripts/data/lokymedia-sites.json and public/img/sites/*.jpg, so `db:seed` / `db:reseed-sites`
 * can load the real Patna network without network access.
 *
 * Usage: npx tsx scripts/import-lokymedia.ts        (re-run any time the website catalogue changes)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const API = process.env.LOKY_API_URL ?? "https://www.lokymedia.com";
const S3 = process.env.LOKY_S3_URL ?? "https://loky-s3-bucket.s3.ap-southeast-1.amazonaws.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const OUT_JSON = path.join(process.cwd(), "scripts/data/lokymedia-sites.json");
const OUT_IMG = path.join(process.cwd(), "public/img/sites");

type ApiListing = {
  _id: string; id: string; title: string; address: string; city: string; pinCode?: string; googleMapUrl?: string; landmark?: string;
  exclusiveTag?: string; nearBy1?: string; nearBy2?: string; dimensions?: { width: number; height: number }; audienceType?: string;
  reachCount?: number; slotDuration?: string; displayType?: string; pricing?: { perDayRate?: number; perWeekRate?: number; perMonthRate?: number; perQuarterRate?: number };
  landmarkLocation?: { landmarks?: Record<string, string> }; mediaFiles?: { path: string; size?: number }[]; videoFile?: { path: string } | null;
  status?: string; isDraft?: boolean; isDeleted?: boolean; updatedAt?: string;
};

export type SiteRecord = {
  code: string; sourceId: string; name: string; tier: "exclusive" | "partner" | "operated"; category: string;
  addressLine: string; landmark: string | null; locality: string; city: string; state: string; pincode: string | null;
  lat: number | null; lng: number | null; screenType: "led" | "lcd"; widthFt: number; heightFt: number;
  slotSeconds: number; slotOptions: number[]; dailyImpressions: number; description: string | null;
  pricing: { perDay: number | null; perWeek: number | null; perMonth: number | null; perQuarter: number | null };
  images: string[]; video: string | null; sourceUpdatedAt: string | null;
};

const LOCALITIES = ["Rukanpura", "Mithapur", "Boring Road", "Dak Bunglow Rd", "Exhibition Rd", "Bailey Road", "Kankarbagh", "Fraser Road", "Patliputra", "Gandhi Maidan", "Rajendra Nagar", "Anisabad", "Danapur", "Kidwaipuri"];
const LOCALITY_HINTS: [RegExp, string][] = [[/boring|boaring/i, "Boring Road"], [/dak\s*bung/i, "Dak Bunglow Rd"], [/exhibition/i, "Exhibition Rd"], [/mithapur|bypass/i, "Mithapur"], [/rukanpura|jagdev/i, "Rukanpura"], [/bailey|baily/i, "Bailey Road"]];

function localityOf(x: ApiListing): string {
  const hay = `${x.title} ${x.address} ${x.city}`;
  for (const l of LOCALITIES) if (new RegExp(l.replace(/\s+/g, "\\s*"), "i").test(hay)) return l;
  for (const [re, l] of LOCALITY_HINTS) if (re.test(hay)) return l;
  const parts = x.city.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : "Patna";
}

function categoryOf(x: ApiListing): string {
  const hay = `${x.nearBy1 ?? ""} ${x.nearBy2 ?? ""} ${x.title}`.toLowerCase();
  if (/mall|plaza/.test(hay)) return "mall";
  if (/airport/.test(hay)) return "airport";
  if (/railway|station/.test(hay)) return "railway";
  if (/bus/.test(hay)) return "bus";
  if (/fuel|petrol/.test(hay)) return "fuel";
  if (/business|market|shop|hotel|palace|chamber/.test(hay)) return "shopping";
  return "road";
}

async function resolveCoords(url?: string): Promise<{ lat: number; lng: number } | null> {
  if (!url) return null;
  const pick = (s: string) => {
    const m = s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ?? s.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) ?? s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
  };
  const direct = pick(url);
  if (direct) return direct;
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA } });
    return pick(res.url) ?? pick(await res.text());
  } catch {
    return null;
  }
}

async function downloadImage(s3Path: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(`${S3}/${s3Path.split("/").map(encodeURIComponent).join("/")}`, { headers: { "User-Agent": UA } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
    return true;
  } catch (e) {
    console.warn("  image failed:", s3Path, (e as Error).message);
    return false;
  }
}

async function main() {
  const res = await fetch(`${API}/api/product/list`, { headers: { Accept: "application/json", "User-Agent": UA } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = (await res.json()) as { data?: { data?: { listings?: ApiListing[] }; listings?: ApiListing[] } };
  const listings = json.data?.data?.listings ?? json.data?.listings ?? [];
  console.log(`${listings.length} listings from ${API}`);
  await mkdir(OUT_IMG, { recursive: true });

  const sites: SiteRecord[] = [];
  for (const x of listings) {
    if (x.isDeleted || x.isDraft || (x.status && x.status.toLowerCase() !== "live")) {
      console.log(`skip ${x.id} (${x.status ?? "draft"})`);
      continue;
    }
    const coords = await resolveCoords(x.googleMapUrl);
    const slots = Array.from(new Set((x.slotDuration ?? "").match(/\d+/g)?.map(Number).filter((n) => n > 0) ?? [])).sort((a, b) => a - b);
    const images: string[] = [];
    let n = 0;
    for (const m of x.mediaFiles ?? []) {
      if (!m.path || /\.(mp4|mov|webm)$/i.test(m.path)) continue;
      const file = `${x.id}-${++n}.jpg`;
      if (await downloadImage(m.path, path.join(OUT_IMG, file))) images.push(`/img/sites/${file}`);
    }
    const landmarks = Object.values(x.landmarkLocation?.landmarks ?? {}).map((s) => s.trim()).filter(Boolean);
    const tag = (x.exclusiveTag ?? "").toLowerCase();
    const addressLine = x.address.replace(/,?\s*patna\b.*$/i, "").replace(/,\s*$/, "").trim() || x.address;
    sites.push({
      code: x.id,
      sourceId: x._id,
      name: x.title.replace(/\s*#\s*\d+\s*$/, "").replace(/\s+/g, " ").trim(),
      tier: tag.includes("exclusive") ? "exclusive" : tag.includes("operated") ? "operated" : "partner",
      category: categoryOf(x),
      addressLine,
      landmark: x.landmark?.trim() || null,
      locality: localityOf(x),
      city: "Patna",
      state: "Bihar",
      pincode: x.pinCode?.trim() || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      screenType: (x.displayType ?? "led").toLowerCase() === "lcd" ? "lcd" : "led",
      widthFt: x.dimensions?.width ?? 0,
      heightFt: x.dimensions?.height ?? 0,
      slotSeconds: slots[0] ?? 10,
      slotOptions: slots.length ? slots : [10],
      dailyImpressions: x.reachCount ?? 0,
      description: [x.audienceType?.trim(), landmarks.length ? `Landmarks: ${landmarks.join(", ")}.` : null].filter(Boolean).join(" ") || null,
      pricing: { perDay: x.pricing?.perDayRate ?? null, perWeek: x.pricing?.perWeekRate ?? null, perMonth: x.pricing?.perMonthRate ?? null, perQuarter: x.pricing?.perQuarterRate ?? null },
      images,
      video: x.videoFile?.path ? `${S3}/${x.videoFile.path.split("/").map(encodeURIComponent).join("/")}` : null,
      sourceUpdatedAt: x.updatedAt ?? null,
    });
    console.log(`${x.id}  ${sites[sites.length - 1].name}  [${sites[sites.length - 1].locality}]  ${coords ? `${coords.lat},${coords.lng}` : "no coords"}  ${images.length} photos`);
  }
  await writeFile(OUT_JSON, JSON.stringify({ source: `${API}/api/product/list`, importedAt: new Date().toISOString(), sites }, null, 2));
  console.log(`wrote ${sites.length} sites to ${path.relative(process.cwd(), OUT_JSON)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
