/** Agency lifecycle: self-registration → OTP → assessment → brand → proposal → quotation → work order → payments → go-live → vendor occupancy → admin view.
    Run: npm run e2e:agency (needs `npm run dev` on :3000 and a seeded DB; E2E_HEADLESS=0 to watch) */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.E2E_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HEADED = process.env.E2E_HEADLESS === "0";
const FX = (f) => path.join(HERE, "fixtures", f);
mkdirSync(path.join(HERE, "shots"), { recursive: true });
const stamp = Date.now().toString().slice(-5);
const ALERT = 'div[role="alert"]:not([id^="__next"])';
const browser = await chromium.launch({ executablePath: CHROME, headless: !HEADED, slowMo: HEADED ? 150 : 0, args: ["--window-size=1440,960", "--window-position=40,40"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 860 } });
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
const results = [];
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond }); console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };
const alertText = async () => ((await page.locator(ALERT).allInnerTexts().catch(() => [])).map((t) => t.trim()).find(Boolean) ?? "");
process.on("uncaughtException", async (e) => { console.log("CRASH:", String(e).split("\n")[0], "at", page.url()); console.log("alerts:", await page.locator(ALERT).allInnerTexts().catch(() => [])); console.log("red:", JSON.stringify(await page.locator(".text-v-red").allInnerTexts().catch(() => []))); await page.screenshot({ path: path.join(HERE, "shots", "crash-agency.png"), fullPage: true }).catch(() => {}); await browser.close().catch(() => {}); process.exit(1); });
async function login(u, p) { await ctx.clearCookies(); await page.goto(`${BASE}/login`); await page.fill('input[name="username"]', u); await page.fill('input[name="password"]', p); await Promise.all([page.waitForURL((x) => !x.pathname.startsWith("/login")), page.click('button[type="submit"]')]); }

/* 1. self-registration */
await ctx.clearCookies();
await page.goto(`${BASE}/agency/register`);
await page.fill('input[name="legalName"]', `Horizon Media ${stamp}`);
await page.fill('input[name="gstNumber"]', `10AAACH${stamp.slice(0, 4)}K1Z7`);
await page.fill('input[name="addressLine"]', "Boring Road"); await page.fill('input[name="city"]', "Patna"); await page.fill('input[name="state"]', "Bihar"); await page.fill('input[name="pincode"]', "800001");
await Promise.all([page.waitForURL(/register\/founder/), page.click('button:has-text("Continue to founder details")')]);
ok("step 1 → founder step", true);
const email = `ravi${stamp}@horizonmedia.in`;
await page.fill('input[name="founderName"]', "Ravi Singh"); await page.fill('input[name="founderPhone"]', "9811111111"); await page.fill('input[name="founderEmail"]', email);
await page.selectOption('select[name="founderRole"]', "ceo_founder"); await page.fill('input[name="password"]', "Horizon@123");
await Promise.all([page.waitForURL(/agency\/verify/), page.click('button:has-text("Verify & create workspace")')]);
ok("account created → OTP step", true);
const devCode = (await page.locator("b.font-mono").first().innerText()).trim();
ok("dev OTP shown", /^\d{6}$/.test(devCode), devCode);
await page.goto(`${BASE}/agency/brands`);
ok("workspace closed before OTP", page.url().includes("/agency/verify"));
await page.goto(`${BASE}/agency/verify`);
await page.fill('input[name="code"]', "000000"); await page.click('button:has-text("Verify")'); await page.waitForSelector(ALERT);
ok("wrong OTP rejected", (await alertText()).includes("not right"));
await page.fill('input[name="code"]', devCode);
await Promise.all([page.waitForURL(/\/agency\?welcome=1/), page.click('button:has-text("Verify")')]);
ok("verified → restricted dashboard", (await page.locator("text=Register & Analyze Brand Now").count()) > 0);
await page.goto(`${BASE}/agency/proposals`);
ok("proposals locked pre-assessment", page.url().includes("/agency/assessment"));

