export const vendorNav = [
  { href: "/vendor/dashboard", label: "Dashboard", sub: "Main Overview", icon: "dashboard" },
  { href: "/vendor/screens", label: "My Screens", sub: "Manage Hardware", icon: "screens" },
  { href: "/vendor/campaigns", label: "Campaigns", sub: "Creative Content", icon: "campaigns" },
  { href: "/vendor/slots", label: "Slot Status", sub: "Inventory Control", icon: "slots" },
  { href: "/vendor/earnings", label: "Earnings", sub: "Revenue & Payouts", icon: "earnings" },
  { href: "/vendor/media", label: "Media", sub: "Asset Library", icon: "media" },
  { href: "/vendor/analytics", label: "Analytics", sub: "Performance Data", icon: "analytics" },
] as const;

export const vendorProfile = {
  initials: "MA",
  avatar: "/img/vendor/vendor-avatar.jpg",
  name: "DOOH Vendor.",
  badge: "Verified DOOH Partner",
  screens: "05",
  activeAds: "12",
  since: "Partner since May 2026",
  user: { name: "Rajeev Mehra", role: "Premium DOOH Partner", avatar: "/img/vendor/avatar-rajeev.jpg" },
};

/* ---------- Campaign order ---------- */

export const campaignOrder = {
  client: {
    name: "Samsung Electronics",
    logo: "/img/vendor/samsung-logo.jpg",
    tags: [
      { icon: "industry", label: "Consumer Tech" },
      { icon: "globe", label: "South Korea (Global)" },
      { icon: "key", label: "Key Account", highlight: true },
    ],
    contact: { name: "Alex Mercer", role: "Account Director", avatar: "/img/vendor/avatar-alex.jpg" },
  },
  support: {
    name: "David Chen",
    role: "Key Account Manager",
    avatar: "/img/vendor/avatar-david.jpg",
  },
  specs: [
    { icon: "slot", label: "Selected Slot", value: "Premium A-Level ", strong: "20 sec slot", tone: "green" },
    { icon: "timer", label: "Duration", value: "90 dyas / 3 months", tone: "orange" },
    { icon: "pin", label: "Location", value: "Times Square North,...", tone: "orange" },
    { icon: "audience", label: "Target Audience", value: "Gen-Z, Commuters", tone: "green" },
  ],
  inventory: [
    { title: "TSQ Mega-Spectacular", location: "Broadway & 45th St, NY", image: "/img/vendor/tsq.jpg" },
    { title: "Transit Network - Penn Station", location: "Main Concourse, NY", image: "/img/vendor/penn.jpg" },
  ],
  contract: { file: "LOKY_OOH_Contract_2024_Final.pdf", verified: "Verified by LOKY Legal on May 24, 2024" },
  creative: { image: "/img/vendor/creative.jpg" },
  verification: [
    { icon: "camera", title: "Campaign\nPhoto", body: "High-res JPG or PNG only", tone: "green" },
    { icon: "video", title: "Video Loop", body: "Full 15s play proof", tone: "orange" },
    { icon: "gps", title: "GPS\nVerification", body: "Fetch device telemetry", tone: "grey", chip: "AUTO-DETECTING" },
    { icon: "calendar", title: "Date & Time", body: "Embedded EXIF\nmetadata", tone: "orange" },
  ],
};

/* ---------- Earnings ---------- */

export const earnings = {
  campaign: {
    name: "Samsung Winter Sale",
    agency: "Cheil Worldwide",
    tile: "/img/vendor/samsung-tile.jpg",
    duration: "3 Months Duration",
    region: "PAN India OOH",
    total: "₹1,20,000",
  },
  stats: [
    { label: "Total Vendor Revenue", value: "₹1,20,000", tag: "100%", trend: true, tone: "plain" },
    { label: "Amount Disbursed", value: "₹40,000", tag: "PAID", tone: "green" },
    { label: "Pending Settlements", value: "₹80,000", tag: "2 REMAINING", tone: "orange" },
  ],
  lifecycle: [
    { title: "Month 1: Settlement Released", body: "Transaction ID: TXN_88291039 | Dec 15, 2023", amount: "₹40,000", state: "done" },
    { title: "Month 2: Scheduled Disbursal", body: "Est. Release Date: Jan 15, 2024 (Processing)", amount: "₹40,000", state: "active" },
    { title: "Month 3: Upcoming Cycle", body: "Est. Release Date: Feb 15, 2024", amount: "₹40,000", state: "locked" },
  ],
  documents: [
    { title: "Download Invoice", meta: "PDF • 1.2 MB", icon: "invoice", tone: "green" },
    { title: "GST Report", meta: "XLSX • 450 KB", icon: "sheet", tone: "orange" },
    { title: "Settlement Sheet", meta: "PDF • 2.1 MB", icon: "chart", tone: "grey" },
  ],
  policy:
    "Settlements are processed 45 days after the completion of each campaign month. Ensure all execution proof photographs are uploaded to the media vault for timely release of the second installment.",
  lead: { name: "Anish Kapoor", role: "Senior Accounts Lead", avatar: "/img/vendor/avatar-anish.jpg" },
};

/* ---------- Slot management ---------- */

export const slotStats = [
  { icon: "grid", label: "Total Slots", value: "40", sub: "Across 5 screens", tone: "green" },
  { icon: "pie", label: "Occupied", value: "34", sub: "85% Capacity", tone: "red" },
  { icon: "check", label: "Available", value: "06", sub: "Open for booking", tone: "green" },
  { icon: "loop", label: "Loop Timing", value: "120s", sub: "Average cycle", tone: "red" },
];

export type Screen = {
  id: string;
  title: string;
  location: string;
  code: string;
  image: string;
  used: number;
  total: number;
  loop: string;
  tone: "green" | "rust";
  activeAds?: string;
  alert?: string;
};

export const screens: Screen[] = [
  {
    id: "cyberhub",
    title: "Premium Wall - Cyber Hub",
    location: "DLF Phase 3, Gurgaon",
    code: "#SW-902",
    image: "/img/vendor/cyberhub.jpg",
    used: 5,
    total: 8,
    loop: "120 Seconds",
    tone: "green",
    activeAds: "12 Creative Assets",
  },
  {
    id: "atrium",
    title: "Atrium Totem - Ambience",
    location: "DLF Phase 3, Gurgaon",
    code: "#SW-902",
    image: "/img/vendor/atrium.jpg",
    used: 4,
    total: 6,
    loop: "80 Seconds",
    tone: "rust",
    alert: "Hardware Alert",
  },
];

export const currentAds = [
  { title: "BMW Festive Drive '26", meta: "Ends in 4 days • High Priority", thumb: "/img/vendor/ad-bmw.jpg" },
  { title: "Zomato Gold - Midnight", meta: "Ends in 12 days • Standard", thumb: "/img/vendor/ad-zomato.jpg" },
  { title: "Samsung S26 Launch", meta: "Ends in 28 days • Premium", thumb: "/img/vendor/ad-samsung.jpg" },
];
