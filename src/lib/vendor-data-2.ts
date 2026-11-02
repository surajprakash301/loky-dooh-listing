/* Mock data for the DOOH Partner screens (dashboard, my screens, campaigns list,
   earnings overview, analytics, media & proofs). */

/* ---------- Dashboard ---------- */

export const dashboardStats = [
  { icon: "monitor", label: "Active Screens", value: "01", of: "/01", foot: "+1 this month", footTone: "green" },
  { icon: "megaphone", label: "Campaign Requests/Order", value: "00", unit: "Orders", foot: "Waiting for First Order", footTone: "orange", labelTone: "orange" },
  { icon: "play", label: "Running Campaigns", value: "00", foot: "Active now", footTone: "green" },
  { icon: "wallet", label: "Monthly Earnings", value: "₹00", unit: ".00", foot: "+12.5% vs Last Mo.", footTone: "green" },
  { icon: "alert", label: "Pending Actions", value: "00", foot: "Immediate Attention", footTone: "plain" },
] as const;

export const readiness = [
  { label: "Profile Verified", done: true },
  { label: "Inventory Approved", done: true },
  { label: "Marketplace Published", done: true },
  { label: "First Campaign order", done: false },
  { label: "First Campaign Completed", done: false },
];

export const orderJourney = [
  { icon: "search", label: "Agency\nCreates\nOrder" },
  { icon: "check-square", label: "Brand\nApproves\nCampaign" },
  { icon: "monitor", label: "Vendor\nReceives\nRequest", active: true },
  { icon: "list", label: "Vendor\nConfirms\nAvailability" },
  { icon: "rocket", label: "Campaign\nStarts" },
  { icon: "upload", label: "Vendor\nUploads\nProof" },
  { icon: "wallet", label: "Payment\nReleased", done: true },
];

export const quickActions = [
  { icon: "receive", label: "Receive\nOrders" },
  { icon: "screens", label: "Manage\nScreens" },
  { icon: "upload", label: "Upload\nProofs" },
  { icon: "trend", label: "Track\nEarnings" },
  { icon: "expand", label: "Expand Stock" },
];

export const learning = [
  { icon: "orders", title: "How Orders Work", sub: "Step-by-step video guide" },
  { icon: "book", title: "Guidelines for Assets", sub: "Technical specs for creative" },
];

export const demandOptions = [
  { label: "Real Estate", level: "High", tone: "orange" },
  { label: "Automobile", level: "Medium", tone: "green" },
  { label: "Retail", level: "High", tone: "orange" },
  { label: "Education", level: "Growing", tone: "green" },
];

export const comingSoon = ["Real-time Analytics", "Automated Reporting", "Traffic Intelligence"];

/* ---------- My Screens ---------- */

export const screenKpis = [
  { label: "Network Uptime", value: "99.82%", icon: "check", tone: "solid" },
  { label: "Available Inventory", value: "14 Units", icon: "layers", tone: "plain" },
  { label: "Monthly Yield", value: "₹124,500", icon: "wallet", tone: "outline" },
];

export const screenCounts = [
  { value: "04", label: "Live Now", icon: "live", tone: "green" },
  { value: "01", label: "Offline", icon: "offline", tone: "red" },
  { value: "00", label: "Maintenance", icon: "wrench", tone: "red" },
  { value: "00", label: "Limited", icon: "calendar", tone: "green" },
];

export type MyScreen = {
  id: string;
  title: string;
  location: string;
  image: string;
  status: "live" | "offline";
  lokySense?: boolean;
  used: number;
  total: number;
  metric1: { label: string; value: string; note?: string };
  metric2: { label: string; value: string };
  alert?: { title: string; body: string };
  actions: string[];
};

export const myScreens: MyScreen[] = [
  {
    id: "cyberhub",
    title: "Premium Wall - Cyber Hub",
    location: "DLF Phase 3, Gurgaon",
    image: "/img/vendor/screen-cyberhub.jpg",
    status: "live",
    used: 5,
    total: 8,
    metric1: { label: "Daily Earnings", value: "₹14,200" },
    metric2: { label: "Loop Time", value: "120s" },
    actions: ["Update Slots", "View Campaigns"],
  },
  {
    id: "atrium",
    title: "Atrium Totem - Ambience",
    location: "Vasant Kunj, South Delhi",
    image: "/img/vendor/screen-atrium.jpg",
    status: "offline",
    used: 2,
    total: 8,
    metric1: { label: "Projected Revenue", value: "₹8,500", note: "(-22%)" },
    metric2: { label: "SLA Status", value: "Urgent" },
    alert: { title: "Power Failure", body: "The screen lost connectivity at 11:20 PM. Attempting automated remote restart..." },
    actions: ["Restart Device", "Contact Tech"],
  },
  {
    id: "airport",
    title: "Airport Terminal 3 Gate B",
    location: "IGI Airport, New Delhi",
    image: "/img/vendor/screen-airport.jpg",
    status: "live",
    lokySense: true,
    used: 8,
    total: 8,
    metric1: { label: "Monthly Run Rate", value: "₹4.2L" },
    metric2: { label: "Ads Count", value: "12 Slots" },
    actions: ["Sold Out", "View Campaigns"],
  },
];