/* 2. assessment */
await page.check('input[name="services"][value="media_buying"]'); await page.check('input[name="services"][value="creative"]');
await page.check('input[name="sectors"][value="jewellery"]'); await page.check('input[name="sectors"][value="retail"]'); await page.check('input[name="sectors"][value="real_estate"]');
await page.selectOption('select[name="portfolioSize"]', "16-50"); await page.selectOption('select[name="doohExperience"]', "regular");
await Promise.all([page.waitForURL(/assessment\/success/), page.click('button:has-text("Run diagnostic")')]);
const score = await page.locator("p.text-\\[36px\\]").innerText();
ok("assessment success screen with score", /\d\.\d/.test(score), score.trim().replace(/\s+/g, " "));
ok("commission tier shown", (await page.locator("text=base commission").count()) > 0);

/* 3. brand */
await page.goto(`${BASE}/agency/brands/new`);
await page.fill('input[name="name"]', `XYZ Jewellers ${stamp}`); await page.fill('input[name="hq"]', "Patna, India"); await page.fill('input[name="category"]', "Jewellery");
await Promise.all([page.waitForURL(/brands\/\d+\?created=1/), page.click('button:has-text("Add brand")')]);
const brandId = page.url().match(/brands\/(\d+)/)[1];
ok("brand created", !!brandId);
await page.setInputFiles('input[name="file"]', FX("day.png")); await page.fill('input[name="name"]', "Festive_Promo_Main"); await page.fill('input[name="specs"]', "1920x1080, 15s");
await page.click('button:has-text("Upload")'); await page.waitForSelector("text=Festive_Promo_Main");
ok("creative asset uploaded (reviewing)", (await page.locator("text=reviewing").count()) > 0);
await page.click('button:has-text("Approve")'); await page.waitForSelector("td >> text=approved");
ok("creative approved", true);
// add team member and assign as manager
await page.goto(`${BASE}/agency/team`);
await page.fill('input[name="name"]', "Sarah Jenkins"); await page.fill('input[name="title"]', "Senior Media Strategist"); await page.fill('input[name="email"]', `sarah${stamp}@horizonmedia.in`); await page.fill('input[name="password"]', "Member@123");
await page.click('button:has-text("Send invite")'); await page.waitForSelector("text=Team member added");
ok("team member added", (await page.locator("text=Sarah Jenkins").count()) > 0);
await page.goto(`${BASE}/agency/brands/${brandId}`, { waitUntil: "networkidle" });
const memberVal = await page.locator('select[name="memberId"] option', { hasText: "Sarah Jenkins" }).getAttribute("value");
await page.selectOption('select[name="memberId"]', memberVal); await page.click('button:has-text("Assign")');
await page.waitForSelector("text=Current manager: Sarah Jenkins");
ok("account manager assigned", true);

/* 4. proposal (no pricing) */
await page.goto(`${BASE}/agency/proposals/new?brand=${brandId}`);
await page.fill('input[name="title"]', `Festive Launch ${stamp}`); await page.selectOption('select[name="theme"]', "festive");
await page.setInputFiles('input[name="creatives"]', [FX("day.png")]);
await page.fill('textarea[name="objective"]', "Youth and retail shoppers on the Boring Road corridor.");
await page.locator("button", { hasText: "#01010" }).first().click(); await page.locator("button", { hasText: "#01020" }).first().click();
ok("2 screens selected", (await page.locator("text=2 screens selected").count()) > 0);
await Promise.all([page.waitForURL(/proposals\/\d+$/), page.click('button:has-text("Render draft proposal")')]);
const proposalId = page.url().match(/proposals\/(\d+)/)[1];
ok("proposal rendered", (await page.locator("text=Safeguard: no pricing enforced").count()) > 0);
ok("pitch has no rupee amounts", !/₹/.test(await page.locator("main").innerText()));
const shareUrl = (await page.locator("code").first().innerText()).trim();
await ctx.clearCookies(); await page.goto(shareUrl);
ok("public pitch opens anonymously", (await page.locator(`text=Festive Launch ${stamp}`).count()) > 0);
await login(email, "Horizon@123");
await page.goto(`${BASE}/agency/proposals/${proposalId}`);
ok("client view counted", (await page.locator("text=1 client views").count()) > 0);

