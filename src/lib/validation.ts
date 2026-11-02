import { z } from "zod";
import { BUSINESS_TYPES, PACKAGES, SCREEN_TYPES, SLOT_SECONDS, TIERS } from "@/lib/domain";

export const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PHONE = z.string().trim().regex(/^[6-9][0-9]{9}$/, "Enter a 10-digit mobile number");
const PIN = z.string().trim().regex(/^[0-9]{6}$/, "Enter a 6-digit pincode");
const optional = (s: z.ZodString) => z.preprocess((v) => (v === "" || v == null ? undefined : v), s.optional());

export const businessSchema = z.object({
  legalName: z.string().trim().min(2, "Legal name is required").max(191),
  tradeName: z.string().trim().min(2, "Trade name is required").max(191),
  businessType: z.enum(BUSINESS_TYPES),
  gstNumber: z.string().trim().toUpperCase().regex(GST_RE, "Not a valid GSTIN"),
  panNumber: z.string().trim().toUpperCase().regex(PAN_RE, "Not a valid PAN"),
  addressLine: z.string().trim().min(5, "Address is required").max(255),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  pincode: PIN,
});
export type BusinessInput = z.infer<typeof businessSchema>;

const contact = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  designation: optional(z.string().trim().max(120)),
  phone: PHONE,
  email: optional(z.string().trim().email("Not a valid email").max(191)),
});
export const contactsSchema = z.object({
  primary: contact,
  secondary: z
    .object({
      name: optional(z.string().trim().max(120)),
      designation: optional(z.string().trim().max(120)),
      phone: optional(z.string().trim().regex(/^[6-9][0-9]{9}$/, "Enter a 10-digit mobile number")),
      email: optional(z.string().trim().email("Not a valid email").max(191)),
    })
    .optional(),
});
export type ContactsInput = z.infer<typeof contactsSchema>;

export const bankSchema = z.object({
  accountHolder: z.string().trim().min(2, "Account holder is required").max(120),
  bankName: z.string().trim().min(2, "Bank name is required").max(120),
  branch: optional(z.string().trim().max(120)),
  accountNumber: z.string().trim().regex(/^[0-9]{9,18}$/, "Account number must be 9–18 digits"),
  ifsc: z.string().trim().toUpperCase().regex(IFSC_RE, "Not a valid IFSC"),
  upiId: optional(z.string().trim().max(80)),
});
export type BankInput = z.infer<typeof bankSchema>;

const time = z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Use HH:MM");
export const billboardSchema = z.object({
  name: z.string().trim().min(4, "Name is required").max(191),
  categoryId: z.coerce.number().int().positive("Pick a category"),
  tier: z.enum(TIERS),
  addressLine: z.string().trim().min(5, "Address is required").max(255),
  landmark: optional(z.string().trim().max(255)),
  locality: z.string().trim().min(2, "Locality is required").max(80),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  pincode: z.preprocess((v) => (v === "" ? undefined : v), PIN.optional()),
  lat: z.coerce.number().min(6, "Latitude must be inside India").max(38, "Latitude must be inside India"),
  lng: z.coerce.number().min(68, "Longitude must be inside India").max(98, "Longitude must be inside India"),
  screenType: z.enum(SCREEN_TYPES),
  widthFt: z.coerce.number().positive("Width is required").max(500),
  heightFt: z.coerce.number().positive("Height is required").max(500),
  pixelPitch: optional(z.string().trim().max(10)),
  refreshRateHz: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().positive().max(65535).optional()),
  brightnessNits: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().positive().max(65535).optional()),
  viewingAngleH: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().positive().max(360).optional()),
  viewingAngleV: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().positive().max(360).optional()),
  opsStart: time,
  opsEnd: time,
  loopSeconds: z.coerce.number().int().positive("Loop length is required").max(3600),
  slotsPerLoop: z.coerce.number().int().positive("Slots per loop is required").max(200),
  dailyImpressions: z.coerce.number().int().nonnegative().max(100_000_000),
  lokySense: z.coerce.boolean(),
  description: optional(z.string().trim().max(2000)),
});
export type BillboardInput = z.infer<typeof billboardSchema>;

export const pricingRowSchema = z.object({
  slotSeconds: z.coerce.number().int().refine((n) => (SLOT_SECONDS as readonly number[]).includes(n), "Slot must be 10, 20 or 30 s"),
  package: z.enum(PACKAGES),
  listPrice: z.coerce.number().positive("List price is required").max(99_999_999),
  offerPrice: z.coerce.number().positive("Offer price is required").max(99_999_999),
});
export type PricingRowInput = z.infer<typeof pricingRowSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(191),
  password: z.string().min(1, "Password is required"),
});

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Current password is required"),
    next: z.string().min(8, "Use at least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const customerSignupSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Not a valid email").max(191),
  phone: PHONE,
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