/* ---------- Campaign orders (list) ---------- */

export const orderHealth = [
  { label: "New Requests", value: "12", foot: "3 from yesterday", icon: "trend", bg: "linear-gradient(135deg,#e4572e,#d8622f)" },
  { label: "Scheduled", value: "28", foot: "Starting next 48h", icon: "calendar", bg: "linear-gradient(135deg,#2563eb,#3b82f6)" },
  { label: "Live Now", value: "45", foot: "Across 182 screens", icon: "store", bg: "linear-gradient(135deg,#0c6b3a,#0f7a42)" },
  { label: "Proof Pending", value: "08", foot: "Verification needed", icon: "proof", bg: "linear-gradient(135deg,#7c3aed,#9333ea)" },
  { label: "Completed", value: "156", foot: "This month", icon: "check", bg: "linear-gradient(135deg,#9aa39d,#7b857e)" },
];

export const campaignJourney = [
  { icon: "edit", label: "Agency\nCreates", state: "done" },
  { icon: "eye", label: "Vendor\nReviews", state: "done" },
  { icon: "approve", label: "Vendor\nApproves", state: "active" },
  { icon: "cloud", label: "Creative\nReceived" },
  { icon: "play", label: "Live" },
  { icon: "file", label: "Proof\nUploaded" },
  { icon: "shield", label: "LOKY Verifies" },
  { icon: "sparkle", label: "Brand Sees" },
];

export const newOrder = {
  brand: "Samsung Electronics",
  hq: "Global HQ: Seoul, South Korea",
  logo: "/img/vendor/samsung-logo.jpg",
  proof: "/img/vendor/campaign-proof.jpg",
  chip: "confirm new campaign booking",
  category: "Consumer Electronics",
  starts: "June 15, 2024",
  duration: "3 months",
  screens: "#01010,#02010...",
  slot: "starter visibility- 15sec",
  bookings: "02 Locations",
  contact: { name: "Alex Mercer", role: "Account Director", avatar: "/img/vendor/avatar-alex.jpg" },
};

export const secondOrder = {
  title: "Summer Gala 2024",
  agency: "Agency: Prime Media Dynamics",
  logo: "/img/vendor/samsung-logo.jpg",
  starts: "June 15, 2024",
  duration: "14 Days",
  screen: "42nd St Billboard",
  slot: "Premium 15s/3min",
};

/* ---------- Earnings overview ---------- */

export const earningKpis = [
  { icon: "total", label: "Total Earnings", value: "₹4,80,000", foot: "Lifetime Revenue", tone: "green" },
  { icon: "withdraw", label: "Available For Withdrawal", value: "₹40,000", foot: "Ready for release", tone: "solid" },
  { icon: "pending", label: "Pending Payouts", value: "₹80,000", foot: "Awaiting schedule", tone: "orange" },
  { icon: "shield", label: "Under Verification", value: "₹60,000", foot: "Campaign validation", tone: "green" },
  { icon: "orders", label: "Active Revenue Orders", value: "06", foot: "Generating revenue", tone: "green" },
];

export const payoutJourney = [
  { icon: "building", label: "Brand\nPayment", tone: "green" },
  { icon: "wallet", label: "LOKY\nWallet", tone: "green" },
  { icon: "verify", label: "Campaign\nVerification", tone: "orange" },
  { icon: "schedule", label: "Payout\nScheduled", tone: "grey" },
  { icon: "settle", label: "Vendor\nSettlement", tone: "grey" },
  { icon: "bank", label: "Bank\nTransfer", tone: "grey" },
];

export const upcomingPayouts = [
  { meta: "15 Dec, 2023 • Scheduled", title: "Samsung Galaxy Launch", amount: "₹40,000", tone: "green" },
  { meta: "Verification Pending", title: "BMW X5 Campaign", amount: "₹60,000", tone: "orange" },
];

export const revenueOrders = [
  { title: "Zomato Holiday Blast", status: "LIVE", total: "₹1,20,000", received: "₹60,000", pct: 50, foot: "50% Payout Completed", tone: "green" },
  { title: "Coca Cola Summer", status: "SETTLING", total: "₹85,000", received: "₹85,000", pct: 100, foot: "Final Settlement in Progress", tone: "red" },
];

