import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { Billboard, File, User, sequelize } from "./models";
import {
  AGENCY_EVENTS, AGENCY_STATUSES, ASSET_STATUSES, BRAND_STATUSES, CAMPAIGN_STATUSES, COUPON_TYPES, DOOH_EXPERIENCE, FOUNDER_ROLES, PACKAGES, PAYMENT_KINDS, PAYMENT_PATHS, PAYMENT_STATUSES,
  PORTFOLIO_SIZES, PROPOSAL_STATUSES, PROPOSAL_THEMES, QUOTATION_STATUSES, QUOTE_LAYOUTS, VERIFICATION_PATHS, WALLET_KINDS,
  type AgencyEvent, type AgencyStatus, type BrandStatus, type CampaignStatus, type Package, type PaymentPath, type ProposalStatus, type QuotationStatus, type VerificationPath,
} from "@/lib/domain";

const ID = { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true } as const;
const FK = { type: DataTypes.INTEGER.UNSIGNED, allowNull: false } as const;
const FK_NULL = { type: DataTypes.INTEGER.UNSIGNED, allowNull: true } as const;
const MONEY = { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 } as const;
const TS = { createdAt: DataTypes.DATE(3), updatedAt: DataTypes.DATE(3) };

/* ---------- agencies ---------- */
export class Agency extends Model<InferAttributes<Agency>, InferCreationAttributes<Agency>> {
  declare id: CreationOptional<number>;
  declare ownerUserId: ForeignKey<User["id"]>;
  declare legalName: string;
  declare gstNumber: string | null;
  declare addressLine: string;
  declare city: string;
  declare state: string;
  declare pincode: string | null;
  declare logoFileId: ForeignKey<File["id"]> | null;
  declare founderName: string;
  declare founderPhone: string;
  declare founderEmail: string;
  declare founderRole: (typeof FOUNDER_ROLES)[number];
  declare verificationPath: VerificationPath;
  declare verifiedAt: Date | null;
  declare status: CreationOptional<AgencyStatus>;
  declare assessmentScore: number | null;
  declare commissionPct: CreationOptional<number>;
  declare level: CreationOptional<number>;
  declare partnerSince: Date | null;
  declare expertCallbackDueAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare owner?: NonAttribute<User>;
  declare logo?: NonAttribute<File | null>;
  declare members?: NonAttribute<AgencyMember[]>;
  declare brands?: NonAttribute<Brand[]>;
}
Agency.init({
  id: { ...ID }, ownerUserId: { ...FK, unique: true },
  legalName: { type: DataTypes.STRING(191), allowNull: false },
  gstNumber: { type: DataTypes.STRING(15), allowNull: true, unique: true },
  addressLine: { type: DataTypes.STRING(255), allowNull: false },
  city: { type: DataTypes.STRING(80), allowNull: false }, state: { type: DataTypes.STRING(80), allowNull: false }, pincode: { type: DataTypes.STRING(6), allowNull: true },
  logoFileId: { ...FK_NULL },
  founderName: { type: DataTypes.STRING(120), allowNull: false }, founderPhone: { type: DataTypes.STRING(20), allowNull: false }, founderEmail: { type: DataTypes.STRING(191), allowNull: false },
  founderRole: { type: DataTypes.ENUM(...FOUNDER_ROLES), allowNull: false },
  verificationPath: { type: DataTypes.ENUM(...VERIFICATION_PATHS), allowNull: false },
  verifiedAt: { type: DataTypes.DATE(3), allowNull: true },
  status: { type: DataTypes.ENUM(...AGENCY_STATUSES), allowNull: false, defaultValue: "registered" },
  assessmentScore: { type: DataTypes.DECIMAL(4, 1), allowNull: true },
  commissionPct: { type: DataTypes.DECIMAL(4, 1), allowNull: false, defaultValue: 7.5 },
  level: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 1 },
  partnerSince: { type: DataTypes.DATE(3), allowNull: true },
  expertCallbackDueAt: { type: DataTypes.DATE(3), allowNull: true },
  ...TS,
}, { sequelize, tableName: "agencies", indexes: [{ fields: ["status"] }] });

