/* Seeds lookup data, staff logins and two demo vendors (one approved, one pending).
   Safe to re-run: skips anything that already exists. */
import {
  Billboard,
  BillboardMedia,
  BillboardSlotPricing,
  Category,
  File as FileRow,
  OnboardingEvent,
  ReviewSection,
  User,
  Vendor,
  VendorBankAccount,
  VendorContact,
  VendorDocument,
  sequelize,
  type Package,
} from "../src/db/models";
import { Agency, AgencyMember, Brand, Coupon } from "../src/db/agency-models";
import type { Role } from "../src/lib/domain";
import { encrypt } from "../src/lib/server/crypto";
import { hashPassword } from "../src/lib/server/password";

const CATEGORIES = [
  { slug: "road", name: "Road side", icon: "road" },
  { slug: "railway", name: "Railway station", icon: "railway" },
  { slug: "airport", name: "Airports", icon: "airport" },
  { slug: "bus", name: "Bus stations", icon: "bus" },
  { slug: "mall", name: "Malls", icon: "mall" },
  { slug: "shopping", name: "Shopping Complex", icon: "shopping" },
  { slug: "fuel", name: "Fuel Stations", icon: "fuel" },
  { slug: "techpark", name: "Tech Park", icon: "road" },
];

export const LOGINS = {
  admin: { username: "admin", password: "Admin@12345" },
  rep: { username: "rep.anita", password: "Rep@12345" },
  vendor: { username: "bulzads-demo", password: "Vendor@12345" },
  customer: { username: "customer@example.com", password: "Customer@12345" },
  agency: { username: "aakash@mehramedia.in", password: "Agency@12345" },
};

async function staticFile(url: string, uploadedBy: number) {
  const key = `static:${url}`;
  const [f] = await FileRow.findOrCreate({
    where: { storageKey: key },
    defaults: { storageKey: key, publicUrl: url, originalName: url.split("/").pop()!, mimeType: "image/jpeg", sizeBytes: 0, uploadedBy },
  });
  return f;
}

async function user(role: Role, username: string, password: string, name: string, extra: Partial<{ email: string; phone: string }> = {}) {
  const existing = await User.findOne({ where: { username } });
  if (existing) return existing;
  return User.create({ role, username, name, email: extra.email ?? null, phone: extra.phone ?? null, passwordHash: await hashPassword(password), lastLoginAt: null });
}

const PRICING: { slotSeconds: number; package: Package; listPrice: number; offerPrice: number }[] = [
  { slotSeconds: 10, package: "month", listPrice: 45000, offerPrice: 32000 },
  { slotSeconds: 20, package: "day", listPrice: 4500, offerPrice: 2500 },
  { slotSeconds: 20, package: "month", listPrice: 75000, offerPrice: 55000 },
  { slotSeconds: 20, package: "quarter", listPrice: 75000, offerPrice: 65000 },
  { slotSeconds: 20, package: "half_year", listPrice: 75000, offerPrice: 45000 },
  { slotSeconds: 20, package: "year", listPrice: 75000, offerPrice: 35000 },
  { slotSeconds: 30, package: "month", listPrice: 110000, offerPrice: 82000 },
];

async function billboard(vendorId: number, cat: Category, data: Record<string, unknown>, photos: { day: string[]; night: string[] }, uploader: number, status: "approved" | "pending") {
  const b = await Billboard.create({
    vendorId,
    categoryId: cat.id,
    status,
    liveStatus: status === "approved" ? "live" : null,
    ...(data as object),
  } as never);
  let i = 0;
  for (const url of photos.day) await BillboardMedia.create({ billboardId: b.id, fileId: (await staticFile(url, uploader)).id, kind: "day_photo", sortOrder: i++, isCover: i === 1 });
  for (const url of photos.night) await BillboardMedia.create({ billboardId: b.id, fileId: (await staticFile(url, uploader)).id, kind: "night_photo", sortOrder: i++, isCover: false });
  for (const p of PRICING) await BillboardSlotPricing.create({ billboardId: b.id, ...p, isActive: true });
  return b;
}

