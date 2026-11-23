import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { Billboard, File, User, sequelize } from "./models";
import { QUOTE_STATUSES, type Package, type QuoteStatus } from "@/lib/domain";

const ID = { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true } as const;
const FK = { type: DataTypes.INTEGER, allowNull: false } as const;
const MONEY = { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 } as const;
const TS = { createdAt: DataTypes.DATE(3), updatedAt: DataTypes.DATE(3) };

/* ---------- vouchers: admin-made percentage discounts advertisers can apply to a quotation ---------- */
export class Voucher extends Model<InferAttributes<Voucher>, InferCreationAttributes<Voucher>> {
  declare id: CreationOptional<number>;
  declare title: string;
  /** short line under the title, e.g. "Festive season offer" */
  declare subtitle: string | null;
  declare discountPct: number;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
Voucher.init(
  {
    id: { ...ID },
    title: { type: DataTypes.STRING(80), allowNull: false },
    subtitle: { type: DataTypes.STRING(160), allowNull: true },
    discountPct: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...TS,
  },
  { sequelize, modelName: "Voucher", tableName: "vouchers" },
);

/* ---------- customer_quotations: a self-serve quote built from the marketplace / map ---------- */
export class CustomerQuotation extends Model<InferAttributes<CustomerQuotation>, InferCreationAttributes<CustomerQuotation>> {
  declare id: CreationOptional<number>;
  declare number: string;
  declare userId: ForeignKey<User["id"]>;
  declare shareToken: string;
  declare status: CreationOptional<QuoteStatus>;
  /** Who the quotation is prepared for, as typed at the time. */
  declare clientName: string;
  declare clientEmail: string;
  declare clientPhone: string;
  declare company: string | null;
  /** Brand logo uploaded with the quotation (optional), shown beside the company name. */
  declare logoFileId: ForeignKey<File["id"]> | null;
  declare city: string;
  declare months: number;
  declare slotSeconds: number;
  declare package: Package;
  declare subtotal: number;
  /** Voucher applied at quotation time; title and percentage are frozen here so later edits or deletion do not change the quotation. */
  declare voucherId: ForeignKey<Voucher["id"]> | null;
  declare voucherTitle: string | null;
  declare discountPct: CreationOptional<number>;
  declare discountAmount: CreationOptional<number>;
  declare gstPct: number;
  declare gstAmount: number;
  declare total: number;
  declare validUntil: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare items?: NonAttribute<CustomerQuotationItem[]>;
  declare user?: NonAttribute<User>;
  declare logo?: NonAttribute<File | null>;
}
CustomerQuotation.init(
  {
    id: { ...ID },
    number: { type: DataTypes.STRING(24), allowNull: false, unique: true },
    userId: { ...FK },
    shareToken: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    status: { type: DataTypes.ENUM(...QUOTE_STATUSES), allowNull: false, defaultValue: "active" },
    clientName: { type: DataTypes.STRING(120), allowNull: false },
    clientEmail: { type: DataTypes.STRING(191), allowNull: false },
    clientPhone: { type: DataTypes.STRING(20), allowNull: false },
    company: { type: DataTypes.STRING(120), allowNull: true },
    logoFileId: { type: DataTypes.INTEGER, allowNull: true },
    city: { type: DataTypes.STRING(80), allowNull: false },
    months: { type: DataTypes.SMALLINT, allowNull: false },
    slotSeconds: { type: DataTypes.SMALLINT, allowNull: false },
    package: { type: DataTypes.STRING(12), allowNull: false },
    subtotal: { ...MONEY },
    voucherId: { type: DataTypes.INTEGER, allowNull: true },
    voucherTitle: { type: DataTypes.STRING(80), allowNull: true },
    discountPct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    discountAmount: { ...MONEY },
    gstPct: { type: DataTypes.DECIMAL(4, 1), allowNull: false, defaultValue: 18 },
    gstAmount: { ...MONEY },
    total: { ...MONEY },
    validUntil: { type: DataTypes.DATE(3), allowNull: false },
    ...TS,
  },
  { sequelize, modelName: "CustomerQuotation", tableName: "customer_quotations", indexes: [{ fields: ["user_id"] }] },
);

/* ---------- customer_quotation_items: one row per billboard, prices frozen at quote time ---------- */
export class CustomerQuotationItem extends Model<InferAttributes<CustomerQuotationItem>, InferCreationAttributes<CustomerQuotationItem>> {
  declare id: CreationOptional<number>;
  declare quotationId: ForeignKey<CustomerQuotation["id"]>;
  declare billboardId: ForeignKey<Billboard["id"]>;
  declare sortOrder: number;
  /** Per-month rates as they stood when the quote was made. */
  declare listPerMonth: number;
  declare netPerMonth: number;
  declare months: number;
  declare lineTotal: number;
  declare createdAt: CreationOptional<Date>;
  declare billboard?: NonAttribute<Billboard>;
}
CustomerQuotationItem.init(
  {
    id: { ...ID },
    quotationId: { ...FK },
    billboardId: { ...FK },
    sortOrder: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
    listPerMonth: { ...MONEY },
    netPerMonth: { ...MONEY },
    months: { type: DataTypes.SMALLINT, allowNull: false },
    lineTotal: { ...MONEY },
    createdAt: DataTypes.DATE(3),
  },
  { sequelize, modelName: "CustomerQuotationItem", tableName: "customer_quotation_items", updatedAt: false, indexes: [{ fields: ["quotation_id"] }] },
);

CustomerQuotation.belongsTo(User, { as: "user", foreignKey: "userId" });
CustomerQuotation.belongsTo(File, { as: "logo", foreignKey: "logoFileId", constraints: false });
// guarded: in development this module can be re-evaluated by hot reload while `User` (models.ts) is not
if (!User.associations.quotations) User.hasMany(CustomerQuotation, { as: "quotations", foreignKey: "userId" });
CustomerQuotation.hasMany(CustomerQuotationItem, { as: "items", foreignKey: "quotationId", onDelete: "CASCADE" });
CustomerQuotationItem.belongsTo(CustomerQuotation, { as: "quotation", foreignKey: "quotationId" });
CustomerQuotationItem.belongsTo(Billboard, { as: "billboard", foreignKey: "billboardId" });