/* ---------- otp_codes ---------- */
export class OtpCode extends Model<InferAttributes<OtpCode>, InferCreationAttributes<OtpCode>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare channel: "email" | "mobile";
  declare code: string;
  declare expiresAt: Date;
  declare consumedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
}
OtpCode.init({
  id: { ...ID }, userId: { ...FK }, channel: { type: DataTypes.ENUM("email", "mobile"), allowNull: false },
  code: { type: DataTypes.STRING(8), allowNull: false }, expiresAt: { type: DataTypes.DATE(3), allowNull: false }, consumedAt: { type: DataTypes.DATE(3), allowNull: true },
  createdAt: DataTypes.DATE(3),
}, { sequelize, tableName: "otp_codes", updatedAt: false, indexes: [{ fields: ["user_id", "channel"] }] });

/* ---------- agency_members ---------- */
export class AgencyMember extends Model<InferAttributes<AgencyMember>, InferCreationAttributes<AgencyMember>> {
  declare id: CreationOptional<number>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare userId: ForeignKey<User["id"]>;
  declare title: string;
  declare isOwner: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user?: NonAttribute<User>;
  declare brands?: NonAttribute<Brand[]>;
}
AgencyMember.init({
  id: { ...ID }, agencyId: { ...FK }, userId: { ...FK, unique: true }, title: { type: DataTypes.STRING(120), allowNull: false },
  isOwner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...TS,
}, { sequelize, tableName: "agency_members", indexes: [{ fields: ["agency_id"] }] });

/* ---------- agency_assessments ---------- */
export class AgencyAssessment extends Model<InferAttributes<AgencyAssessment>, InferCreationAttributes<AgencyAssessment>> {
  declare id: CreationOptional<number>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare services: string[];
  declare sectors: string[];
  declare portfolioSize: (typeof PORTFOLIO_SIZES)[number];
  declare doohExperience: (typeof DOOH_EXPERIENCE)[number];
  declare score: number;
  declare commissionPct: number;
  declare createdAt: CreationOptional<Date>;
}
AgencyAssessment.init({
  id: { ...ID }, agencyId: { ...FK }, services: { type: DataTypes.JSON, allowNull: false }, sectors: { type: DataTypes.JSON, allowNull: false },
  portfolioSize: { type: DataTypes.ENUM(...PORTFOLIO_SIZES), allowNull: false }, doohExperience: { type: DataTypes.ENUM(...DOOH_EXPERIENCE), allowNull: false },
  score: { type: DataTypes.DECIMAL(4, 1), allowNull: false }, commissionPct: { type: DataTypes.DECIMAL(4, 1), allowNull: false }, createdAt: DataTypes.DATE(3),
}, { sequelize, tableName: "agency_assessments", updatedAt: false });

/* ---------- brands ---------- */
export class Brand extends Model<InferAttributes<Brand>, InferCreationAttributes<Brand>> {
  declare id: CreationOptional<number>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare name: string;
  declare hq: string | null;
  declare category: string | null;
  declare website: string | null;
  declare logoFileId: ForeignKey<File["id"]> | null;
  declare managerMemberId: ForeignKey<AgencyMember["id"]> | null;
  declare status: CreationOptional<BrandStatus>;
  declare lockedUntil: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare logo?: NonAttribute<File | null>;
  declare manager?: NonAttribute<AgencyMember | null>;
  declare assets?: NonAttribute<BrandAsset[]>;
  declare campaigns?: NonAttribute<Campaign[]>;
  declare proposals?: NonAttribute<Proposal[]>;
  declare quotations?: NonAttribute<Quotation[]>;
}
Brand.init({
  id: { ...ID }, agencyId: { ...FK }, name: { type: DataTypes.STRING(191), allowNull: false }, hq: { type: DataTypes.STRING(191), allowNull: true },
  category: { type: DataTypes.STRING(80), allowNull: true }, website: { type: DataTypes.STRING(191), allowNull: true }, logoFileId: { ...FK_NULL }, managerMemberId: { ...FK_NULL },
  status: { type: DataTypes.ENUM(...BRAND_STATUSES), allowNull: false, defaultValue: "upcoming" }, lockedUntil: { type: DataTypes.DATE(3), allowNull: true }, ...TS,
}, { sequelize, tableName: "brands", indexes: [{ fields: ["agency_id"] }] });

