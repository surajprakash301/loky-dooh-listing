/** Edge-case suite. Run: npm run e2e:edge (needs `npm run dev` on :3000 and a seeded DB; E2E_HEADLESS=0 to watch). */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.E2E_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FX = (f) => path.join(HERE, "fixtures", f);
mkdirSync(path.join(HERE, "shots"), { recursive: true });
const HEADED = process.env.E2E_HEADLESS === "0";
const stamp = Date.now().toString().slice(-5);
const ALERT = 'div[role="alert"]:not([id^="__next"])';
const browser = await chromium.launch({ executablePath: CHROME, headless: !HEADED, slowMo: HEADED ? 150 : 0, args: ["--window-size=1440,960", "--window-position=40,40"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 860 } });
const page = await ctx.newPage();
page.setDefaultTimeout(25000);
const results = [];
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond }); console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };
const alertText = async () => ((await page.locator(ALERT).allInnerTexts()).map((t) => t.trim()).find(Boolean) ?? "");
process.on("uncaughtException", async (e) => { console.log("CRASH:", String(e).split("\n")[0], "at", page.url()); console.log("alerts:", await page.locator(ALERT).allInnerTexts().catch(() => [])); console.log("red:", JSON.stringify(await page.locator(".text-v-red").allInnerTexts().catch(() => []))); await page.screenshot({ path: path.join(HERE, "shots", "crash-edge2.png"), fullPage: true }).catch(() => {}); await browser.close().catch(() => {}); process.exit(1); });
async function login(u, p) { await ctx.clearCookies(); await page.goto(`${BASE}/login`); await page.fill('input[name="username"]', u); await page.fill('input[name="password"]', p); await Promise.all([page.waitForURL((x) => !x.pathname.startsWith("/login")), page.click('button[type="submit"]')]); }
const status = async (url) => (await page.request.get(url, { maxRedirects: 0 })).status();

/* ---- 1. rep: duplicate GST, bad upload, incomplete billboard, remove draft ---- */
await login("rep.anita", "Rep@12345");
await page.goto(`${BASE}/rep/new`);
await Promise.all([page.waitForURL(/business/), page.click('button:has-text("Start onboarding")')]);
const vid = page.url().match(/onboard\/(\d+)/)[1];
await page.fill('input[name="legalName"]', `Strict ${stamp} LLP`); await page.fill('input[name="tradeName"]', `Strict ${stamp}`);
await page.fill('input[name="gstNumber"]', "10AABCB1234A1Z5"); await page.fill('input[name="panNumber"]', "AABCS1234A");
await page.fill('input[name="addressLine"]', "1 Test Lane"); await page.fill('input[name="city"]', "Pune"); await page.fill('input[name="state"]', "Maharashtra"); await page.fill('input[name="pincode"]', "411001");
await page.click('button:has-text("Save & continue")'); await page.waitForSelector(ALERT);
ok("duplicate GSTIN across vendors rejected", (await alertText()).includes("already exists"), await alertText());
ok("business type select kept after error", (await page.inputValue('select[name="businessType"]')) === "proprietorship");
await page.fill('input[name="gstNumber"]', `27AABCS${stamp.slice(0, 4)}A1Z9`);
await Promise.all([page.waitForURL(/contacts/), page.click('button:has-text("Save & continue")')]);
await page.fill('input[name="primary.name"]', "Sana"); await page.fill('input[name="primary.phone"]', "1234567890");
await page.click('button:has-text("Save & continue")');
await page.waitForSelector("text=Enter a 10-digit mobile number");
ok("phone must start with 6-9", true);
await page.fill('input[name="primary.phone"]', "9123456780");
await Promise.all([page.waitForURL(/documents/), page.click('button:has-text("Save & continue")')]);
await page.setInputFiles('input[name="gst_certificate"]', FX("bad.txt"));
await page.click('button:has-text("Save & continue")'); await page.waitForSelector(ALERT);
ok("unsupported file type rejected", (await alertText()).includes("Unsupported file type"), await alertText());
for (const d of ["gst_certificate", "pan_card", "cancelled_cheque", "agreement"]) await page.setInputFiles(`input[name="${d}"]`, FX("doc.pdf"));
await Promise.all([page.waitForURL(/bank/), page.click('button:has-text("Save & continue")')]);
await page.goto(`${BASE}/rep/onboard/${vid}/documents`);
const kycHref = await page.locator('a[href^="/api/files/"]').first().getAttribute("href");
ok("uploaded KYC doc linked", !!kycHref, kycHref);
await page.goto(`${BASE}/rep/onboard/${vid}/bank`);
await page.fill('input[name="accountHolder"]', "Strict"); await page.fill('input[name="bankName"]', "Axis"); await page.fill('input[name="accountNumber"]', "9112345678901"); await page.fill('input[name="ifsc"]', "UTIB0000123");
await Promise.all([page.waitForURL(/billboards/), page.click('button:has-text("Save & continue")')]);
// billboard without a day photo
await page.goto(`${BASE}/rep/onboard/${vid}/billboards/new`);
await page.fill('input[name="name"]', `Strict Board ${stamp}`); await page.selectOption('select[name="categoryId"]', { label: "Road side" });
await page.fill('input[name="addressLine"]', "FC Road"); await page.fill('input[name="locality"]', "Deccan"); await page.fill('input[name="city"]', "Pune"); await page.fill('input[name="state"]', "Maharashtra");
await page.fill('input[name="lat"]', "18.52"); await page.fill('input[name="lng"]', "73.84"); await page.fill('input[name="widthFt"]', "20"); await page.fill('input[name="heightFt"]', "10");
await page.fill('input[name="dailyImpressions"]', "30000"); await page.fill('input[name="loopSeconds"]', "150"); await page.fill('input[name="slotsPerLoop"]', "5");
const pin = page.locator('input[type="number"]:not([name])'); await pin.nth(0).fill("20000"); await pin.nth(1).fill("15000");
await Promise.all([page.waitForURL(/billboards\/\d+\?warn=/), page.click('button:has-text("Add billboard")')]);
ok("billboard saved; redirected to its edit page with the gap named", (await page.locator("text=still needs at least one day photo").count()) > 0);
await page.goto(`${BASE}/rep/onboard/${vid}/review`);
ok("submit disabled with incomplete billboard", await page.locator('button:has-text("Submit for review")').isDisabled());
ok("problem list names the billboard", (await page.locator(`text=Strict Board ${stamp} needs at least one day photo`).count()) > 0);
await page.goto(`${BASE}/rep/onboard/${vid}/billboards`);
await page.click('button:has-text("Remove")');
await page.waitForTimeout(1500);
ok("draft billboard removed", (await page.locator(`text=Strict Board ${stamp}`).count()) === 0);

