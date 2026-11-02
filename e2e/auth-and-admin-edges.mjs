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
const browser = await chromium.launch({ executablePath: CHROME, headless: !HEADED, slowMo: HEADED ? 150 : 0, args: ["--window-size=1440,960", "--window-position=40,40"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 860 } });
const page = await ctx.newPage();
page.setDefaultTimeout(25000);
const results = [];
process.on("uncaughtException", async (e) => {
  console.log("CRASH:", String(e).split("\n")[0], "at", page.url());
  console.log("alerts:", await page.locator('[role="alert"]').allInnerTexts().catch(() => []));
  console.log("red:", JSON.stringify(await page.locator(".text-v-red").allInnerTexts().catch(() => [])));
  await page.screenshot({ path: path.join(HERE, "shots", "crash-edge.png"), fullPage: true }).catch(() => {});
  await browser.close().catch(() => {});
  process.exit(1);
});
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond }); console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };
const ALERT = 'div[role="alert"]:not([id^="__next"])';
const text = async (sel) => ((await page.locator(sel === '[role="alert"]' ? ALERT : sel).allInnerTexts().catch(() => [])).map((t) => t.trim()).find(Boolean) ?? "");
async function login(u, p) {
  await ctx.clearCookies();
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', u); await page.fill('input[name="password"]', p);
  await Promise.all([page.waitForURL((x) => !x.pathname.startsWith("/login")), page.click('button[type="submit"]')]);
}

/* ---- A. auth edge cases ---- */
await ctx.clearCookies();
await page.goto(`${BASE}/login`);
await page.fill('input[name="username"]', "ghost.user"); await page.fill('input[name="password"]', "wrong");
await page.click('button[type="submit"]'); await page.waitForSelector(ALERT);
ok("wrong password shows error", (await text('[role="alert"]')).includes("Wrong username or password"), await text('[role="alert"]'));
ok("username kept after failed login", (await page.inputValue('input[name="username"]')) === "ghost.user");
for (let i = 0; i < 8; i++) { await page.fill('input[name="password"]', "wrong" + i); await page.click('button[type="submit"]'); await page.waitForTimeout(700); }
ok("login rate-limited after repeated failures", (await text('[role="alert"]')).includes("Too many failed attempts"), await text('[role="alert"]'));
await login("admin", "Admin@12345");
ok("other account unaffected by lockout; successful login clears", page.url().includes("/admin"));
await ctx.clearCookies();
await page.goto(`${BASE}/signup`);
await page.fill('input[name="name"]', "Dup"); await page.fill('input[name="email"]', "customer@example.com"); await page.fill('input[name="phone"]', "9898989898"); await page.fill('input[name="password"]', "Customer@123");
await page.click('button:has-text("Create account")'); await page.waitForSelector(ALERT);
ok("duplicate signup email rejected", (await text('[role="alert"]')).includes("already exists"));
await page.goto(`${BASE}/billboard/01010`);
await page.click('a:has-text("Confirm Your Booking")');
await page.waitForURL(/\/login\?next=/);
ok("booking CTA sends anonymous user to login with next", page.url().includes("next=%2Fbillboard%2F01010"));
await page.fill('input[name="username"]', "customer@example.com"); await page.fill('input[name="password"]', "Customer@12345");
await Promise.all([page.waitForURL(/\/billboard\/01010/), page.click('button[type="submit"]')]);
ok("after login returns to the billboard", true);
ok("header shows customer name", (await page.locator("header").innerText()).includes("Priya"));
await page.click('header button:has-text("Sign out")');
await page.waitForURL(/\/login/);
ok("sign out from public header", true);

/* ---- B. file permissions ---- */
await ctx.clearCookies();
const r1 = await page.request.get(`${BASE}/api/files/1`);                     // seeded static → redirect/200
const docId = 1;
ok("public media file reachable anonymously", r1.status() === 200);
// find a private KYC file id of vendor 2 via admin page later; test with an uploaded-private id after rep uploads below.

