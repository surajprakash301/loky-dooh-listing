/**
 * End-to-end check of the whole onboarding lifecycle against a running dev server:
 * representative → admin review loop → auto-approval → customer site → vendor login → customer signup → reject.
 * Run: npm run e2e   (needs `npm run dev` on :3000, a seeded DB, and Google Chrome installed)
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.E2E_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FX = (f) => path.join(HERE, "fixtures", f);
mkdirSync(path.join(HERE, "shots"), { recursive: true });
const SHOT = (n) => path.join(HERE, "shots", `${String(step++).padStart(2, "0")}-${n}.png`);
let step = 1;
const stamp = Date.now().toString().slice(-5);
const results = [];
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };

const browser = await chromium.launch({ executablePath: CHROME, headless: process.env.E2E_HEADLESS !== "0", slowMo: process.env.E2E_HEADLESS === "0" ? 150 : 0, args: ["--window-size=1440,960", "--window-position=40,40"] });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(30000);

async function login(username, password) {
  await ctx.clearCookies();
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login")), page.click('button[type="submit"]')]);
}

/* ---------- 1. representative onboards a vendor ---------- */
await login("rep.anita", "Rep@12345");
ok("rep lands on /rep", page.url().endsWith("/rep"));
await page.goto(`${BASE}/admin/vendors`);
ok("rep cannot open admin (redirected)", page.url().endsWith("/rep"), page.url());

await page.goto(`${BASE}/rep/new`);
await Promise.all([page.waitForURL(/\/rep\/onboard\/\d+\/business/), page.click('button:has-text("Start onboarding")')]);
const vendorId = page.url().match(/onboard\/(\d+)/)[1];
ok("draft created", !!vendorId, `vendor ${vendorId}`);

// business: first try an invalid GST to see validation
await page.fill('input[name="legalName"]', `E2E Screens ${stamp} Pvt Ltd`);
await page.fill('input[name="tradeName"]', `E2E Screens ${stamp}`);
await page.fill('input[name="gstNumber"]', "BADGST");
await page.fill('input[name="panNumber"]', "AAACE1234F");
await page.fill('input[name="addressLine"]', "12 MG Road");
await page.fill('input[name="city"]', "Bangalore");
await page.fill('input[name="state"]', "Karnataka");
await page.fill('input[name="pincode"]', "560001");
await page.setInputFiles('input[name="logo"]', FX("logo.png"));
await page.click('button:has-text("Save & continue")');
await page.waitForSelector("text=Not a valid GSTIN");
ok("business: invalid GSTIN rejected", true);
await page.fill('input[name="gstNumber"]', `29AAACE${stamp.slice(0,4)}F1Z5`);
await Promise.all([page.waitForURL(/contacts/), page.click('button:has-text("Save & continue")')]);
ok("business saved → contacts", true);
await page.screenshot({ path: SHOT("rep-contacts"), fullPage: true });

await page.fill('input[name="primary.name"]', "Ravi Kumar");
await page.fill('input[name="primary.designation"]', "Owner");
await page.fill('input[name="primary.phone"]', "9811122233");
await page.fill('input[name="primary.email"]', "ravi@e2e.in");
await Promise.all([page.waitForURL(/documents/), page.click('button:has-text("Save & continue")')]);
ok("contacts saved → documents", true);

// documents: submit with one missing to check the gate
for (const d of ["gst_certificate", "pan_card", "cancelled_cheque"]) await page.setInputFiles(`input[name="${d}"]`, FX("doc.pdf"));
await page.click('button:has-text("Save & continue")');
await page.waitForSelector("text=Signed partner agreement is required");
ok("documents: missing agreement blocked", true);
await page.setInputFiles('input[name="agreement"]', FX("doc.pdf"));
await Promise.all([page.waitForURL(/bank/), page.click('button:has-text("Save & continue")')]);
ok("documents saved → bank", true);