/* ---------- brand_assets ---------- */
export class BrandAsset extends Model<InferAttributes<BrandAsset>, InferCreationAttributes<BrandAsset>> {
  declare id: CreationOptional<number>;
  declare brandId: ForeignKey<Brand["id"]>;
  declare fileId: ForeignKey<File["id"]>;
  declare name: string;
  declare version: CreationOptional<number>;
  declare specs: string | null;
  declare status: CreationOptional<(typeof ASSET_STATUSES)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare file?: NonAttribute<File>;
  declare brand?: NonAttribute<Brand>;
}
BrandAsset.init({
  id: { ...ID }, brandId: { ...FK }, fileId: { ...FK }, name: { type: DataTypes.STRING(191), allowNull: false }, version: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
  specs: { type: DataTypes.STRING(120), allowNull: true }, status: { type: DataTypes.ENUM(...ASSET_STATUSES), allowNull: false, defaultValue: "reviewing" }, ...TS,
}, { sequelize, tableName: "brand_assets", indexes: [{ fields: ["brand_id"] }] });

/* ---------- proposals ---------- */
export class Proposal extends Model<InferAttributes<Proposal>, InferCreationAttributes<Proposal>> {
  declare id: CreationOptional<number>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare brandId: ForeignKey<Brand["id"]>;
  declare createdBy: ForeignKey<User["id"]>;
  declare title: string;
  declare theme: (typeof PROPOSAL_THEMES)[number];
  declare objective: string | null;
  declare status: CreationOptional<ProposalStatus>;
  declare shareToken: string;
  declare viewCount: CreationOptional<number>;
  declare showAgencyLogo: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare brand?: NonAttribute<Brand>;
  declare agency?: NonAttribute<Agency>;
  declare items?: NonAttribute<ProposalItem[]>;
  declare files?: NonAttribute<ProposalFile[]>;
}
Proposal.init({
  id: { ...ID }, agencyId: { ...FK }, brandId: { ...FK }, createdBy: { ...FK }, title: { type: DataTypes.STRING(191), allowNull: false },
  theme: { type: DataTypes.ENUM(...PROPOSAL_THEMES), allowNull: false, defaultValue: "aesthetic" }, objective: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM(...PROPOSAL_STATUSES), allowNull: false, defaultValue: "draft" }, shareToken: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  viewCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }, showAgencyLogo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, ...TS,
}, { sequelize, tableName: "proposals", indexes: [{ fields: ["agency_id"] }, { fields: ["brand_id"] }] });

export class ProposalItem extends Model<InferAttributes<ProposalItem>, InferCreationAttributes<ProposalItem>> {
  declare id: CreationOptional<number>;
  declare proposalId: ForeignKey<Proposal["id"]>;
  declare billboardId: ForeignKey<Billboard["id"]>;
  declare sortOrder: CreationOptional<number>;
  declare billboard?: NonAttribute<Billboard>;
}
ProposalItem.init({ id: { ...ID }, proposalId: { ...FK }, billboardId: { ...FK }, sortOrder: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 } }, { sequelize, tableName: "proposal_items", timestamps: false, indexes: [{ unique: true, fields: ["proposal_id", "billboard_id"] }] });

export class ProposalFile extends Model<InferAttributes<ProposalFile>, InferCreationAttributes<ProposalFile>> {
  declare id: CreationOptional<number>;
  declare proposalId: ForeignKey<Proposal["id"]>;
  declare fileId: ForeignKey<File["id"]>;
  declare file?: NonAttribute<File>;
}
ProposalFile.init({ id: { ...ID }, proposalId: { ...FK }, fileId: { ...FK } }, { sequelize, tableName: "proposal_files", timestamps: false });

/* ---------- coupons ---------- */
export class Coupon extends Model<InferAttributes<Coupon>, InferCreationAttributes<Coupon>> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare type: (typeof COUPON_TYPES)[number];
  declare value: number;
  declare description: string | null;
  declare isActive: CreationOptional<boolean>;
  declare expiresAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