/* ---- 2. private file permission matrix ---- */
const fileUrl = `${BASE}${kycHref}`;
ok("owner rep can open KYC file", (await status(fileUrl)) === 200);
await ctx.clearCookies();
ok("anonymous gets 401 on KYC file", (await status(fileUrl)) === 401, String(await status(fileUrl)));
await login("customer@example.com", "Customer@12345");
ok("customer gets 403 on KYC file", (await status(fileUrl)) === 403, String(await status(fileUrl)));
await login("bulzads-demo", "Vendor@12345");
ok("other vendor gets 403 on KYC file", (await status(fileUrl)) === 403, String(await status(fileUrl)));
await login("admin", "Admin@12345");
ok("admin can open KYC file", (await status(fileUrl)) === 200);

/* ---- 3. garbage session cookie ---- */
await ctx.clearCookies();
await ctx.addCookies([{ name: "loky_session", value: "garbage.token.value", domain: "localhost", path: "/" }]);
await page.goto(`${BASE}/rep`);
ok("tampered cookie treated as logged out", page.url().includes("/login"));

/* ---- 4. approved vendor's flagged new billboard: rep fixes + resubmits, admin approves, goes public ---- */
await login("rep.anita", "Rep@12345");
await page.goto(`${BASE}/rep/onboard/1/review`);
ok("approved vendor review shows flagged-board warning", (await page.locator("text=asked for changes on a billboard").count()) > 0);
await page.click('button:has-text("Resubmit for review")');
await page.waitForSelector(ALERT);
ok("resubmit gate names the untouched billboards", /Edit these sections before resubmitting: E · Edge Board \d+ #\d{5}/.test(await alertText()), await alertText());
const flaggedHrefs = await page.locator('li:has(span:text-is("Changes requested")) a').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
ok("flagged boards listed on review page", flaggedHrefs.length > 0, String(flaggedHrefs.length));
for (const h of flaggedHrefs) {
  await page.goto(`${BASE}${h}`);
  ok(`flagged board editable (${h.split("/").pop()})`, !(await page.locator('input[name="name"]').isDisabled()));
  await page.setInputFiles('input[name="night_photos"]', [FX("night.png")]);
  await Promise.all([page.waitForURL(/saved=billboard/), page.click('button:has-text("Save billboard")')]);
}
await page.goto(`${BASE}/rep/onboard/1/review`);
await page.click('button:has-text("Resubmit for review")');
await page.waitForSelector("text=Resubmitted.");
ok("flagged board resubmitted under approved vendor", true);
await login("admin", "Admin@12345");
await page.goto(`${BASE}/admin/vendors?tab=pending`);
await page.click('a:has-text("Bulz Ads Media")'); await page.waitForURL(/\/admin\/vendors\/1/);
const pids = await page.locator('section[id^="billboard-"]', { hasText: "Edge Board" }).evaluateAll((els) => els.map((e) => e.id));
ok("resubmitted board shows round 2", (await page.locator(`#${pids[0]}`).getByText("round 2").count()) > 0);
for (const pid of pids) {
  const btn = page.locator(`#${pid} button:has-text("Approve section")`);
  if (await btn.count()) { await btn.click(); await btn.waitFor({ state: "detached" }); }
}
let stillPending = true;
for (let i = 0; i < 5 && stillPending; i++) { await page.waitForTimeout(800); await page.goto(`${BASE}/admin/vendors?tab=pending`); stillPending = (await page.locator('a:has-text("Bulz Ads Media")').count()) > 0; }
ok("Bulz leaves Pending tab once the board is approved", !stillPending);
await ctx.clearCookies();
await page.goto(`${BASE}/listing`);
ok("newly approved board is public", (await page.locator("text=Edge Board").count()) > 0);

/* ---- 5. mobile viewport sanity ---- */
await page.setViewportSize({ width: 400, height: 800 });
await login("rep.anita", "Rep@12345");
await page.goto(`${BASE}/rep/onboard/1/billboards`, { waitUntil: "networkidle" });
ok("rep portal no horizontal overflow at 400px", !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)));
await page.screenshot({ path: path.join(HERE, "shots", "mobile-rep.png"), fullPage: true });
await login("admin", "Admin@12345");
await page.goto(`${BASE}/admin/vendors/2`, { waitUntil: "networkidle" });
ok("admin review no horizontal overflow at 400px", !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)));
await page.screenshot({ path: path.join(HERE, "shots", "mobile-admin.png"), fullPage: true });
await page.goto(`${BASE}/listing`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(HERE, "shots", "mobile-listing.png"), fullPage: true });

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