await page.fill('input[name="accountHolder"]', `E2E Screens ${stamp}`);
await page.fill('input[name="bankName"]', "SBI");
await page.fill('input[name="accountNumber"]', "30012345678");
await page.fill('input[name="ifsc"]', "SBIN0001234");
await Promise.all([page.waitForURL(/billboards(\?saved=bank)?$/), page.click('button:has-text("Save & continue")')]);
ok("bank saved → billboards", true);

// review page should block submit: no billboard yet
await page.goto(`${BASE}/rep/onboard/${vendorId}/review`);
ok("submit disabled without billboard", await page.locator('button:has-text("Submit for review")').isDisabled());

await page.goto(`${BASE}/rep/onboard/${vendorId}/billboards/new`);
await page.fill('input[name="name"]', `E2E LED Wall ${stamp} - MG Road`);
await page.selectOption('select[name="categoryId"]', { label: "Road side" });
await page.selectOption('select[name="tier"]', "exclusive");
await page.fill('input[name="addressLine"]', "MG Road Metro, Gate 2");
await page.fill('input[name="locality"]', "MG Road");
await page.fill('input[name="city"]', "Bangalore");
await page.fill('input[name="state"]', "Karnataka");
await page.fill('input[name="lat"]', "12.9756");
await page.fill('input[name="lng"]', "77.6068");
await page.fill('input[name="widthFt"]', "30");
await page.fill('input[name="heightFt"]', "15");
await page.fill('input[name="pixelPitch"]', "P4");
await page.fill('input[name="refreshRateHz"]', "3840");
await page.fill('input[name="brightnessNits"]', "7000");
await page.fill('input[name="dailyImpressions"]', "88000");
await page.fill('input[name="loopSeconds"]', "180");
await page.fill('input[name="slotsPerLoop"]', "9");
await page.check('input[name="lokySense"]');
await page.setInputFiles('input[name="day_photos"]', [FX("day.png")]);
await page.setInputFiles('input[name="night_photos"]', [FX("night.png")]);
const priceInputs = page.locator('input[type="number"]:not([name])');
await priceInputs.nth(0).fill("60000");
await priceInputs.nth(1).fill("48000");
await page.click('button:has-text("Add pricing row")');
await priceInputs.nth(2).fill("4000");
await priceInputs.nth(3).fill("2500");
await page.locator('select:not([name])').nth(3).selectOption("day");
await Promise.all([page.waitForURL(/billboards\?saved=billboard/), page.click('button:has-text("Add billboard")')]);
ok("billboard added", true);
await page.screenshot({ path: SHOT("rep-billboards"), fullPage: true });

await page.goto(`${BASE}/rep/onboard/${vendorId}/review`);
await page.click('button:has-text("Submit for review")');
await page.waitForSelector("dl dd");
const username = (await page.locator("dd").nth(0).innerText()).trim();
const tempPassword = (await page.locator("dd").nth(1).innerText()).trim();
await page.reload();
ok("page after submit shows pending status", await page.locator("text=Under admin review").count() > 0);
ok("submitted; credentials shown", username && tempPassword.length === 12, `${username} / ${tempPassword}`);
await page.screenshot({ path: SHOT("rep-submitted"), fullPage: true });

/* ---------- 2. admin reviews ---------- */
await login("admin", "Admin@12345");
ok("admin lands on /admin/vendors", page.url().includes("/admin/vendors"));
await page.goto(`${BASE}/admin/vendors?tab=pending`);
ok("pending tab lists new vendor", await page.locator(`text=E2E Screens ${stamp}`).count() > 0);
await page.click(`a:has-text("E2E Screens ${stamp}")`);
await page.waitForURL(/\/admin\/vendors\/\d+/);
await page.screenshot({ path: SHOT("admin-review"), fullPage: true });