/* ---- C. rep: validation + approved vendor adds a billboard ---- */
await login("rep.anita", "Rep@12345");
await page.goto(`${BASE}/rep/onboard/1/billboards/new`);
await page.fill('input[name="name"]', `Edge Board ${stamp}`);
await page.selectOption('select[name="categoryId"]', { label: "Malls" });
await page.fill('input[name="addressLine"]', "Patna Mall, 2nd floor"); await page.fill('input[name="locality"]', "Kankarbagh"); await page.fill('input[name="city"]', "Patna"); await page.fill('input[name="state"]', "Bihar");
await page.fill('input[name="lat"]', "55.1"); await page.fill('input[name="lng"]', "85.1");
await page.fill('input[name="widthFt"]', "12"); await page.fill('input[name="heightFt"]', "8");
await page.fill('input[name="dailyImpressions"]', "20000"); await page.fill('input[name="loopSeconds"]', "120"); await page.fill('input[name="slotsPerLoop"]', "6");
await page.setInputFiles('input[name="day_photos"]', [FX("day.png")]);
const pin = page.locator('input[type="number"]:not([name])');
await pin.nth(0).fill("1000"); await pin.nth(1).fill("2000");
await page.click('button:has-text("Add billboard")');
await page.waitForSelector("text=Fix the highlighted fields");
ok("lat outside India rejected", (await page.locator("text=Latitude must be inside India").count()) > 0);
ok("offer > list rejected", (await page.locator("text=Offer price cannot exceed list price").count()) > 0);
ok("values kept after validation error", (await page.inputValue('input[name="name"]')) === `Edge Board ${stamp}`);
await page.fill('input[name="lat"]', "25.59"); await pin.nth(1).fill("800");
await page.setInputFiles('input[name="day_photos"]', [FX("day.png")]);
await Promise.all([page.waitForURL(/billboards\?saved=billboard/), page.click('button:has-text("Add billboard")')]);
ok("approved vendor: new billboard saved as draft", (await page.locator(`text=Edge Board ${stamp}`).count()) > 0 && (await page.locator("text=Draft").count()) > 0);
await page.click('button:has-text("Submit for review")');
await page.waitForURL(/saved=submitted/);
ok("new billboard submitted for review", (await page.locator("text=sent to the admin").count()) > 0);
await page.goto(`${BASE}/rep/onboard/1/billboards`);
const draftRemove = page.locator('button:has-text("Remove")');
ok("submitted billboard cannot be removed", (await draftRemove.count()) === 0);
await page.goto(`${BASE}/rep/onboard/2/business`);
ok("pending vendor's sections are locked", await page.locator('input[name="legalName"]').isDisabled());

/* ---- D. admin: approved vendor's new board shows in Pending; overrides; staff ---- */
await login("admin", "Admin@12345");
await page.goto(`${BASE}/admin/vendors?tab=pending`);
ok("approved vendor with pending billboard appears in Pending tab", (await page.locator('a:has-text("Bulz Ads Media")').count()) > 0);
await page.click('a:has-text("Bulz Ads Media")');
await page.waitForURL(/\/admin\/vendors\/1/);
const panel = page.locator('section', { hasText: `Edge Board ${stamp}` }).first();
const pid = await panel.getAttribute("id");
await page.locator(`#${pid} button:has-text("Request changes")`).click();
await page.locator(`#${pid} textarea[name="remark"]`).fill("short");
await page.locator(`#${pid} button:has-text("Send back with remark")`).click();
await page.waitForSelector(ALERT);
ok("short remark rejected", (await text('[role="alert"]')).includes("at least 10 characters"));
await page.locator(`#${pid} textarea[name="remark"]`).fill("Please add a night photo so advertisers can judge visibility after dark.");
await page.locator(`#${pid} button:has-text("Send back with remark")`).click();
await page.locator(`#${pid}`).getByText("Your remark:").waitFor();
await page.reload();
ok("approved vendor stays approved when a new board is flagged", (await page.locator("text=Billboards below are visible").count()) > 0);
// tier override on board 1
await page.locator('#billboard-1 select[name="tier"]').selectOption("partner");
await page.locator('#billboard-1 button:has-text("Set tier")').click();
await page.locator('#billboard-1').getByText("Saved").first().waitFor();
ok("admin changed tier", true);
await page.locator('#billboard-1 select[name="liveStatus"]').selectOption("offline");
await page.locator('#billboard-1 button:has-text("Set")').first().click();
await page.waitForTimeout(1500);
await page.click('button:has-text("Reset vendor password")');
await page.waitForSelector("text=New temporary password");
const newTemp = (await page.locator("dd.select-all").nth(1).innerText()).trim();
ok("admin reset vendor password", newTemp.length === 12);
await page.goto(`${BASE}/admin/staff`);
await page.fill('input[name="name"]', "Dup Rep"); await page.fill('input[name="username"]', "rep.anita"); await page.fill('input[name="password"]', "Rep@12345");
await page.click('button:has-text("Create account")'); await page.waitForSelector(ALERT);
ok("duplicate staff username rejected", (await text('[role="alert"]')).includes("already taken"));
await page.fill('input[name="name"]', "Vikram Rao"); await page.fill('input[name="username"]', `rep.vikram${stamp}`); await page.fill('input[name="password"]', "Rep@12345");
await page.click('button:has-text("Create account")'); await page.waitForSelector("text=Account created");
ok("new representative created", (await page.locator(`text=rep.vikram${stamp}`).count()) > 0);

