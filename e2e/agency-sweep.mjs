/** Screenshot every agency/admin screen for visual QA. Usage: AGENCY_EMAIL=... AGENCY_PASS=... node e2e/agency-sweep.mjs */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000"; const OUT = path.join(HERE, "shots", "agency"); mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
const issues = []; let cur = "";
page.on("console", (m) => { if (m.type() === "error") issues.push(`${cur}: ${m.text().slice(0, 160)}`); });
page.on("response", (r) => { if (r.status() >= 400) issues.push(`${cur}: http ${r.status()} ${r.url().replace(BASE, "")}`); });
async function shot(name, url) { cur = name; await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" }).catch((e) => issues.push(`${name}: ${e.message.slice(0, 80)}`)); const ov = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2); if (ov) issues.push(`${name}: horizontal overflow`); await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true }); console.log("shot", name, page.url().replace(BASE, "")); }
async function login(u, p) { await ctx.clearCookies(); await page.goto(`${BASE}/login`); await page.fill('input[name="username"]', u); await page.fill('input[name="password"]', p); await Promise.all([page.waitForURL((x) => !x.pathname.startsWith("/login")), page.click('button[type="submit"]')]); }
await shot("00-register", "/agency/register"); await shot("01-login", "/login");
await login(process.env.AGENCY_EMAIL, process.env.AGENCY_PASS);
const ids = JSON.parse(process.env.IDS ?? "{}");
await shot("10-dashboard", "/agency"); await shot("11-brands", "/agency/brands"); await shot("12-brand", `/agency/brands/${ids.brand}`); await shot("13-team", "/agency/team"); await shot("14-screens", "/agency/screens");
await shot("15-proposals", "/agency/proposals"); await shot("16-proposal-new", "/agency/proposals/new"); await shot("17-proposal", `/agency/proposals/${ids.proposal}`);
await shot("18-quotations", "/agency/quotations"); await shot("19-quotation-new", `/agency/quotations/new?proposal=${ids.proposal}`); await shot("20-quotation", `/agency/quotations/${ids.quotation}`);
await shot("21-campaigns", "/agency/campaigns"); await shot("22-campaign", `/agency/campaigns/${ids.campaign}`); await shot("23-payments", "/agency/payments"); await shot("24-settings", "/agency/settings"); await shot("25-assessment-success", "/agency/assessment/success");
await ctx.clearCookies(); await shot("30-public-pitch", `/p/${ids.ptoken}`); await shot("31-public-quote", `/q/${ids.qtoken}`);
await login("aakash@mehramedia.in", "Agency@12345"); await shot("40-seeded-agency-dashboard", "/agency");
await login("admin", "Admin@12345"); await shot("50-admin-agencies", "/admin/agencies"); await shot("51-admin-agency", `/admin/agencies/${ids.agency}`); await shot("52-admin-coupons", "/admin/coupons");
await login("bulzads-demo", "Vendor@12345"); await shot("60-vendor-screens-occupancy", "/vendor/screens");
await browser.close();
console.log("\nISSUES:", issues.length ? "\n" + [...new Set(issues)].join("\n") : "none");