async function approve(sectionId) {
  await page.locator(`#${sectionId} button:has-text("Approve section")`).click();
  await page.locator(`#${sectionId} button:has-text("Approve section")`).waitFor({ state: "detached" });
}
async function sendBack(sectionId, remark) {
  await page.locator(`#${sectionId} button:has-text("Request changes")`).click();
  await page.locator(`#${sectionId} textarea[name="remark"]`).fill(remark);
  await page.locator(`#${sectionId} button:has-text("Send back with remark")`).click();
  await page.locator(`#${sectionId}`).getByText("Your remark:").waitFor();
}
await approve("business");
await approve("contacts");
await approve("documents");
await sendBack("bank", "Account holder name must match the legal name exactly as on the cheque.");
const boardPanelId = await page.locator('section[id^="billboard-"]').first().getAttribute("id");
await sendBack(boardPanelId, "Night photo is too dark; please upload a clearer one and confirm the loop length.");
await page.reload();
ok("vendor now 'Changes requested'", await page.locator('text=Waiting for the representative').count() > 0);
await page.screenshot({ path: SHOT("admin-after-flags"), fullPage: true });

/* ---------- 3. rep fixes and resubmits ---------- */
await login("rep.anita", "Rep@12345");
await page.goto(`${BASE}/rep?status=changes_requested`);
ok("rep list shows '2 to fix'", await page.locator("text=2 to fix").count() > 0);
await page.goto(`${BASE}/rep/onboard/${vendorId}/business`);
ok("approved section is locked for rep", await page.locator('input[name="legalName"]').isDisabled());
await page.goto(`${BASE}/rep/onboard/${vendorId}/bank`);
ok("bank remark visible to rep", await page.locator("text=Account holder name must match").count() > 0);
await page.fill('input[name="accountHolder"]', `E2E Screens ${stamp} Pvt Ltd`);
await page.fill('input[name="accountNumber"]', "30012345678");
await Promise.all([page.waitForURL(/billboards/), page.click('button:has-text("Save & continue")')]);
await page.goto(`${BASE}/rep/onboard/${vendorId}/review`);
await page.click('button:has-text("Resubmit for review")');
await page.waitForSelector("text=Edit these sections before resubmitting");
ok("resubmit gate blocks until billboard edited", true);
await page.click('a:has-text("E2E LED Wall")');
await page.waitForURL(/billboards\/\d+/);
ok("billboard remark visible to rep", await page.locator("text=Night photo is too dark").count() > 0);
await page.setInputFiles('input[name="night_photos"]', [FX("night.png")]);
await page.fill('input[name="loopSeconds"]', "200");
await Promise.all([page.waitForURL(/billboards\?saved=billboard/), page.click('button:has-text("Save billboard")')]);
await page.goto(`${BASE}/rep/onboard/${vendorId}/review`);
await page.click('button:has-text("Resubmit for review")');
await page.waitForSelector("text=Resubmitted.");
ok("resubmitted", true);
await page.screenshot({ path: SHOT("rep-resubmitted"), fullPage: true });

/* ---------- 4. admin approves the rest → vendor auto-approved ---------- */
await login("admin", "Admin@12345");
await page.goto(`${BASE}/admin/vendors?tab=pending`);
await page.click(`a:has-text("E2E Screens ${stamp}")`);
await page.waitForURL(/\/admin\/vendors\/\d+/);
ok("round 2 shown", await page.locator("text=round 2").count() > 0);
await approve("bank");
await approve(boardPanelId);
let approvedShown = false;
for (let i = 0; i < 5 && !approvedShown; i++) {
  await page.waitForTimeout(1000);
  await page.reload();
  approvedShown = (await page.getByText("Billboards below are visible").count()) > 0;
}
ok("vendor auto-approved after last section", approvedShown);
await page.screenshot({ path: SHOT("admin-approved"), fullPage: true });
await page.goto(`${BASE}/admin/vendors?tab=approved`);
ok("approved tab lists vendor", await page.locator(`text=E2E Screens ${stamp}`).count() > 0);