async function main() {
  await sequelize.authenticate();

  for (const [i, c] of CATEGORIES.entries()) await Category.findOrCreate({ where: { slug: c.slug }, defaults: { ...c, sortOrder: i } });
  const cats = Object.fromEntries((await Category.findAll()).map((c) => [c.slug, c]));

  const admin = await user("admin", LOGINS.admin.username, LOGINS.admin.password, "Loky Admin", { email: "admin@lokymedia.in" });
  const rep = await user("representative", LOGINS.rep.username, LOGINS.rep.password, "Anita Sharma", { email: "anita@lokymedia.in", phone: "9876500001" });
  await user("customer", LOGINS.customer.username, LOGINS.customer.password, "Priya Advertiser", { email: LOGINS.customer.username, phone: "9876500002" });

  /* ---- Approved demo vendor with three live billboards ---- */
  if (!(await Vendor.findOne({ where: { gstNumber: "10AABCB1234A1Z5" } }))) {
    const vUser = await user("vendor", LOGINS.vendor.username, LOGINS.vendor.password, "Bulz Ads Media", { phone: "9876500003" });
    const v = await Vendor.create({
      userId: vUser.id,
      onboardedBy: rep.id,
      legalName: "Bulz Ads Media Private Limited",
      tradeName: "Bulz Ads Media",
      businessType: "pvt_ltd",
      gstNumber: "10AABCB1234A1Z5",
      panNumber: "AABCB1234A",
      addressLine: "PK Complex, Bailey Road, Rukanpura",
      city: "Patna",
      state: "Bihar",
      pincode: "800014",
      logoFileId: (await staticFile("/img/partner-logo.png", rep.id)).id,
      status: "approved",
      submittedAt: new Date("2026-09-20T10:00:00+05:30"),
      approvedAt: new Date("2026-09-22T15:30:00+05:30"),
      approvedBy: admin.id,
      rejectionReason: null,
    } as never);
    await VendorContact.create({ vendorId: v.id, name: "Rajeev Mehra", designation: "Owner", phone: "9876500003", email: "rajeev@bulzads.in", isPrimary: true });
    await VendorContact.create({ vendorId: v.id, name: "Sunita Mehra", designation: "Accounts", phone: "9876500004", email: null, isPrimary: false });
    await VendorBankAccount.create({ vendorId: v.id, accountHolder: "Bulz Ads Media Pvt Ltd", bankName: "HDFC Bank", branch: "Bailey Road, Patna", accountNumberEnc: encrypt("50100123456789"), accountLast4: "6789", ifsc: "HDFC0001234", upiId: "bulzads@hdfcbank" });
    for (const docType of ["gst_certificate", "pan_card", "cancelled_cheque", "agreement"] as const) {
      await VendorDocument.create({ vendorId: v.id, docType, fileId: (await staticFile("/img/partner-logo.png", rep.id)).id, docNumber: null, expiresAt: null });
    }
    const base = { tier: "exclusive", screenType: "led", pixelPitch: "P4", refreshRateHz: 3840, brightnessNits: 7500, viewingAngleH: 160, viewingAngleV: 140, opsStart: "09:00", opsEnd: "23:00", loopSeconds: 225, slotsPerLoop: 8, lokySense: true, state: "Bihar", city: "Patna" };
    const b1 = await billboard(v.id, cats.road, { ...base, code: "01010", name: "LOKY LUME, JagdevPath, Rukanpura (Biggest Billboard in Patna)", addressLine: "PK Complex, Rukanpura Bailey road, fly over, near Sai corporate", landmark: "Near Sai Corporate", locality: "Rukanpura", pincode: "800014", lat: 25.6093, lng: 85.0732, widthFt: 30, heightFt: 30, dailyImpressions: 103000, description: "Patna's largest LED on the Bailey Road flyover approach." }, { day: ["/img/billboard-day.jpg"], night: ["/img/billboard-night.jpg"] }, rep.id, "approved");
    const b2 = await billboard(v.id, cats.shopping, { ...base, tier: "partner", lokySense: false, code: "01020", name: "Bulz Ads Digital Billboard - Boring Road Crossing", addressLine: "Boring Road Crossing, opposite Mall", landmark: "Boring Road Crossing", locality: "Boring Road", pincode: "800001", lat: 25.6176, lng: 85.1078, widthFt: 20, heightFt: 10, dailyImpressions: 68000, description: null }, { day: ["/img/vendor/screen-cyberhub.jpg"], night: ["/img/billboard-night.jpg"] }, rep.id, "approved");
    const b3 = await billboard(v.id, cats.airport, { ...base, tier: "operated", code: "01030", name: "Patna Airport Arrivals LED Wall", addressLine: "Jay Prakash Narayan Airport, Arrivals hall", landmark: "Arrivals hall", locality: "Airport", pincode: "800014", lat: 25.5913, lng: 85.0877, widthFt: 16, heightFt: 9, dailyImpressions: 45000, description: null }, { day: ["/img/vendor/screen-airport.jpg"], night: [] }, rep.id, "approved");
    for (const s of ["business", "contacts", "documents", "bank"] as const) await ReviewSection.create({ vendorId: v.id, section: s, billboardId: null, status: "approved", remark: null, round: 1, reviewedBy: admin.id, reviewedAt: v.approvedAt });
    for (const b of [b1, b2, b3]) await ReviewSection.create({ vendorId: v.id, section: "billboard", billboardId: b.id, status: "approved", remark: null, round: 1, reviewedBy: admin.id, reviewedAt: v.approvedAt });
    for (const [action, actorId, at] of [["created", rep.id, "2026-09-18T11:00:00+05:30"], ["submitted", rep.id, "2026-09-20T10:00:00+05:30"], ["credentials_issued", rep.id, "2026-09-20T10:00:00+05:30"], ["vendor_approved", admin.id, "2026-09-22T15:30:00+05:30"]] as const) {
      await OnboardingEvent.create({ vendorId: v.id, actorId, action, createdAt: new Date(at) } as never);
    }
    console.log("seeded approved vendor Bulz Ads Media (#01010, #01020, #01030)");
  }

  /* ---- Pending demo vendor so the admin queue has something to review ---- */
  if (!(await Vendor.findOne({ where: { gstNumber: "07AAACM5678B1Z2" } }))) {
    const vUser = await user("vendor", "metrovision-4411", "Vendor@12345", "Metro Vision Displays", { phone: "9876500005" });
    await vUser.update({ mustChangePassword: true });
    const v = await Vendor.create({
      userId: vUser.id,
      onboardedBy: rep.id,
      legalName: "Metro Vision Displays LLP",
      tradeName: "Metro Vision Displays",
      businessType: "llp",
      gstNumber: "07AAACM5678B1Z2",
      panNumber: "AAACM5678B",
      addressLine: "Plot 12, Sector 29",
      city: "Gurgaon",
      state: "Haryana",
      pincode: "122001",
      logoFileId: null,
      status: "pending",
      submittedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
    } as never);
    await VendorContact.create({ vendorId: v.id, name: "Karan Malhotra", designation: "Partner", phone: "9876500005", email: "karan@metrovision.in", isPrimary: true });
    await VendorBankAccount.create({ vendorId: v.id, accountHolder: "Metro Vision Displays LLP", bankName: "ICICI Bank", branch: "Sector 29, Gurgaon", accountNumberEnc: encrypt("001405001234"), accountLast4: "1234", ifsc: "ICIC0000014", upiId: null });
    for (const docType of ["gst_certificate", "pan_card", "cancelled_cheque", "agreement"] as const) {
      await VendorDocument.create({ vendorId: v.id, docType, fileId: (await staticFile("/img/partner-logo.png", rep.id)).id, docNumber: null, expiresAt: null });
    }
    const b = await billboard(v.id, cats.mall, { tier: "partner", screenType: "led", pixelPitch: "P6", refreshRateHz: 1920, brightnessNits: 5500, viewingAngleH: 140, viewingAngleV: 120, opsStart: "10:00", opsEnd: "22:00", loopSeconds: 180, slotsPerLoop: 9, lokySense: false, state: "Haryana", city: "Gurgaon", code: "01040", name: "Premium Wall - Cyber Hub", addressLine: "DLF Cyber Hub, DLF Phase 3", landmark: "Cyber Hub main plaza", locality: "DLF Phase 3", pincode: "122002", lat: 28.4947, lng: 77.0889, widthFt: 24, heightFt: 12, dailyImpressions: 92000, description: null }, { day: ["/img/vendor/screen-cyberhub.jpg"], night: [] }, rep.id, "pending");
    for (const s of ["business", "contacts", "documents", "bank"] as const) await ReviewSection.create({ vendorId: v.id, section: s, billboardId: null, status: "pending", remark: null, round: 1, reviewedBy: null, reviewedAt: null });
    await ReviewSection.create({ vendorId: v.id, section: "billboard", billboardId: b.id, status: "pending", remark: null, round: 1, reviewedBy: null, reviewedAt: null });
    for (const action of ["created", "submitted", "credentials_issued"] as const) await OnboardingEvent.create({ vendorId: v.id, actorId: rep.id, action } as never);
    console.log("seeded pending vendor Metro Vision Displays (#01040)");
  }

  /* ---- coupons + demo partner agency ---- */
  for (const c of [
    { code: "LOKYPARTNER10", type: "flat" as const, value: 5000, description: "₹5,000 partner launch discount" },
    { code: "FESTIVE15", type: "percent" as const, value: 15, description: "15% off festive-season bookings" },
  ]) await Coupon.findOrCreate({ where: { code: c.code }, defaults: { ...c, expiresAt: null } });
  if (!(await Agency.findOne({ where: { founderEmail: "aakash@mehramedia.in" } }))) {
    const owner = await user("agency", "aakash@mehramedia.in", "Agency@12345", "Aakash Mehra", { email: "aakash@mehramedia.in", phone: "9876500010" });
    const a = await Agency.create({
      ownerUserId: owner.id, legalName: "Mehra Media Group", gstNumber: "10AAACM9876P1Z3", addressLine: "Exhibition Road", city: "Patna", state: "Bihar", pincode: "800001", logoFileId: null,
      founderName: "Aakash Mehra", founderPhone: "9876500010", founderEmail: "aakash@mehramedia.in", founderRole: "ceo_founder", verificationPath: "enterprise", verifiedAt: new Date(),
      status: "partner", assessmentScore: 9.2, commissionPct: 8.4, level: 1, partnerSince: new Date("2026-09-25T10:00:00+05:30"), expertCallbackDueAt: null,
    } as never);
    await AgencyMember.create({ agencyId: a.id, userId: owner.id, title: "Owner", isOwner: true });
    const member = await user("agency_member", "sarah@mehramedia.in", "Agency@12345", "Sarah Jenkins", { email: "sarah@mehramedia.in", phone: "9876500011" });
    const m = await AgencyMember.create({ agencyId: a.id, userId: member.id, title: "Senior Media Strategist", isOwner: false });
    await Brand.create({ agencyId: a.id, name: "Tanishq Jewelry", hq: "Bengaluru, India", category: "Luxury Goods", website: null, logoFileId: null, managerMemberId: m.id, status: "upcoming", lockedUntil: null });
    await Brand.create({ agencyId: a.id, name: "Blink-It", hq: "Gurgaon, India", category: "Quick Commerce", website: null, logoFileId: null, managerMemberId: null, status: "upcoming", lockedUntil: null });
    console.log("seeded partner agency Mehra Media Group");
  }
  console.log("\nLogins:");
  for (const [k, l] of Object.entries(LOGINS)) console.log(`  ${k.padEnd(9)} ${l.username} / ${l.password}`);
  await sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
