/* Creates every table from the Sequelize models.
   --alter adds/changes columns in place (dev only); --force drops and recreates everything.
   Usage: npm run db:sync   |   npm run db:sync -- --alter   |   npm run db:sync -- --force */
import { sequelize } from "../src/db/models";
import "../src/db/agency-models";
import "../src/db/quote-models";

async function main() {
  const force = process.argv.includes("--force");
  const alter = process.argv.includes("--alter");
  await sequelize.authenticate();
  await sequelize.sync({ force, alter });
  const tables = await sequelize.getQueryInterface().showAllTables();
  console.log(`${force ? "Recreated" : "Synced"} ${tables.length} tables (${sequelize.getDialect()}):`);
  for (const t of tables) console.log("  -", typeof t === "string" ? t : (t as { tableName: string }).tableName);
  await sequelize.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