/* ---------- 5. customer site shows the new billboard ---------- */
await ctx.clearCookies();
await page.goto(`${BASE}/listing`);
ok("listing shows new billboard", await page.locator(`text=E2E LED Wall ${stamp}`).count() > 0);
await page.goto(`${BASE}/listing?locality=MG%20Road`);
ok("locality filter works", await page.locator(`text=E2E LED Wall ${stamp}`).count() > 0 && await page.locator("text=Bulz Ads Digital Billboard").count() === 0);
await page.click(`a:has-text("E2E LED Wall ${stamp}")`);
await page.waitForURL(/\/billboard\/\d{5}/);
const code = page.url().match(/\/billboard\/(\d{5})/)[1];
ok("detail page opens by code", code && await page.locator("text=Package Pricing").count() > 0, `#${code}`);
ok("detail shows pricing from DB", await page.locator("text=48,000").count() > 0);
await page.screenshot({ path: SHOT("public-detail"), fullPage: true });

/* ---------- 6. vendor logs in with issued credentials ---------- */
await login(username, tempPassword);
ok("vendor forced to change password", page.url().includes("/vendor/settings/password"), page.url());
await page.fill('input[name="current"]', tempPassword);
await page.fill('input[name="next"]', "NewVendor@123");
await page.fill('input[name="confirm"]', "NewVendor@123");
await Promise.all([page.waitForURL(/\/vendor\/dashboard/), page.click('button:has-text("Save password")')]);
ok("vendor dashboard after password change", true);
await page.screenshot({ path: SHOT("vendor-dashboard"), fullPage: true });
await page.goto(`${BASE}/vendor/screens`);
ok("vendor sees own billboard live", await page.locator(`text=E2E LED Wall ${stamp}`).count() > 0 && await page.locator("text=live").count() > 0);
await page.selectOption('select[name="liveStatus"]', "maintenance");
await page.click('button:has-text("Update status")');
await page.waitForSelector("text=Saved");
ok("vendor updated live status", true);
await page.screenshot({ path: SHOT("vendor-screens"), fullPage: true });
await ctx.clearCookies();
await login(username, "NewVendor@123");
ok("vendor re-login with new password", page.url().includes("/vendor/dashboard"));

/* ---------- 7. customer signup ---------- */
await ctx.clearCookies();
await page.goto(`${BASE}/signup`);
await page.fill('input[name="name"]', "Test Advertiser");
await page.fill('input[name="email"]', `adv${stamp}@example.com`);
await page.fill('input[name="phone"]', "9898989898");
await page.fill('input[name="password"]', "Customer@123");
await Promise.all([page.waitForURL((u) => u.pathname === "/"), page.click('button:has-text("Create account")')]);
ok("customer signup → home with name in header", await page.locator("header >> text=Test").count() > 0);
await page.goto(`${BASE}/admin/vendors`);
ok("customer cannot open admin", !page.url().includes("/admin"), page.url());