export const staffSchema = z.object({
  role: z.enum(["admin", "representative"]),
  name: z.string().trim().min(2, "Name is required").max(120),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,64}$/, "3–64 chars: letters, digits, . _ -"),
  email: optional(z.string().trim().email("Not a valid email").max(191)),
  phone: optional(z.string().trim().regex(/^[6-9][0-9]{9}$/, "Enter a 10-digit mobile number")),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

/** Flattens a zod error into { fieldName: message }. Nested paths join with ".". */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path.join(".") || "_";
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

/* ======================= Agency module ======================= */
import { AGENCY_SECTORS, AGENCY_SERVICES, DOOH_EXPERIENCE, FOUNDER_ROLES, PORTFOLIO_SIZES, PROPOSAL_THEMES, QUOTE_LAYOUTS, SLOT_SECONDS as SLOTS } from "@/lib/domain";

const mobile = z.string().trim().regex(/^[6-9][0-9]{9}$/, "Enter a 10-digit mobile number");

export const agencyProfileSchema = z.object({
  legalName: z.string().trim().min(2, "Agency name is required").max(191),
  gstNumber: z.preprocess((v) => (v === "" || v == null ? undefined : String(v).trim().toUpperCase()), z.string().regex(GST_RE, "Not a valid GSTIN").optional()),
  addressLine: z.string().trim().min(3, "Address is required").max(255),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  pincode: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().regex(/^[0-9]{6}$/, "Enter a 6-digit pincode").optional()),
});
export type AgencyProfileInput = z.infer<typeof agencyProfileSchema>;

export const founderSchema = z.object({
  founderName: z.string().trim().min(2, "Founder name is required").max(120),
  founderPhone: mobile,
  founderEmail: z.string().trim().toLowerCase().email("Not a valid email").max(191),
  founderRole: z.enum(FOUNDER_ROLES),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});
export type FounderInput = z.infer<typeof founderSchema>;

export const otpSchema = z.object({ code: z.string().trim().regex(/^[0-9]{6}$/, "Enter the 6-digit code") });

const multi = (opts: readonly string[]) => z.preprocess((v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]), z.array(z.enum(opts as [string, ...string[]])));
export const assessmentSchema = z.object({
  services: multi(AGENCY_SERVICES).refine((a) => a.length > 0, "Pick at least one service"),
  sectors: multi(AGENCY_SECTORS).refine((a) => a.length > 0, "Pick at least one sector"),
  portfolioSize: z.enum(PORTFOLIO_SIZES),
  doohExperience: z.enum(DOOH_EXPERIENCE),
});
export type AssessmentInput = z.infer<typeof assessmentSchema>;

export const brandSchema = z.object({
  name: z.string().trim().min(2, "Brand name is required").max(191),
  hq: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(191).optional()),
  category: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(80).optional()),
  website: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(191).optional()),
});
export type BrandInput = z.infer<typeof brandSchema>;

export const memberSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  title: z.string().trim().min(2, "Role title is required").max(120),
  email: z.string().trim().toLowerCase().email("Not a valid email").max(191),
  phone: z.preprocess((v) => (v === "" ? undefined : v), mobile.optional()),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

export const proposalSchema = z.object({
  brandId: z.coerce.number().int().positive("Pick a brand"),
  title: z.string().trim().min(3, "Campaign title is required").max(191),
  theme: z.enum(PROPOSAL_THEMES),
  objective: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(2000).optional()),
  billboardIds: z.preprocess((v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]), z.array(z.coerce.number().int().positive()).min(1, "Select at least one screen")),
});
export type ProposalInput = z.infer<typeof proposalSchema>;

export const quotationSchema = z.object({
  brandId: z.coerce.number().int().positive("Pick a brand"),
  proposalId: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().positive().optional()),
  title: z.string().trim().min(3, "Title is required").max(191),
  slotSeconds: z.coerce.number().int().refine((n) => (SLOTS as readonly number[]).includes(n), "Slot must be 10, 20 or 30 s"),
  package: z.enum(PACKAGES),
  billboardIds: z.preprocess((v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]), z.array(z.coerce.number().int().positive()).min(1, "Select at least one screen")),
  couponCode: z.preprocess((v) => (v === "" || v == null ? undefined : String(v).trim().toUpperCase()), z.string().max(40).optional()),
  marginPct: z.coerce.number().min(0).max(40),
  addonCreatives: z.coerce.boolean(),
  emiEnabled: z.coerce.boolean(),
  layout: z.enum(QUOTE_LAYOUTS),
});
export type QuotationInput = z.infer<typeof quotationSchema>;

export const lockCampaignSchema = z.object({
  paymentPath: z.enum(["upfront", "emi"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a start date"),
  acceptTerms: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean().refine((b) => b, "Accept the placement terms to continue")),
});

export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{4,40}$/, "4–40 chars, letters/digits"),
  type: z.enum(["flat", "percent"]),
  value: z.coerce.number().positive("Value is required"),
  description: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(191).optional()),
});