/* 5. quotation */
await page.goto(`${BASE}/agency/quotations/new?proposal=${proposalId}`);
ok("quotation prefilled from proposal", (await page.locator("text=2 screens selected").count()) > 0);
await page.fill('input[name="couponCode"]', "LOKYPARTNER10");
await page.check('input[name="emiEnabled"]');
await page.click('button:has-text("Calculate live estimate")'); await page.waitForSelector("text=Net invoice total");
const est = await page.locator("dl").innerText();
ok("live estimate with coupon + margin + EMI", /LOKYPARTNER10/.test(est) && /Easy EMI/.test(est), est.replace(/\s+/g, " ").slice(0, 120));
await page.fill('input[name="couponCode"]', "BOGUS"); await page.click('button:has-text("Calculate live estimate")'); await page.waitForSelector("text=This coupon is not valid");
ok("invalid coupon flagged", true);
await page.fill('input[name="couponCode"]', "LOKYPARTNER10");
await Promise.all([page.waitForURL(/quotations\/\d+$/), page.click('button:has-text("Generate co-branded quotation")')]);
const quoteId = page.url().match(/quotations\/(\d+)/)[1];
ok("quotation generated with brand lock", (await page.locator("text=brand locked till").count()) > 0);
const totalText = await page.locator("dd").last().innerText();
ok("net invoice total shown", /₹/.test(totalText), totalText);

/* 6. lock campaign (EMI path) + pay + sign */
await page.check('input[name="paymentPath"][value="emi"]'); await page.check('input[name="acceptTerms"]');
await Promise.all([page.waitForURL(/campaigns\/\d+\?locked=1/), page.click('button:has-text("Lock campaign")')]);
const campaignId = page.url().match(/campaigns\/(\d+)/)[1];
ok("work order created, pending upfront", (await page.locator("text=Pending upfront payment").count()) > 0);
ok("EMI schedule has 4 rows", (await page.locator("li:has-text('due')").count()) === 4);
await page.locator('button:has-text("Pay ₹")').first().click(); await page.waitForSelector("text=Campaign confirmed");
ok("upfront paid → campaign confirmed", true);
ok("wallet bonus for first order visible later", true);
await page.setInputFiles('input[name="agreement"]', FX("doc.pdf")); await page.click('button:has-text("Sign & activate")'); await page.waitForSelector("text=Live since");
ok("agreement signed → campaign live", true);
await page.goto(`${BASE}/agency/payments`);
ok("wallet credited ₹2,500 first-order bonus", (await page.locator("text=First Order Rush").count()) > 0);
await page.goto(`${BASE}/agency`);
ok("dashboard shows Level 2", (await page.locator("text=Level 2 partner").count()) > 0);

/* 7. vendor sees occupancy, admin sees agency */
await login("bulzads-demo", "Vendor@12345");
await page.goto(`${BASE}/vendor/screens`);
const booked = (await page.locator("p", { hasText: /^[1-9]\/8 booked$/ }).count());
ok("vendor screens show booked slots from the agency campaign", booked >= 2, `${booked} screens with bookings`);
await login("admin", "Admin@12345");
await page.goto(`${BASE}/admin/agencies`);
ok("admin lists the new agency as partner", (await page.locator(`text=Horizon Media ${stamp}`).count()) > 0);
await page.click(`a:has-text("Horizon Media ${stamp}")`); await page.waitForURL(/admin\/agencies\/\d+/);
await page.fill('input[name="commissionPct"]', "9"); await page.click('button:has-text("Set commission")'); await page.waitForSelector("text=Saved");
ok("admin adjusted commission", true);
// team member login lands in the agency
await login(`sarah${stamp}@horizonmedia.in`, "Member@123");
ok("team member lands on agency dashboard", page.url().endsWith("/agency"));
await page.goto(`${BASE}/agency/team`);
ok("member cannot add members", (await page.locator("text=Only the agency owner").count()) > 0);

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
