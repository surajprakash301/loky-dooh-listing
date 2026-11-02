/* Creates every table from the Sequelize models.
   --alter adds/changes columns in place (dev only); --force drops and recreates everything.
   Usage: npm run db:sync   |   npm run db:sync -- --alter   |   npm run db:sync -- --force */
import { sequelize } from "../src/db/models";
import "../src/db/agency-models";

async function main() {
  const force = process.argv.includes("--force");
  const alter = process.argv.includes("--alter");
  await sequelize.authenticate();
  await sequelize.sync({ force, alter });
  const [rows] = await sequelize.query("SHOW TABLES");
  console.log(`${force ? "Recreated" : "Synced"} ${(rows as unknown[]).length} tables:`);
  for (const r of rows as Record<string, string>[]) console.log("  -", Object.values(r)[0]);
  await sequelize.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