export const settlements = [
  { title: "Nike Air Max Day", meta: "Settlement ID: LKY-98231 • 02 Dec 2023", status: "RELEASED", amount: "₹1,25,000", thumb: "/img/vendor/settle-1.jpg" },
  { title: "TATA Motors EV Launch", meta: "Settlement ID: LKY-98212 • 28 Nov 2023", status: "PROCESSING", amount: "₹72,000", thumb: "/img/vendor/settle-2.jpg" },
  { title: "Amazon Diwali Special", meta: "Settlement ID: LKY-98001 • 15 Nov 2023", status: "FAILED", amount: "₹2,10,000", thumb: "/img/vendor/settle-3.jpg" },
];

export const wallet = { total: "₹1.8L", parts: [{ label: "Available", value: "₹40k", pct: 22, color: "#007a3e" }, { label: "Scheduled", value: "₹80k", pct: 45, color: "#a23e1c" }, { label: "Verification", value: "₹60k", pct: 33, color: "#fe825a" }] };

export const accountManager = { name: "Marcus Sterling", role: "OOH Operations Specialist", avatar: "/img/vendor/avatar-marcus.jpg" };

export const paymentRequests = [
  { icon: "report", label: "Report Missing Settlement" },
  { icon: "invoice", label: "Raise Invoice Issue" },
  { icon: "bank", label: "Update Bank Details" },
];

/* ---------- Analytics ---------- */

export const analyticsKpis = [
  { label: "Impressions", value: "24.5M" },
  { label: "Active Campaigns", value: "12" },
  { label: "Avg. Frequency", value: "4.2x" },
  { label: "Est. Reach", value: "6.8M" },
];

export const trafficHours = [
  { h: "08:00", v: 42 },
  { h: "10:00", v: 58 },
  { h: "12:00", v: 48, bold: true },
  { h: "14:00", v: 68 },
  { h: "16:00", v: 86, bold: true },
  { h: "18:00", v: 100, peak: true },
  { h: "20:00", v: 66 },
  { h: "22:00", v: 52 },
];

export const topScreens = [
  { rank: 1, title: "Premium Wall - Cyber Hub", id: "#01020", location: "DLF PHASE 3, GURGAON", revenue: "₹8.2L", image: "/img/vendor/top-1.jpg" },
  { rank: 2, title: "Atrium Totem - Ambience", id: "#01020", location: "VASANT KUNJ, NEW DELHI", revenue: "₹5.4L", image: "/img/vendor/top-2.jpg" },
  { rank: 3, title: "Terminal 3 - Main Hall", id: "#01020", location: "IGI AIRPORT, DELHI", revenue: "₹4.9L", image: "/img/vendor/top-3.jpg" },
];

export const peakTiming = [
  { label: "Morning Rush (07:00-09:00)", pct: 82, tone: "#007a3e" },
  { label: "Lunch Period (12:00-14:00)", pct: 45, tone: "#4f9a6a" },
  { label: "Evening Rush (17:00-19:00)", pct: 94, tone: "#005220" },
];

export const weekly = [
  { d: "MON", v: 55 },
  { d: "TUE", v: 72 },
  { d: "WED", v: 62 },
  { d: "THU", v: 82 },
  { d: "FRI", v: 100, peak: true },
  { d: "SAT", v: 70 },
  { d: "SUN", v: 50 },
];

/* ---------- Media & Proofs ---------- */

export const mediaKpis = [
  { icon: "image", label: "Total Media", value: "2,842 Items", tone: "green" },
  { icon: "clock", label: "Pending Review", value: "128 Proofs", tone: "orange" },
  { icon: "badge", label: "Approved Assets", value: "2,415 Items", tone: "green" },
  { icon: "alert", label: "Rejected/Issues", value: "14 Flagged", tone: "red" },
];

export const mediaTabs = ["All Media", "Day Proofs", "Night View", "Traffic Videos"];

export const recentProofs = [
  { title: "BMW Festive '26", sub: "SECTOR 29 PILLAR #4", by: "Verified by System • 2m ago", thumb: "/img/vendor/proof-bmw.jpg" },
  { title: "Samsung Galaxy S26", sub: "CYBER HUB ENTRY", by: "Verified by David C. • 1h ago", thumb: "/img/vendor/proof-samsung.jpg" },
];

export const rejectedProof = {
  screen: "Ambience Mall - Totem A",
  quote: "\"The photo is too blurry and taken from an angle where the brand logo isn't clearly visible. Please re-upload a clear eye-level shot.\"",
};
