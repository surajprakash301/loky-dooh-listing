/**
 * Domain vocabulary shared by every layer (DB models, services, server actions, client components).
 * Pure constants and types only: this file must never import the ORM or any Node-only module,
 * because client components import it too.
 */

export const ROLES = ["admin", "representative", "vendor", "customer", "agency", "agency_member"] as const;
export type Role = (typeof ROLES)[number];

export const VENDOR_STATUSES = ["draft", "pending", "changes_requested", "approved", "rejected"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export const BILLBOARD_STATUSES = ["draft", "pending", "changes_requested", "approved", "rejected", "inactive"] as const;
export type BillboardStatus = (typeof BILLBOARD_STATUSES)[number];

export const LIVE_STATUSES = ["live", "offline", "maintenance", "limited"] as const;
export type LiveStatus = (typeof LIVE_STATUSES)[number];

export const TIERS = ["exclusive", "partner", "operated"] as const;
export type Tier = (typeof TIERS)[number];

export const SECTIONS = ["business", "contacts", "documents", "bank", "billboard"] as const;
export type Section = (typeof SECTIONS)[number];

export const SECTION_STATUSES = ["pending", "approved", "changes_requested"] as const;
export type SectionStatus = (typeof SECTION_STATUSES)[number];

export const DOC_TYPES = ["gst_certificate", "pan_card", "cancelled_cheque", "agreement", "other"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const MEDIA_KINDS = ["day_photo", "night_photo", "traffic_video", "other"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const PACKAGES = ["day", "month", "quarter", "half_year", "year"] as const;
export type Package = (typeof PACKAGES)[number];

export const BUSINESS_TYPES = ["proprietorship", "partnership", "pvt_ltd", "llp", "other"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const SCREEN_TYPES = ["led", "lcd", "static"] as const;
export type ScreenType = (typeof SCREEN_TYPES)[number];

export const SLOT_SECONDS = [10, 20, 30] as const;

export const EVENT_ACTIONS = [
  "created",
  "submitted",
  "resubmitted",
  "section_approved",
  "changes_requested",
  "vendor_approved",
  "vendor_rejected",
  "credentials_issued",
  "billboard_added",
  "password_reset",
] as const;
export type EventAction = (typeof EVENT_ACTIONS)[number];

/* ---------- human labels (single source for every portal) ---------- */

export const SECTION_LABEL: Record<Section, string> = {
  business: "A · Business details",
  contacts: "B · Contact persons",
  documents: "C · KYC documents",
  bank: "D · Bank & payout",
  billboard: "E · Billboard",
};

export const REQUIRED_DOCS: readonly DocType[] = ["gst_certificate", "pan_card", "cancelled_cheque", "agreement"];

export const DOC_LABEL: Record<DocType, string> = {
  gst_certificate: "GST certificate",
  pan_card: "PAN card",
  cancelled_cheque: "Cancelled cheque",
  agreement: "Signed partner agreement",
  other: "Other document",
};

export const TIER_LABEL: Record<Tier, string> = {
  exclusive: "Loky Exclusive ✨",
  partner: "Loky Partner ⭐",
  operated: "Loky Operated",
};

export const BUSINESS_TYPE_LABEL: Record<BusinessType, string> = {
  proprietorship: "Proprietorship",
  partnership: "Partnership",
  pvt_ltd: "Private Limited",
  llp: "LLP",
  other: "Other",
};

export const PACKAGE_LABEL: Record<Package, string> = {
  day: "Per Day",
  month: "Monthly Package",
  quarter: "Quarterly Package",
  half_year: "Half Yearly Package",
  year: "Yearly Package",
};

export const PACKAGE_MONTHS: Record<Package, number> = { day: 1, month: 1, quarter: 3, half_year: 6, year: 12 };

export const VENDOR_STATUS_LABEL: Record<VendorStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected",
};

export const EVENT_LABEL: Record<EventAction, string> = {
  created: "Onboarding started",
  submitted: "Submitted for review",
  resubmitted: "Resubmitted",
  section_approved: "Section approved",
  changes_requested: "Changes requested",
  vendor_approved: "Vendor approved",
  vendor_rejected: "Vendor rejected",
  credentials_issued: "Vendor login issued",
  billboard_added: "Billboard added",
  password_reset: "Vendor password reset",
};

/** Where each role lands after login. */
export function homeFor(role: Role): string {
  switch (role) {
    case "admin":
      return "/admin/vendors";
    case "representative":
      return "/rep";
    case "vendor":
      return "/vendor/dashboard";
    case "agency":
    case "agency_member":
      return "/agency";
    default:
      return "/";
  }
}

/** One row of the representative's stepper: a section (or one billboard) and where it stands in review. */
export type StepState = {
  key: Section | `billboard:${number}`;
  section: Section;
  billboardId?: number;
  label: string;
  href: string;
  filled: boolean;
  status: SectionStatus | "draft";
  remark: string | null;
  round: number;
  editable: boolean;
};

/* ======================= Agency module ======================= */

export const AGENCY_STATUSES = ["registered", "partner", "suspended"] as const;
export type AgencyStatus = (typeof AGENCY_STATUSES)[number];

export const VERIFICATION_PATHS = ["enterprise", "public", "unregistered"] as const;
export type VerificationPath = (typeof VERIFICATION_PATHS)[number];

export const FOUNDER_ROLES = ["ceo_founder", "owner", "media_planner", "director", "other"] as const;
export const FOUNDER_ROLE_LABEL: Record<(typeof FOUNDER_ROLES)[number], string> = { ceo_founder: "CEO / Founder", owner: "Owner", media_planner: "Media Planner", director: "Director", other: "Other" };

export const AGENCY_SERVICES = ["creative", "media_buying", "digital", "events", "print", "pr"] as const;
export const AGENCY_SERVICE_LABEL: Record<(typeof AGENCY_SERVICES)[number], string> = { creative: "Creative & branding", media_buying: "Media buying", digital: "Digital marketing", events: "Events & activations", print: "Print & OOH", pr: "PR & communications" };
export const AGENCY_SECTORS = ["real_estate", "automobile", "retail", "education", "fmcg", "jewellery", "healthcare", "hospitality"] as const;
export const AGENCY_SECTOR_LABEL: Record<(typeof AGENCY_SECTORS)[number], string> = { real_estate: "Real estate", automobile: "Automobile", retail: "Retail", education: "Education", fmcg: "FMCG", jewellery: "Jewellery", healthcare: "Healthcare", hospitality: "Hospitality" };
export const PORTFOLIO_SIZES = ["1-5", "6-15", "16-50", "50+"] as const;
export const DOOH_EXPERIENCE = ["none", "some", "regular", "expert"] as const;
export const DOOH_EXPERIENCE_LABEL: Record<(typeof DOOH_EXPERIENCE)[number], string> = { none: "No DOOH experience yet", some: "A few DOOH campaigns", regular: "Regular DOOH buyer", expert: "DOOH specialist" };

export const BRAND_STATUSES = ["active", "upcoming", "paused", "past"] as const;
export type BrandStatus = (typeof BRAND_STATUSES)[number];

export const ASSET_STATUSES = ["reviewing", "approved", "rejected"] as const;

export const PROPOSAL_STATUSES = ["draft", "ready", "sent"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];
export const PROPOSAL_THEMES = ["festive", "aesthetic", "corporate", "launch"] as const;
export const PROPOSAL_THEME_LABEL: Record<(typeof PROPOSAL_THEMES)[number], string> = { festive: "Festival theme (Durga Puja, Diwali)", aesthetic: "Aesthetic default overlay", corporate: "Corporate clean", launch: "Product launch" };

export const QUOTATION_STATUSES = ["draft", "sent", "accepted", "converted", "expired"] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];
export const QUOTE_LAYOUTS = ["summary", "detailed"] as const;

export const COUPON_TYPES = ["flat", "percent"] as const;

export const CAMPAIGN_STATUSES = ["pending_payment", "confirmed", "active", "completed", "cancelled"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = { pending_payment: "Pending upfront payment", confirmed: "Campaign confirmed", active: "Live", completed: "Completed", cancelled: "Cancelled" };
export const PAYMENT_PATHS = ["upfront", "emi"] as const;
export type PaymentPath = (typeof PAYMENT_PATHS)[number];
export const PAYMENT_STATUSES = ["pending", "paid"] as const;
export const PAYMENT_KINDS = ["full", "upfront", "emi"] as const;

export const WALLET_KINDS = ["cashback", "bonus", "withdrawal", "adjustment"] as const;

export const AGENCY_EVENTS = [
  "registered", "verified", "assessment_completed", "brand_added", "member_added", "manager_assigned", "asset_uploaded",
  "proposal_created", "proposal_shared", "quotation_created", "quotation_shared", "campaign_locked", "payment_received", "campaign_confirmed", "campaign_live", "work_order_signed", "wallet_credit",
] as const;
export type AgencyEvent = (typeof AGENCY_EVENTS)[number];

/** Commission tiers unlocked by the assessment score (0–10). */
export function commissionForScore(score: number): number {
  if (score >= 9) return 8.4;
  if (score >= 7) return 8.0;
  return 7.5;
}
export const LEVEL2_COMMISSION_BOOST = 2.5;
export const FIRST_ORDER_BONUS = 2500;
export const UPFRONT_CASHBACK_PCT = 5;
export const EMI_UPFRONT_PCT = 50;
export const EMI_MONTHS = 3;
export const BRAND_LOCK_DAYS = 21;
export const TEAM_LIMIT = 5;
export const ADDON_CREATIVE_CHARGE = 3000;
