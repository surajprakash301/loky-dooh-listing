/* One-off: adds customer_quotations.logo_file_id to databases created before the brand logo existed. Safe to re-run. */
import { sequelize } from "../src/db/models";
async function main() {
  const qi = sequelize.getQueryInterface();
  const cols = await qi.describeTable("customer_quotations");
  if ("logo_file_id" in cols) console.log("logo_file_id already present");
  else {
    await sequelize.query("ALTER TABLE customer_quotations ADD COLUMN logo_file_id INTEGER NULL");
    console.log("added customer_quotations.logo_file_id");
  }
  await sequelize.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
