/*
 * Marketplace quotation flow: map view (pins, zoom filtering, popup) → add billboards to a campaign
 * from the map and the list → quotation builder → new advertiser login via mobile OTP → quotation
 * document → "My quotations" / "Orders" → sign out and back in with the OTP login.
 * Needs a running server (E2E_BASE_URL, default http://localhost:3000) and Google Chrome.
 */
import { chromium } from "playwright-core";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.E2E_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOTS = "e2e/shots";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"} ${name}${cond || !extra ? "" : " — " + extra}`); };

const browser = await chromium.launch({ executablePath: CHROME, headless: process.env.E2E_HEADLESS !== "0" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
const phone = "9" + String(Math.floor(Math.random() * 1e9)).padStart(9, "0");
const email = `tester+${phone}@example.com`;

/* ---------- 1. map view ---------- */
await page.goto(`${BASE}/listing?view=map`);
await page.waitForSelector(".leaflet-container .leaflet-tile-loaded", { timeout: 45000 });
await page.waitForSelector(".loky-pin, .loky-cluster");
const panelCount = async () => Number((await page.locator('[data-testid="map-panel"] p').first().textContent()).match(/\d+/)[0]);
const all = await panelCount();
const chip = Number((await page.locator("text=/\\d+ sites? · \\d+ screens/").first().textContent()).match(/(\d+) sites?/)[1]);
ok(`map lists every located site in view (${all} of ${chip})`, all === chip && all > 0, `${all} vs ${chip}`);
ok("map shows pins or clusters", (await page.locator(".loky-pin, .loky-cluster").count()) > 0);
await page.screenshot({ path: `${SHOTS}/map-overview.png` });

// zooming in filters the panel to what is on screen
await page.click('[data-testid="site-00018"]');
await page.waitForTimeout(1500);
const zoomed = await panelCount();
ok(`zoomed-in map filters the side panel (${zoomed} of ${all})`, zoomed < all, String(zoomed));
ok("clicked site opens the popup card", await page.locator('[data-testid="site-popup"]').isVisible());
await page.screenshot({ path: `${SHOTS}/map-zoomed.png` });

// add from the popup and from the panel
await page.locator('[data-testid="site-popup"] [data-testid="add-00018"]').click();
await page.locator('[data-testid="site-00027"] [data-testid="add-00027"]').click();
ok("campaign pill shows 2 and leads to the quotation", (await page.locator('[data-testid="campaign-count"]').textContent()).includes("2") && (await page.locator('[data-testid="campaign-count"]').getAttribute("href")) === "/quote/new");
ok("campaign bar appears", await page.locator('[data-testid="campaign-bar"]').isVisible());

// "Show all" brings everything back
await page.click("text=Show all sites");
await page.waitForTimeout(1200);
ok("show all restores the full list", (await panelCount()) === all);

// clicking a pin on the map selects it
await page.locator(".loky-pin").first().click({ force: true });
await page.waitForTimeout(400);
ok("pin click opens a popup", await page.locator('[data-testid="site-popup"]').isVisible());

/* ---------- 2. list view adds too ---------- */
await page.goto(`${BASE}/listing`);
await page.locator('[data-testid="add-00010"]').first().click();
await page.waitForTimeout(300);
ok("list view: selection persists and grows to 3", (await page.locator('[data-testid="campaign-bar"]').textContent()).includes("3"));

/* ---------- 3. quotation builder ---------- */
await page.click('[data-testid="create-quotation"]');
await page.waitForURL("**/quote/new");
await page.waitForSelector('[data-testid="line-00018"]');
ok("builder prices all 3 billboards", (await page.locator('tr[data-testid^="line-"]').count()) === 3);
const total1 = await page.locator('[data-testid="grand-total"]').textContent();
await page.click('[data-testid="months-3"]');
await page.waitForFunction((t) => document.querySelector('[data-testid="grand-total"]')?.textContent !== t, total1);
const total3 = await page.locator('[data-testid="grand-total"]').textContent();
ok(`3 months costs more than 1 month (${total1.trim()} → ${total3.trim()})`, total3 !== total1);
await page.click('[data-testid="months-1"]');
await page.waitForFunction((t) => document.querySelector('[data-testid="grand-total"]')?.textContent === t, total1);
await page.screenshot({ path: `${SHOTS}/quote-builder.png`, fullPage: true });

// validation keeps values
await page.fill('input[name="name"]', "Abhinav Verma");
await page.fill('input[name="company"]', "Eyverse OOH Agency");
await page.setInputFiles('[data-testid="quote-builder"] input[type="file"]', decodeURIComponent(new URL("./fixtures/logo.png", import.meta.url).pathname));
ok("brand logo preview appears in the form", (await page.locator('[data-testid="logo-preview"]').count()) === 1);
await page.fill('input[name="email"]', email);
await page.fill('input[name="phone"]', "12345");
await page.click('button[type="submit"]:has-text("Generate quotation")');
await page.waitForSelector("text=Enter a 10-digit mobile number");
ok("invalid mobile number is rejected and the name is kept", (await page.inputValue('input[name="name"]')) === "Abhinav Verma");
await page.fill('input[name="phone"]', phone);
await Promise.all([page.waitForURL("**/orders/quotations/**"), page.click('button[type="submit"]:has-text("Generate quotation")')]);

/* ---------- 4. OTP sign-in popup on the marketplace (no separate page) ---------- */
ok("new advertiser lands on the Orders section with the sign-in popup", page.url().includes("login=1"), page.url());
await page.waitForSelector('[data-testid="login-dialog"]');
ok("sign-in prompt shown under the normal header", (await page.locator('[data-testid="orders-signin-prompt"]').count()) === 1 && (await page.locator("header").count()) === 1);
const code = (await page.locator('[data-testid="dev-code"]').textContent()).trim();
ok("popup opens on the code step with the demo code (6 digits)", /^\d{6}$/.test(code), code);
await page.fill('[data-testid="login-dialog"] input[name="code"]', "000000");
await page.click('[data-testid="login-dialog"] button:has-text("Verify")');
await page.waitForSelector("text=That code is not right");
ok("wrong code is rejected", true);
await page.fill('[data-testid="login-dialog"] input[name="code"]', code);
await page.click('[data-testid="login-dialog"] button:has-text("Verify")');
await page.waitForSelector('[data-testid="quotation-doc"]');
ok("correct code signs in and reveals the quotation in place", /\/orders\/quotations\/\d+/.test(page.url()) && (await page.locator('[data-testid="login-dialog"]').count()) === 0, page.url());
ok("header now shows Orders", (await page.locator('[data-testid="orders-link"]').count()) === 1);
ok("created notice shown", await page.locator('[data-testid="created-notice"]').isVisible());
const pages = await page.locator(".q-page").count();
ok(`quotation document has cover, rates, summary, divider, 3 locations and thank-you (${pages})`, pages === 8, String(pages));
const docText = await page.locator('[data-testid="quotation-doc"]').textContent();
ok("cover shows the brand logo beside the company name", (await page.locator('[data-testid="quote-logo"] img').count()) === 1 && (await page.locator('[data-testid="quote-logo"] img').evaluate((i) => i.complete && i.naturalWidth > 0)));
ok("document names the client company", docText.includes("Eyverse OOH Agency"));
ok("document carries GST line and grand total", docText.includes("18% GST") && docText.includes("GRAND TOTAL"));
ok("header shows the advertiser's name", (await page.locator("header").textContent()).includes("Abhinav"));
await page.screenshot({ path: `${SHOTS}/quotation-doc.png`, fullPage: true });
await page.emulateMedia({ media: "print" });
await page.pdf({ path: `${SHOTS}/quotation.pdf`, landscape: true, format: "A4", printBackground: true, preferCSSPageSize: true });
await page.emulateMedia({ media: "screen" });
ok("PDF rendered to e2e/shots/quotation.pdf", true);

/* ---------- 5. my account ---------- */
await page.click('[data-testid="orders-link"]');
await page.waitForURL("**/orders");
ok("Orders → active quotations lists the new one", (await page.locator('[data-testid^="quote-"]').count()) >= 1);
await page.click('[data-testid="orders-tabs"] a:has-text("Orders")');
await page.waitForURL("**/orders/placed");
ok("orders tab shows the empty state", (await page.locator('[data-testid="orders-empty"]').count()) === 1);
await page.goto(`${BASE}/admin`);
ok("advertiser cannot open admin", !page.url().includes("/admin"), page.url());

/* ---------- 6. second quotation while signed in skips OTP ---------- */
await page.goto(`${BASE}/listing?view=map`);
await page.waitForSelector('[data-testid="site-00016"]');
await page.locator('[data-testid="site-00016"] [data-testid="add-00016"]').click();
await page.goto(`${BASE}/quote/new`);
await page.waitForSelector('[data-testid="line-00016"]');
ok("signed-in builder prefills the mobile number", (await page.inputValue('input[name="phone"]')) === phone);
await Promise.all([page.waitForURL("**/orders/quotations/**"), page.click('button[type="submit"]:has-text("Generate quotation")')]);
ok("signed-in advertiser gets the quotation directly", page.url().includes("created=1") && !page.url().includes("login=1"));
await page.goto(`${BASE}/orders`);
ok("two active quotations now", (await page.locator('[data-testid^="quote-"]').count()) >= 2);

/* ---------- 7. sign out, come back through the header popup with mobile + OTP ---------- */
await page.click('button:has-text("Sign out")');
await page.waitForURL("**/login**");
await page.goto(`${BASE}/`);
await page.click('[data-testid="open-login"]');
await page.waitForSelector('[data-testid="login-dialog"]');
await page.fill('[data-testid="login-dialog"] input[name="phone"]', "9000000000");
await page.click('[data-testid="login-dialog"] button[type="submit"]');
await page.waitForSelector("text=No advertiser account");
ok("unknown number is refused", true);
await page.fill('[data-testid="login-dialog"] input[name="phone"]', phone);
await page.click('[data-testid="login-dialog"] button[type="submit"]');
await page.waitForSelector('[data-testid="dev-code"]');
const code2 = (await page.locator('[data-testid="dev-code"]').textContent()).trim();
await page.fill('[data-testid="login-dialog"] input[name="code"]', code2);
await Promise.all([page.waitForURL("**/orders"), page.click('[data-testid="login-dialog"] button:has-text("Verify")')]);
ok("returning advertiser signs in from the home page and lands on Orders", page.url().endsWith("/orders"));

await browser.close();
console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
