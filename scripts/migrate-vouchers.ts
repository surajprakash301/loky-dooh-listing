/* One-off: creates the vouchers table and adds the voucher/discount columns to customer_quotations
   on databases created before vouchers existed. Safe to re-run. */
import { sequelize } from "../src/db/models";
import { Voucher } from "../src/db/quote-models";

async function main() {
  await Voucher.sync();
  const cols = await sequelize.getQueryInterface().describeTable("customer_quotations");
  const add: [string, string][] = [
    ["voucher_id", "INTEGER NULL"],
    ["voucher_title", "VARCHAR(80) NULL"],
    ["discount_pct", "DECIMAL(5,2) NOT NULL DEFAULT 0"],
    ["discount_amount", "DECIMAL(12,2) NOT NULL DEFAULT 0"],
  ];
  for (const [name, type] of add) {
    if (name in cols) continue;
    await sequelize.query(`ALTER TABLE customer_quotations ADD COLUMN ${name} ${type}`);
    console.log("added customer_quotations." + name);
  }
  console.log(`vouchers table ready (${await Voucher.count()} rows)`);
  await sequelize.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