Coupon.init({
  id: { ...ID }, code: { type: DataTypes.STRING(40), allowNull: false, unique: true }, type: { type: DataTypes.ENUM(...COUPON_TYPES), allowNull: false },
  value: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, description: { type: DataTypes.STRING(191), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, expiresAt: { type: DataTypes.DATE(3), allowNull: true }, ...TS,
}, { sequelize, tableName: "coupons" });

/* ---------- quotations ---------- */
export class Quotation extends Model<InferAttributes<Quotation>, InferCreationAttributes<Quotation>> {
  declare id: CreationOptional<number>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare brandId: ForeignKey<Brand["id"]>;
  declare proposalId: ForeignKey<Proposal["id"]> | null;
  declare createdBy: ForeignKey<User["id"]>;
  declare title: string;
  declare status: CreationOptional<QuotationStatus>;
  declare shareToken: string;
  declare layout: CreationOptional<(typeof QUOTE_LAYOUTS)[number]>;
  declare slotSeconds: number;
  declare package: Package;
  declare baseCost: number;
  declare couponId: ForeignKey<Coupon["id"]> | null;
  declare couponDiscount: CreationOptional<number>;
  declare marginPct: CreationOptional<number>;
  declare marginAmount: CreationOptional<number>;
  declare addonCreatives: CreationOptional<boolean>;
  declare addonAmount: CreationOptional<number>;
  declare total: number;
  declare emiEnabled: CreationOptional<boolean>;
  declare lockUntil: Date | null;
  declare viewCount: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare brand?: NonAttribute<Brand>;
  declare agency?: NonAttribute<Agency>;
  declare coupon?: NonAttribute<Coupon | null>;
  declare items?: NonAttribute<QuotationItem[]>;
  declare campaign?: NonAttribute<Campaign | null>;
}
Quotation.init({
  id: { ...ID }, agencyId: { ...FK }, brandId: { ...FK }, proposalId: { ...FK_NULL }, createdBy: { ...FK }, title: { type: DataTypes.STRING(191), allowNull: false },
  status: { type: DataTypes.ENUM(...QUOTATION_STATUSES), allowNull: false, defaultValue: "draft" }, shareToken: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  layout: { type: DataTypes.ENUM(...QUOTE_LAYOUTS), allowNull: false, defaultValue: "detailed" },
  slotSeconds: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false }, package: { type: DataTypes.ENUM(...PACKAGES), allowNull: false },
  baseCost: { ...MONEY }, couponId: { ...FK_NULL }, couponDiscount: { ...MONEY }, marginPct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 10 }, marginAmount: { ...MONEY },
  addonCreatives: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, addonAmount: { ...MONEY }, total: { ...MONEY },
  emiEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, lockUntil: { type: DataTypes.DATE(3), allowNull: true },
  viewCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }, ...TS,
}, { sequelize, tableName: "quotations", indexes: [{ fields: ["agency_id"] }, { fields: ["brand_id"] }] });

export class QuotationItem extends Model<InferAttributes<QuotationItem>, InferCreationAttributes<QuotationItem>> {
  declare id: CreationOptional<number>;
  declare quotationId: ForeignKey<Quotation["id"]>;
  declare billboardId: ForeignKey<Billboard["id"]>;
  declare listPrice: number;
  declare offerPrice: number;
  declare billboard?: NonAttribute<Billboard>;
}
QuotationItem.init({ id: { ...ID }, quotationId: { ...FK }, billboardId: { ...FK }, listPrice: { ...MONEY }, offerPrice: { ...MONEY } }, { sequelize, tableName: "quotation_items", timestamps: false, indexes: [{ unique: true, fields: ["quotation_id", "billboard_id"] }] });

/* ---------- campaigns (media orders) ---------- */
export class Campaign extends Model<InferAttributes<Campaign>, InferCreationAttributes<Campaign>> {
  declare id: CreationOptional<number>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare brandId: ForeignKey<Brand["id"]>;
  declare quotationId: ForeignKey<Quotation["id"]>;
  declare workOrderNo: string;
  declare title: string;
  declare status: CreationOptional<CampaignStatus>;
  declare paymentPath: PaymentPath;
  declare total: number;
  declare upfrontRequired: number;
  declare paidAmount: CreationOptional<number>;
  declare slotSeconds: number;
  declare package: Package;
  declare startDate: string;
  declare endDate: string;
  declare agreementFileId: ForeignKey<File["id"]> | null;
  declare signedAt: Date | null;
  declare confirmedAt: Date | null;
  declare liveAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare brand?: NonAttribute<Brand>;
  declare agency?: NonAttribute<Agency>;
  declare quotation?: NonAttribute<Quotation>;
  declare screens?: NonAttribute<CampaignScreen[]>;
  declare payments?: NonAttribute<Payment[]>;
  declare agreement?: NonAttribute<File | null>;
}
Campaign.init({
  id: { ...ID }, agencyId: { ...FK }, brandId: { ...FK }, quotationId: { ...FK, unique: true }, workOrderNo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  title: { type: DataTypes.STRING(191), allowNull: false }, status: { type: DataTypes.ENUM(...CAMPAIGN_STATUSES), allowNull: false, defaultValue: "pending_payment" },
  paymentPath: { type: DataTypes.ENUM(...PAYMENT_PATHS), allowNull: false }, total: { ...MONEY }, upfrontRequired: { ...MONEY }, paidAmount: { ...MONEY },
  slotSeconds: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false }, package: { type: DataTypes.ENUM(...PACKAGES), allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false }, endDate: { type: DataTypes.DATEONLY, allowNull: false },
  agreementFileId: { ...FK_NULL }, signedAt: { type: DataTypes.DATE(3), allowNull: true }, confirmedAt: { type: DataTypes.DATE(3), allowNull: true }, liveAt: { type: DataTypes.DATE(3), allowNull: true }, ...TS,
}, { sequelize, tableName: "campaigns", indexes: [{ fields: ["agency_id", "status"] }, { fields: ["brand_id"] }] });