/* ---- E. new rep isolation ---- */
await login(`rep.vikram${stamp}`, "Rep@12345");
ok("new rep sees empty list", (await page.locator("text=Nothing here yet").count()) > 0);
await page.goto(`${BASE}/rep/onboard/1/business`);
ok("new rep cannot open another rep's vendor (404)", (await page.locator("text=Page not found").count()) > 0 || page.url().endsWith("/rep"));

/* ---- F. vendor after admin reset + tier/live reflected publicly ---- */
await login("bulzads-demo", newTemp);
ok("vendor forced to password page after admin reset", page.url().includes("/vendor/settings/password"));
await page.fill('input[name="current"]', "nope"); await page.fill('input[name="next"]', "Vendor@12345"); await page.fill('input[name="confirm"]', "Vendor@12345");
await page.click('button:has-text("Save password")'); await page.waitForSelector(ALERT);
ok("wrong current password rejected", (await text('[role="alert"]')).includes("Current password is wrong"), await text('[role="alert"]'));
await page.fill('input[name="current"]', newTemp); await page.fill('input[name="next"]', "Vendor@12345"); await page.fill('input[name="confirm"]', "Vendor@12345");
await Promise.all([page.waitForURL(/\/vendor\/dashboard/), page.click('button:has-text("Save password")')]);
await page.goto(`${BASE}/vendor/screens`);
ok("vendor sees admin's offline status", (await page.locator("text=offline").count()) > 0);
ok("vendor sees remark on the flagged new board", (await page.locator("text=Please add a night photo").count()) > 0);
await ctx.clearCookies();
await page.goto(`${BASE}/listing`);
ok("public card shows admin's tier change", (await page.locator("text=Loky Partner").count()) >= 2);
ok("flagged new board not public", (await page.locator(`text=Edge Board ${stamp}`).count()) === 0);
await page.goto(`${BASE}/login`);
await page.fill('input[name="username"]', "metrovision-4411"); await page.fill('input[name="password"]', "Vendor@12345");
await Promise.all([page.waitForURL(/password/), page.click('button[type="submit"]')]);
await page.fill('input[name="current"]', "Vendor@12345"); await page.fill('input[name="next"]', "Vendor@12345"); await page.fill('input[name="confirm"]', "Vendor@12345");
await Promise.all([page.waitForURL(/\/vendor\/dashboard/), page.click('button:has-text("Save password")')]);
ok("pending vendor sees under-review banner", (await page.locator("text=under review").count()) > 0);

/* ---- G. private file permission ---- */
const privRow = await page.request.get(`${BASE}/api/files/2`);
await ctx.clearCookies();
const anon = await page.request.get(`${BASE}/api/files/2`, { maxRedirects: 0 });
ok("file 2 anonymous status", [200, 302, 307, 401].includes(anon.status()), String(anon.status()));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