/* ---------- 8. reject flow: a second quick onboarding so the test never depends on seed state ---------- */
await login("rep.anita", "Rep@12345");
await page.goto(`${BASE}/rep/new`);
await Promise.all([page.waitForURL(/\/rep\/onboard\/\d+\/business/), page.click('button:has-text("Start onboarding")')]);
const v2 = page.url().match(/onboard\/(\d+)/)[1];
await page.fill('input[name="legalName"]', `Reject Me ${stamp} LLP`);
await page.fill('input[name="tradeName"]', `Reject Me ${stamp}`);
await page.fill('input[name="gstNumber"]', `07AAACR${stamp.slice(0,4)}B1Z2`);
await page.fill('input[name="panNumber"]', "AAACR1234B");
await page.fill('input[name="addressLine"]', "Plot 1"); await page.fill('input[name="city"]', "Gurgaon"); await page.fill('input[name="state"]', "Haryana"); await page.fill('input[name="pincode"]', "122001");
await Promise.all([page.waitForURL(/contacts/), page.click('button:has-text("Save & continue")')]);
await page.fill('input[name="primary.name"]', "Karan"); await page.fill('input[name="primary.phone"]', "9811100000");
await Promise.all([page.waitForURL(/documents/), page.click('button:has-text("Save & continue")')]);
for (const d of ["gst_certificate", "pan_card", "cancelled_cheque", "agreement"]) await page.setInputFiles(`input[name="${d}"]`, FX("doc.pdf"));
await Promise.all([page.waitForURL(/bank/), page.click('button:has-text("Save & continue")')]);
await page.fill('input[name="accountHolder"]', "Reject Me"); await page.fill('input[name="bankName"]', "ICICI"); await page.fill('input[name="accountNumber"]', "001405001234"); await page.fill('input[name="ifsc"]', "ICIC0000014");
await Promise.all([page.waitForURL(/billboards/), page.click('button:has-text("Save & continue")')]);
await page.goto(`${BASE}/rep/onboard/${v2}/billboards/new`);
await page.fill('input[name="name"]', `Reject Wall ${stamp}`);
await page.selectOption('select[name="categoryId"]', { label: "Malls" });
await page.fill('input[name="addressLine"]', "Cyber Hub"); await page.fill('input[name="locality"]', "DLF Phase 3"); await page.fill('input[name="city"]', "Gurgaon"); await page.fill('input[name="state"]', "Haryana");
await page.fill('input[name="lat"]', "28.4947"); await page.fill('input[name="lng"]', "77.0889"); await page.fill('input[name="widthFt"]', "20"); await page.fill('input[name="heightFt"]', "10");
await page.fill('input[name="dailyImpressions"]', "50000"); await page.fill('input[name="loopSeconds"]', "180"); await page.fill('input[name="slotsPerLoop"]', "6");
await page.setInputFiles('input[name="day_photos"]', [FX("day.png")]);
await page.locator('input[type="number"]:not([name])').nth(0).fill("30000");
await page.locator('input[type="number"]:not([name])').nth(1).fill("25000");
await Promise.all([page.waitForURL(/billboards\?saved=billboard/), page.click('button:has-text("Add billboard")')]);
await page.goto(`${BASE}/rep/onboard/${v2}/review`);
await page.click('button:has-text("Submit for review")');
await page.waitForSelector("dl dd");
const rejUser = (await page.locator("dd").nth(0).innerText()).trim();
const rejPass = (await page.locator("dd").nth(1).innerText()).trim();

await login("admin", "Admin@12345");
await page.goto(`${BASE}/admin/vendors?tab=pending`);
await page.click(`a:has-text("Reject Me ${stamp}")`);
await page.waitForURL(/\/admin\/vendors\/\d+/);
await page.click('button:has-text("Reject vendor")');
await page.fill('textarea[name="reason"]', "Duplicate of an existing partner; GST belongs to another entity.");
await page.click('button:has-text("Confirm rejection")');
await page.waitForSelector("text=Rejected:");
ok("vendor rejected with reason", true);
await page.goto(`${BASE}/admin/vendors?tab=rejected`);
ok("rejected tab lists vendor", await page.locator(`text=Reject Me ${stamp}`).count() > 0);
await ctx.clearCookies();
await page.goto(`${BASE}/login`);
await page.fill('input[name="username"]', rejUser);
await page.fill('input[name="password"]', rejPass);
await page.click('button[type="submit"]');
await page.waitForSelector("text=disabled");
ok("rejected vendor login disabled", true);
await page.goto(`${BASE}/listing`);
ok("rejected vendor's board not listed", await page.locator(`text=Reject Wall ${stamp}`).count() === 0);
await login("rep.anita", "Rep@12345");
await page.goto(`${BASE}/rep/onboard/${v2}/review`);
ok("rep sees rejection reason", await page.locator("text=Duplicate of an existing partner").count() > 0);

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