export class CampaignScreen extends Model<InferAttributes<CampaignScreen>, InferCreationAttributes<CampaignScreen>> {
  declare id: CreationOptional<number>;
  declare campaignId: ForeignKey<Campaign["id"]>;
  declare billboardId: ForeignKey<Billboard["id"]>;
  declare amount: number;
  declare billboard?: NonAttribute<Billboard>;
  declare campaign?: NonAttribute<Campaign>;
}
CampaignScreen.init({ id: { ...ID }, campaignId: { ...FK }, billboardId: { ...FK }, amount: { ...MONEY } }, { sequelize, tableName: "campaign_screens", timestamps: false, indexes: [{ fields: ["billboard_id"] }] });

/* ---------- payments ---------- */
export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<number>;
  declare campaignId: ForeignKey<Campaign["id"]>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare kind: (typeof PAYMENT_KINDS)[number];
  declare installmentNo: number;
  declare amount: number;
  declare dueDate: string;
  declare status: CreationOptional<(typeof PAYMENT_STATUSES)[number]>;
  declare paidAt: Date | null;
  declare method: string | null;
  declare reference: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare campaign?: NonAttribute<Campaign>;
}
Payment.init({
  id: { ...ID }, campaignId: { ...FK }, agencyId: { ...FK }, kind: { type: DataTypes.ENUM(...PAYMENT_KINDS), allowNull: false }, installmentNo: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 1 },
  amount: { ...MONEY }, dueDate: { type: DataTypes.DATEONLY, allowNull: false }, status: { type: DataTypes.ENUM(...PAYMENT_STATUSES), allowNull: false, defaultValue: "pending" },
  paidAt: { type: DataTypes.DATE(3), allowNull: true }, method: { type: DataTypes.STRING(40), allowNull: true }, reference: { type: DataTypes.STRING(80), allowNull: true }, ...TS,
}, { sequelize, tableName: "payments", indexes: [{ fields: ["agency_id", "status"] }, { fields: ["campaign_id"] }] });

/* ---------- wallet_transactions ---------- */
export class WalletTransaction extends Model<InferAttributes<WalletTransaction>, InferCreationAttributes<WalletTransaction>> {
  declare id: CreationOptional<number>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare kind: (typeof WALLET_KINDS)[number];
  declare amount: number;
  declare note: string | null;
  declare campaignId: ForeignKey<Campaign["id"]> | null;
  declare createdAt: CreationOptional<Date>;
}
WalletTransaction.init({
  id: { ...ID }, agencyId: { ...FK }, kind: { type: DataTypes.ENUM(...WALLET_KINDS), allowNull: false }, amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  note: { type: DataTypes.STRING(191), allowNull: true }, campaignId: { ...FK_NULL }, createdAt: DataTypes.DATE(3),
}, { sequelize, tableName: "wallet_transactions", updatedAt: false, indexes: [{ fields: ["agency_id"] }] });

