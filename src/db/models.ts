import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import { getSequelize } from "./sequelize";

import {
  BILLBOARD_STATUSES,
  BUSINESS_TYPES,
  DOC_TYPES,
  EVENT_ACTIONS,
  LIVE_STATUSES,
  MEDIA_KINDS,
  PACKAGES,
  ROLES,
  SCREEN_TYPES,
  SECTIONS,
  SECTION_STATUSES,
  TIERS,
  VENDOR_STATUSES,
  type BillboardStatus,
  type BusinessType,
  type DocType,
  type EventAction,
  type LiveStatus,
  type MediaKind,
  type Package,
  type Role,
  type ScreenType,
  type Section,
  type SectionStatus,
  type Tier,
  type VendorStatus,
} from "@/lib/domain";

export * from "@/lib/domain";

const sequelize = getSequelize();
const ID = { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true } as const;
const FK = { type: DataTypes.INTEGER.UNSIGNED, allowNull: false } as const;
const FK_NULL = { type: DataTypes.INTEGER.UNSIGNED, allowNull: true } as const;

/* ---------- users ---------- */

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare role: Role;
  declare username: string;
  declare email: string | null;
  declare phone: string | null;
  declare name: string;
  declare passwordHash: string;
  declare mustChangePassword: CreationOptional<boolean>;
  declare status: CreationOptional<"active" | "disabled">;
  declare lastLoginAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare vendor?: NonAttribute<Vendor>;
  declare agencyMembership?: NonAttribute<import("./agency-models").AgencyMember | null>;
}
User.init(
  {
    id: { ...ID },
    role: { type: DataTypes.ENUM(...ROLES), allowNull: false },
    username: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(191), allowNull: true, unique: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    mustChangePassword: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status: { type: DataTypes.ENUM("active", "disabled"), allowNull: false, defaultValue: "active" },
    lastLoginAt: { type: DataTypes.DATE(3), allowNull: true },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  { sequelize, tableName: "users" },
);

/* ---------- files ---------- */

export class File extends Model<InferAttributes<File>, InferCreationAttributes<File>> {
  declare id: CreationOptional<number>;
  declare storageKey: string;
  declare publicUrl: string | null;
  declare originalName: string;
  declare mimeType: string;
  declare sizeBytes: number;
  declare uploadedBy: ForeignKey<User["id"]>;
  declare createdAt: CreationOptional<Date>;
}
File.init(
  {
    id: { ...ID },
    storageKey: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    publicUrl: { type: DataTypes.STRING(500), allowNull: true },
    originalName: { type: DataTypes.STRING(255), allowNull: false },
    mimeType: { type: DataTypes.STRING(100), allowNull: false },
    sizeBytes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    uploadedBy: { ...FK },
    createdAt: DataTypes.DATE(3),
  },
  { sequelize, tableName: "files", updatedAt: false },
);

/* ---------- vendors ---------- */

export class Vendor extends Model<InferAttributes<Vendor>, InferCreationAttributes<Vendor>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]> | null;
  declare onboardedBy: ForeignKey<User["id"]>;
  declare legalName: string | null;
  declare tradeName: string | null;
  declare businessType: BusinessType | null;
  declare gstNumber: string | null;
  declare panNumber: string | null;
  declare addressLine: string | null;
  declare city: string | null;
  declare state: string | null;
  declare pincode: string | null;
  declare logoFileId: ForeignKey<File["id"]> | null;
  declare status: CreationOptional<VendorStatus>;
  declare submittedAt: Date | null;
  declare approvedAt: Date | null;
  declare approvedBy: ForeignKey<User["id"]> | null;
  declare rejectionReason: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare user?: NonAttribute<User | null>;
  declare representative?: NonAttribute<User>;
  declare logo?: NonAttribute<File | null>;
  declare contacts?: NonAttribute<VendorContact[]>;
  declare bankAccount?: NonAttribute<VendorBankAccount | null>;
  declare documents?: NonAttribute<VendorDocument[]>;
  declare billboards?: NonAttribute<Billboard[]>;
  declare reviewSections?: NonAttribute<ReviewSection[]>;
  declare events?: NonAttribute<OnboardingEvent[]>;
}
Vendor.init(
  {
    id: { ...ID },
    userId: { ...FK_NULL, unique: true },
    onboardedBy: { ...FK },
    legalName: { type: DataTypes.STRING(191), allowNull: true },
    tradeName: { type: DataTypes.STRING(191), allowNull: true },
    businessType: { type: DataTypes.ENUM(...BUSINESS_TYPES), allowNull: true },
    gstNumber: { type: DataTypes.STRING(15), allowNull: true, unique: true },
    panNumber: { type: DataTypes.STRING(10), allowNull: true },
    addressLine: { type: DataTypes.STRING(255), allowNull: true },
    city: { type: DataTypes.STRING(80), allowNull: true },
    state: { type: DataTypes.STRING(80), allowNull: true },
    pincode: { type: DataTypes.STRING(6), allowNull: true },
    logoFileId: { ...FK_NULL },
    status: { type: DataTypes.ENUM(...VENDOR_STATUSES), allowNull: false, defaultValue: "draft" },
    submittedAt: { type: DataTypes.DATE(3), allowNull: true },
    approvedAt: { type: DataTypes.DATE(3), allowNull: true },
    approvedBy: { ...FK_NULL },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  {
    sequelize,
    tableName: "vendors",
    indexes: [{ fields: ["status"] }, { fields: ["onboarded_by", "status"] }],
  },
);

/* ---------- vendor_contacts ---------- */

export class VendorContact extends Model<InferAttributes<VendorContact>, InferCreationAttributes<VendorContact>> {
  declare id: CreationOptional<number>;
  declare vendorId: ForeignKey<Vendor["id"]>;
  declare name: string;
  declare designation: string | null;
  declare phone: string;
  declare email: string | null;
  declare isPrimary: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
VendorContact.init(
  {
    id: { ...ID },
    vendorId: { ...FK },
    name: { type: DataTypes.STRING(120), allowNull: false },
    designation: { type: DataTypes.STRING(120), allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING(191), allowNull: true },
    isPrimary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  { sequelize, tableName: "vendor_contacts", indexes: [{ fields: ["vendor_id"] }] },
);

/* ---------- vendor_bank_accounts ---------- */

export class VendorBankAccount extends Model<
  InferAttributes<VendorBankAccount>,
  InferCreationAttributes<VendorBankAccount>
> {
  declare id: CreationOptional<number>;
  declare vendorId: ForeignKey<Vendor["id"]>;
  declare accountHolder: string;
  declare bankName: string;
  declare branch: string | null;
  declare accountNumberEnc: Buffer;
  declare accountLast4: string;
  declare ifsc: string;
  declare upiId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
VendorBankAccount.init(
  {
    id: { ...ID },
    vendorId: { ...FK, unique: true },
    accountHolder: { type: DataTypes.STRING(120), allowNull: false },
    bankName: { type: DataTypes.STRING(120), allowNull: false },
    branch: { type: DataTypes.STRING(120), allowNull: true },
    accountNumberEnc: { type: DataTypes.BLOB, allowNull: false },
    accountLast4: { type: DataTypes.STRING(4), allowNull: false },
    ifsc: { type: DataTypes.STRING(11), allowNull: false },
    upiId: { type: DataTypes.STRING(80), allowNull: true },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  { sequelize, tableName: "vendor_bank_accounts" },
);

/* ---------- vendor_documents ---------- */

export class VendorDocument extends Model<InferAttributes<VendorDocument>, InferCreationAttributes<VendorDocument>> {
  declare id: CreationOptional<number>;
  declare vendorId: ForeignKey<Vendor["id"]>;
  declare docType: DocType;
  declare fileId: ForeignKey<File["id"]>;
  declare docNumber: string | null;
  declare expiresAt: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare file?: NonAttribute<File>;
  declare vendor?: NonAttribute<Vendor>;
}
VendorDocument.init(
  {
    id: { ...ID },
    vendorId: { ...FK },
    docType: { type: DataTypes.ENUM(...DOC_TYPES), allowNull: false },
    fileId: { ...FK },
    docNumber: { type: DataTypes.STRING(64), allowNull: true },
    expiresAt: { type: DataTypes.DATEONLY, allowNull: true },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  { sequelize, tableName: "vendor_documents", indexes: [{ fields: ["vendor_id"] }] },
);

/* ---------- categories ---------- */

export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  declare id: CreationOptional<number>;
  declare slug: string;
  declare name: string;
  declare icon: string;
  declare sortOrder: CreationOptional<number>;
}
Category.init(
  {
    id: { ...ID },
    slug: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(80), allowNull: false },
    icon: { type: DataTypes.STRING(40), allowNull: false },
    sortOrder: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: "categories", timestamps: false },
);

/* ---------- billboards ---------- */

export class Billboard extends Model<InferAttributes<Billboard>, InferCreationAttributes<Billboard>> {
  declare id: CreationOptional<number>;
  declare vendorId: ForeignKey<Vendor["id"]>;
  declare code: string;
  declare name: string;
  declare categoryId: ForeignKey<Category["id"]>;
  declare tier: Tier;
  declare addressLine: string;
  declare landmark: string | null;
  declare locality: string;
  declare city: string;
  declare state: string;
  declare pincode: string | null;
  declare lat: number | null;
  declare lng: number | null;
  declare screenType: ScreenType;
  declare widthFt: number;
  declare heightFt: number;
  declare pixelPitch: string | null;
  declare refreshRateHz: number | null;
  declare brightnessNits: number | null;
  declare viewingAngleH: number | null;
  declare viewingAngleV: number | null;
  declare opsStart: string;
  declare opsEnd: string;
  declare loopSeconds: number;
  declare slotsPerLoop: number;
  declare dailyImpressions: number;
  declare lokySense: CreationOptional<boolean>;
  declare description: string | null;
  declare status: CreationOptional<BillboardStatus>;
  declare liveStatus: LiveStatus | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare vendor?: NonAttribute<Vendor>;
  declare category?: NonAttribute<Category>;
  declare media?: NonAttribute<BillboardMedia[]>;
  declare pricing?: NonAttribute<BillboardSlotPricing[]>;
  /** campaign_screens rows; defined in agency-models to avoid a circular import */
  declare bookings?: NonAttribute<import("./agency-models").CampaignScreen[]>;
}
Billboard.init(
  {
    id: { ...ID },
    vendorId: { ...FK },
    code: { type: DataTypes.STRING(5), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(191), allowNull: false },
    categoryId: { ...FK },
    tier: { type: DataTypes.ENUM(...TIERS), allowNull: false, defaultValue: "partner" },
    addressLine: { type: DataTypes.STRING(255), allowNull: false },
    landmark: { type: DataTypes.STRING(255), allowNull: true },
    locality: { type: DataTypes.STRING(80), allowNull: false },
    city: { type: DataTypes.STRING(80), allowNull: false },
    state: { type: DataTypes.STRING(80), allowNull: false },
    pincode: { type: DataTypes.STRING(6), allowNull: true },
    lat: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    lng: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    screenType: { type: DataTypes.ENUM(...SCREEN_TYPES), allowNull: false, defaultValue: "led" },
    widthFt: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    heightFt: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    pixelPitch: { type: DataTypes.STRING(10), allowNull: true },
    refreshRateHz: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
    brightnessNits: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
    viewingAngleH: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
    viewingAngleV: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
    opsStart: { type: DataTypes.STRING(5), allowNull: false },
    opsEnd: { type: DataTypes.STRING(5), allowNull: false },
    loopSeconds: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
    slotsPerLoop: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    dailyImpressions: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    lokySense: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM(...BILLBOARD_STATUSES), allowNull: false, defaultValue: "draft" },
    liveStatus: { type: DataTypes.ENUM(...LIVE_STATUSES), allowNull: true },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  {
    sequelize,
    tableName: "billboards",
    indexes: [{ fields: ["status", "city", "locality"] }, { fields: ["vendor_id"] }, { fields: ["category_id"] }],
  },
);

/* ---------- billboard_media ---------- */

export class BillboardMedia extends Model<InferAttributes<BillboardMedia>, InferCreationAttributes<BillboardMedia>> {
  declare id: CreationOptional<number>;
  declare billboardId: ForeignKey<Billboard["id"]>;
  declare fileId: ForeignKey<File["id"]>;
  declare kind: MediaKind;
  declare sortOrder: CreationOptional<number>;
  declare isCover: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare file?: NonAttribute<File>;
  declare billboard?: NonAttribute<Billboard>;
}
BillboardMedia.init(
  {
    id: { ...ID },
    billboardId: { ...FK },
    fileId: { ...FK },
    kind: { type: DataTypes.ENUM(...MEDIA_KINDS), allowNull: false },
    sortOrder: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
    isCover: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  { sequelize, tableName: "billboard_media", indexes: [{ fields: ["billboard_id"] }] },
);

/* ---------- billboard_slot_pricing ---------- */

export class BillboardSlotPricing extends Model<
  InferAttributes<BillboardSlotPricing>,
  InferCreationAttributes<BillboardSlotPricing>
> {
  declare id: CreationOptional<number>;
  declare billboardId: ForeignKey<Billboard["id"]>;
  declare slotSeconds: number;
  declare package: Package;
  declare listPrice: number;
  declare offerPrice: number;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
BillboardSlotPricing.init(
  {
    id: { ...ID },
    billboardId: { ...FK },
    slotSeconds: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    package: { type: DataTypes.ENUM(...PACKAGES), allowNull: false },
    listPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    offerPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  {
    sequelize,
    tableName: "billboard_slot_pricing",
    indexes: [{ unique: true, fields: ["billboard_id", "slot_seconds", "package"] }],
  },
);

/* ---------- review_sections ---------- */

export class ReviewSection extends Model<InferAttributes<ReviewSection>, InferCreationAttributes<ReviewSection>> {
  declare id: CreationOptional<number>;
  declare vendorId: ForeignKey<Vendor["id"]>;
  declare section: Section;
  declare billboardId: ForeignKey<Billboard["id"]> | null;
  declare status: CreationOptional<SectionStatus>;
  declare remark: string | null;
  declare round: CreationOptional<number>;
  declare reviewedBy: ForeignKey<User["id"]> | null;
  declare reviewedAt: Date | null;
  /** When the representative last saved this section; compared with reviewedAt by the resubmit gate. */
  declare lastEditedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare billboard?: NonAttribute<Billboard | null>;
  declare reviewer?: NonAttribute<User | null>;
}
ReviewSection.init(
  {
    id: { ...ID },
    vendorId: { ...FK },
    section: { type: DataTypes.ENUM(...SECTIONS), allowNull: false },
    billboardId: { ...FK_NULL },
    status: { type: DataTypes.ENUM(...SECTION_STATUSES), allowNull: false, defaultValue: "pending" },
    remark: { type: DataTypes.TEXT, allowNull: true },
    round: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
    reviewedBy: { ...FK_NULL },
    reviewedAt: { type: DataTypes.DATE(3), allowNull: true },
    lastEditedAt: { type: DataTypes.DATE(3), allowNull: true },
    createdAt: DataTypes.DATE(3),
    updatedAt: DataTypes.DATE(3),
  },
  {
    sequelize,
    tableName: "review_sections",
    indexes: [{ unique: true, fields: ["vendor_id", "section", "billboard_id"] }],
  },
);

/* ---------- onboarding_events ---------- */

export class OnboardingEvent extends Model<InferAttributes<OnboardingEvent>, InferCreationAttributes<OnboardingEvent>> {
  declare id: CreationOptional<number>;
  declare vendorId: ForeignKey<Vendor["id"]>;
  declare section: Section | null;
  declare billboardId: ForeignKey<Billboard["id"]> | null;
  declare actorId: ForeignKey<User["id"]>;
  declare action: EventAction;
  declare remark: string | null;
  declare createdAt: CreationOptional<Date>;
  declare actor?: NonAttribute<User>;
}
OnboardingEvent.init(
  {
    id: { ...ID },
    vendorId: { ...FK },
    section: { type: DataTypes.ENUM(...SECTIONS), allowNull: true },
    billboardId: { ...FK_NULL },
    actorId: { ...FK },
    action: { type: DataTypes.ENUM(...EVENT_ACTIONS), allowNull: false },
    remark: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE(3),
  },
  { sequelize, tableName: "onboarding_events", updatedAt: false, indexes: [{ fields: ["vendor_id", "created_at"] }] },
);

/* ---------- associations (guarded against hot-reload double registration) ---------- */
if (!Vendor.associations.user) {

Vendor.belongsTo(User, { as: "user", foreignKey: "userId" });
Vendor.belongsTo(User, { as: "representative", foreignKey: "onboardedBy" });
Vendor.belongsTo(User, { as: "approver", foreignKey: "approvedBy" });
Vendor.belongsTo(File, { as: "logo", foreignKey: "logoFileId" });
User.hasOne(Vendor, { as: "vendor", foreignKey: "userId" });

Vendor.hasMany(VendorContact, { as: "contacts", foreignKey: "vendorId" });
Vendor.hasOne(VendorBankAccount, { as: "bankAccount", foreignKey: "vendorId" });
Vendor.hasMany(VendorDocument, { as: "documents", foreignKey: "vendorId" });
Vendor.hasMany(Billboard, { as: "billboards", foreignKey: "vendorId" });
Vendor.hasMany(ReviewSection, { as: "reviewSections", foreignKey: "vendorId" });
Vendor.hasMany(OnboardingEvent, { as: "events", foreignKey: "vendorId" });

VendorDocument.belongsTo(File, { as: "file", foreignKey: "fileId" });
VendorDocument.belongsTo(Vendor, { as: "vendor", foreignKey: "vendorId" });
File.belongsTo(User, { as: "uploader", foreignKey: "uploadedBy" });

Billboard.belongsTo(Vendor, { as: "vendor", foreignKey: "vendorId" });
Billboard.belongsTo(Category, { as: "category", foreignKey: "categoryId" });
Billboard.hasMany(BillboardMedia, { as: "media", foreignKey: "billboardId" });
Billboard.hasMany(BillboardSlotPricing, { as: "pricing", foreignKey: "billboardId" });
BillboardMedia.belongsTo(File, { as: "file", foreignKey: "fileId" });
BillboardMedia.belongsTo(Billboard, { as: "billboard", foreignKey: "billboardId" });
BillboardSlotPricing.belongsTo(Billboard, { as: "billboard", foreignKey: "billboardId" });

ReviewSection.belongsTo(Billboard, { as: "billboard", foreignKey: "billboardId" });
ReviewSection.belongsTo(User, { as: "reviewer", foreignKey: "reviewedBy" });
OnboardingEvent.belongsTo(User, { as: "actor", foreignKey: "actorId" });
}

export { sequelize };
