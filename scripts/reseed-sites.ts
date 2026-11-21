/* Replaces every billboard in the database with the real Loky Media network from
   scripts/data/lokymedia-sites.json (run scripts/import-lokymedia.ts first to refresh that file).
   Usage: npm run db:reseed-sites */
import { Billboard, User, Vendor, sequelize } from "../src/db/models";
import "../src/db/agency-models";
import "../src/db/quote-models";
import { purgeOtherBillboards, upsertSites } from "./lib/sites";

async function main() {
  await sequelize.authenticate();
  const vendor = await Vendor.findOne({ where: { status: "approved" }, order: [["id", "ASC"]] });
  const admin = await User.findOne({ where: { role: "admin" } });
  const rep = (vendor && (await User.findByPk(vendor.onboardedBy))) ?? admin;
  if (!vendor || !admin || !rep) throw new Error("Run db:seed first: an approved vendor and an admin are needed to own the sites.");
  const removed = await purgeOtherBillboards();
  for (const r of removed) console.log("removed ", r);
  const { created, updated } = await upsertSites(vendor.id, rep.id, admin.id);
  for (const b of created) console.log("created ", b.code, b.name);
  for (const b of updated) console.log("updated ", b.code, b.name);
  console.log(`\n${await Billboard.count()} billboards now, all from the live catalogue, owned by ${vendor.tradeName}.`);
  await sequelize.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