/* ---------- agency_activity ---------- */
export class AgencyActivity extends Model<InferAttributes<AgencyActivity>, InferCreationAttributes<AgencyActivity>> {
  declare id: CreationOptional<number>;
  declare agencyId: ForeignKey<Agency["id"]>;
  declare actorId: ForeignKey<User["id"]> | null;
  declare action: AgencyEvent;
  declare message: string;
  declare createdAt: CreationOptional<Date>;
  declare actor?: NonAttribute<User | null>;
}
AgencyActivity.init({
  id: { ...ID }, agencyId: { ...FK }, actorId: { ...FK_NULL }, action: { type: DataTypes.ENUM(...AGENCY_EVENTS), allowNull: false }, message: { type: DataTypes.STRING(255), allowNull: false }, createdAt: DataTypes.DATE(3),
}, { sequelize, tableName: "agency_activity", updatedAt: false, indexes: [{ fields: ["agency_id", "created_at"] }] });

/* ---------- associations (guarded: dev hot-reload re-evaluates this module while the core models persist) ---------- */
if (!User.associations.agencyMembership) {

Agency.belongsTo(User, { as: "owner", foreignKey: "ownerUserId" });
Agency.belongsTo(File, { as: "logo", foreignKey: "logoFileId" });
Agency.hasMany(AgencyMember, { as: "members", foreignKey: "agencyId" });
Agency.hasMany(Brand, { as: "brands", foreignKey: "agencyId" });
AgencyMember.belongsTo(User, { as: "user", foreignKey: "userId" });
AgencyMember.belongsTo(Agency, { as: "agency", foreignKey: "agencyId" });
AgencyMember.hasMany(Brand, { as: "brands", foreignKey: "managerMemberId" });
User.hasOne(AgencyMember, { as: "agencyMembership", foreignKey: "userId" });
Brand.belongsTo(Agency, { as: "agency", foreignKey: "agencyId" });
Brand.belongsTo(File, { as: "logo", foreignKey: "logoFileId" });
Brand.belongsTo(AgencyMember, { as: "manager", foreignKey: "managerMemberId" });
Brand.hasMany(BrandAsset, { as: "assets", foreignKey: "brandId" });
Brand.hasMany(Campaign, { as: "campaigns", foreignKey: "brandId" });
Brand.hasMany(Proposal, { as: "proposals", foreignKey: "brandId" });
Brand.hasMany(Quotation, { as: "quotations", foreignKey: "brandId" });
BrandAsset.belongsTo(File, { as: "file", foreignKey: "fileId" });
BrandAsset.belongsTo(Brand, { as: "brand", foreignKey: "brandId" });
Proposal.belongsTo(Brand, { as: "brand", foreignKey: "brandId" });
Proposal.belongsTo(Agency, { as: "agency", foreignKey: "agencyId" });
Proposal.hasMany(ProposalItem, { as: "items", foreignKey: "proposalId" });
Proposal.hasMany(ProposalFile, { as: "files", foreignKey: "proposalId" });
ProposalItem.belongsTo(Billboard, { as: "billboard", foreignKey: "billboardId" });
ProposalFile.belongsTo(File, { as: "file", foreignKey: "fileId" });
Quotation.belongsTo(Brand, { as: "brand", foreignKey: "brandId" });
Quotation.belongsTo(Agency, { as: "agency", foreignKey: "agencyId" });
Quotation.belongsTo(Coupon, { as: "coupon", foreignKey: "couponId" });
Quotation.hasMany(QuotationItem, { as: "items", foreignKey: "quotationId" });
Quotation.hasOne(Campaign, { as: "campaign", foreignKey: "quotationId" });
QuotationItem.belongsTo(Billboard, { as: "billboard", foreignKey: "billboardId" });
Campaign.belongsTo(Brand, { as: "brand", foreignKey: "brandId" });
Campaign.belongsTo(Agency, { as: "agency", foreignKey: "agencyId" });
Campaign.belongsTo(Quotation, { as: "quotation", foreignKey: "quotationId" });
Campaign.belongsTo(File, { as: "agreement", foreignKey: "agreementFileId" });
Campaign.hasMany(CampaignScreen, { as: "screens", foreignKey: "campaignId" });
Campaign.hasMany(Payment, { as: "payments", foreignKey: "campaignId" });
CampaignScreen.belongsTo(Billboard, { as: "billboard", foreignKey: "billboardId" });
CampaignScreen.belongsTo(Campaign, { as: "campaign", foreignKey: "campaignId" });
Billboard.hasMany(CampaignScreen, { as: "bookings", foreignKey: "billboardId" });
Payment.belongsTo(Campaign, { as: "campaign", foreignKey: "campaignId" });
AgencyActivity.belongsTo(User, { as: "actor", foreignKey: "actorId" });
}
