export type Tier = "exclusive" | "partner" | "operated";

export type Billboard = {
  id: string;
  name: string;
  locality: string;
  city: string;
  tier: Tier;
  category: string;
  image: string;
  images: string[];
  lokySense: boolean;
  specs: string[];
  stats: {
    dailyImpression: string;
    loopTime: { m: number; s: number };
    displayTech: { value: string; unit: string };
    adSlots: { used: number; total: number };
  };
  price: number;
  originalPrice: number;
  slotLabel: string;
};

export { TIER_LABEL } from "@/lib/domain";

const baseStats = {
  dailyImpression: "103k+",
  loopTime: { m: 3, s: 45 },
  displayTech: { value: "P4", unit: "LED" },
  adSlots: { used: 5, total: 8 },
};

export const billboards: Billboard[] = [
  {
    id: "01010",
    name: "BHIVE LED Digital Billboard - HSR Prime Junction",
    locality: "HSR Layout",
    city: "Bangalore",
    tier: "exclusive",
    category: "Shopping Complex",
    image: "/img/billboard-day.jpg",
    images: ["/img/billboard-day.jpg", "/img/billboard-night.jpg"],
    lokySense: true,
    specs: ["3840Hz (Flicker-Free)", "160° (H) / 140° (V)", "7500 nits"],
    stats: baseStats,
    price: 3500,
    originalPrice: 6000,
    slotLabel: "20s Slot /day",
  },
  {
    id: "01020",
    name: "BHIVE LED Digital Billboard - HSR Prime Junction",
    locality: "HSR Layout",
    city: "Bangalore",
    tier: "partner",
    category: "Road side",
    image: "/img/billboard-night.jpg",
    images: ["/img/billboard-night.jpg", "/img/billboard-day.jpg"],
    lokySense: false,
    specs: ["3840Hz (Flicker-Free)", "160° (H) / 140° (V)", "7500 nits"],
    stats: baseStats,
    price: 3500,
    originalPrice: 6000,
    slotLabel: "20s Slot /day",
  },
  {
    id: "01030",
    name: "BHIVE LED Digital Billboard - HSR Prime Junction",
    locality: "HSR Layout",
    city: "Bangalore",
    tier: "partner",
    category: "Road side",
    image: "/img/billboard-night.jpg",
    images: ["/img/billboard-night.jpg", "/img/billboard-day.jpg"],
    lokySense: false,
    specs: ["3840Hz (Flicker-Free)", "160° (H) / 140° (V)", "7500 nits"],
    stats: baseStats,
    price: 3500,
    originalPrice: 6000,
    slotLabel: "20s Slot /day",
  },
  {
    id: "01040",
    name: "BHIVE LED Digital Billboard - HSR Prime Junction",
    locality: "HSR Layout",
    city: "Bangalore",
    tier: "exclusive",
    category: "Shopping Complex",
    image: "/img/billboard-day.jpg",
    images: ["/img/billboard-day.jpg", "/img/billboard-night.jpg"],
    lokySense: true,
    specs: ["3840Hz (Flicker-Free)", "160° (H) / 140° (V)", "7500 nits"],
    stats: baseStats,
    price: 3500,
    originalPrice: 6000,
    slotLabel: "20s Slot /day",
  },
  {
    id: "01050",
    name: "BHIVE LED Digital Billboard - HSR Prime Junction",
    locality: "HSR Layout",
    city: "Bangalore",
    tier: "partner",
    category: "Road side",
    image: "/img/billboard-night.jpg",
    images: ["/img/billboard-night.jpg", "/img/billboard-day.jpg"],
    lokySense: false,
    specs: ["3840Hz (Flicker-Free)", "160° (H) / 140° (V)", "7500 nits"],
    stats: baseStats,
    price: 3500,
    originalPrice: 6000,
    slotLabel: "20s Slot /day",
  },
  {
    id: "01060",
    name: "BHIVE LED Digital Billboard - HSR Prime Junction",
    locality: "HSR Layout",
    city: "Bangalore",
    tier: "partner",
    category: "Road side",
    image: "/img/billboard-night.jpg",
    images: ["/img/billboard-night.jpg", "/img/billboard-day.jpg"],
    lokySense: false,
    specs: ["3840Hz (Flicker-Free)", "160° (H) / 140° (V)", "7500 nits"],
    stats: baseStats,
    price: 3500,
    originalPrice: 6000,
    slotLabel: "20s Slot /day",
  },
];

export const popularLocalities = [
  { name: "HSR Layout", count: 2 },
  { name: "Hebbal" },
  { name: "Koramangala" },
  { name: "Electronic City" },
  { name: "Whitefield" },
  { name: "MG Road Bangalore" },
  { name: "Indiranagar" },
  { name: "Yelahanka" },
  { name: "Rajajinagar" },
  { name: "Bellandur" },
  { name: "Jayanagar" },
  { name: "CBD Bangalore" },
];

export const categories = [
  { id: "all", label: "ALL", icon: "lume" },
  { id: "road", label: "Road side", icon: "road" },
  { id: "railway", label: "Railway station", icon: "railway" },
  { id: "airport", label: "Airports", icon: "airport" },
  { id: "mall", label: "Malls", icon: "mall" },
  { id: "shopping", label: "Shopping Complex", icon: "shopping" },
  { id: "fuel", label: "Fuel Stations", icon: "fuel" },
] as const;

export const homeCategories = [
  { id: "all", label: "ALL", icon: "lume" },
  { id: "road", label: "Road side", icon: "road" },
  { id: "railway", label: "Railway station", icon: "railway" },
  { id: "airport", label: "Airports", icon: "airport" },
  { id: "bus", label: "Bus stations", icon: "bus" },
  { id: "mall", label: "Malls", icon: "mall" },
  { id: "shopping", label: "Shopping Complex", icon: "shopping" },
  { id: "fuel", label: "Fuel Stations", icon: "fuel" },
] as const;

export const tierFilters = [
  { id: "all", label: "ALL" },
  { id: "exclusive", label: "Loky Exclusive ✨" },
  { id: "partner", label: "Loky Partner" },
  { id: "operated", label: "Loky Operated" },
] as const;

export const locationTree = [
  {
    state: "Bihar",
    count: 30,
    checked: true,
    open: true,
    cities: [
      { name: "Patna", count: "08" },
      { name: "Hazipur", count: "01" },
    ],
  },
  { state: "Uttar Pradesh", count: 30, cities: [] },
  { state: "Maharashtra", count: 30, cities: [] },
  { state: "New Delhi", count: 0, comingSoon: true, cities: [] },
];

export const durations = ["1Day", "1 M", "3 M", "6 M", "12 M", "YTD", "2weeks"];

export const budgetOptions = [
  { label: "‹ ₹35,000", count: 123 },
  { label: "₹35,000 - ₹40,000", count: 62 },
  { label: "₹40,000 - ₹50,000", count: 110 },
  { label: "› ₹50,000", count: 41 },
];

export const dimensionOptions = [
  { label: "20W X 10H", count: 87 },
  { label: "10W X 40H", count: 26 },
  { label: "15W X 25H", count: 23 },
  { label: "10W X 20H", count: 23 },
];

export const screenTypeOptions = [
  { label: "double unipoll", count: 87, icon: "unipole" },
  { label: "lollipop standees", count: 26, icon: "lollipop" },
  { label: "double unipoll", count: 87, icon: "unipole" },
  { label: "lollipop standees", count: 26, icon: "lollipop" },
];

/* ---------------- Detail page ---------------- */

export const detailBillboard = {
  id: "01010",
  title: "DOOH - LOKY LUME, JagdevPath, Rukanpura (Biggest Billboard in Patna)#01010",
  breadcrumb: "LOKY LUME, JagdevPath, Rukanpura (Biggest Billboard in Patna) #01010",
  address:
    "PK Complex, Rukanpura Bailey road, fly over, near Sai corporate, Rukanpura, Patna, Bihar 800014.",
  gallery: [
    "/img/billboard-night.jpg",
    "/img/billboard-night.jpg",
    "/img/billboard-night.jpg",
    "/img/billboard-night.jpg",
    "/img/billboard-night.jpg",
  ],
  partner: {
    logo: "/img/partner-logo.png",
    name: "Loky Lume Exclusive Partnership",
    board: "Bulz Ads Digital Billboard #01020.",
    weeklyPrice: "₹ 20,167 / Per Week",
    dailyPrice: "₹ 2,567 / per day",
    rating: "4.8",
    ratingLabel: "google rating Top Rated (500)",
  },
  quickSpecs: [
    { icon: "megaphone", label: "89,300 Reach/Day" },
    { icon: "target", label: "9:00 AM - 11:00 PM", sub: "Operational time" },
    { icon: "target", label: "Urban" },
    { icon: "target", label: "16 X 9 Sqft" },
    { icon: "target", label: "Urban" },
    { icon: "target", label: "16 X 9 Sqft" },
  ],
};

export const offers = [
  {
    title: "Get 20% OFF",
    body: "On wednesday bookings at OYO INNOV8 using coupon MIDWEEK20",
    image: "/img/offer-1.jpg",
    gradient: "linear-gradient(90deg,#4a2c1e 0%,#8a5a3c 100%)",
  },
  {
    title: "Get 20% OFF",
    body: "On Thu and Fri bookings at WEWORK using coupon GETWW20",
    image: "/img/offer-2.jpg",
    gradient: "linear-gradient(90deg,#2a5f6e 0%,#5d9aa8 100%)",
  },
  {
    title: "Get 20% OFF",
    body: "On Sat bookings at WEWORK or OYO Innov8 using coupon SATURDAYS20",
    image: "/img/offer-3.jpg",
    gradient: "linear-gradient(90deg,#3c1e4a 0%,#6b3f7e 100%)",
  },
  {
    title: "Get Flat 10% OFF",
    body: "On your 1st purchase using coupon WELCOME",
    note: "*Apply on order summary page",
    image: "/img/offer-4.png",
    gradient: "linear-gradient(90deg,#1b2a8a 0%,#3d55c8 100%)",
    full: true,
  },
];

export const slots = [
  { seconds: 10, label: "Starter\nVisibility" },
  { seconds: 20, label: "🔥Most\nPopular" },
  { seconds: 30, label: "Premium\nDominance" },
];

export const packages = [
  {
    id: "day",
    name: "COMING SOON",
    months: 1,
    unit: "Day",
    was: "₹4,500/Per Day",
    price: "₹ 2500",
    per: "/Per Day",
    disabled: true,
  },
  { id: "quarterly", name: "Quarterly Package", months: 1, unit: "Months", was: "₹75,000/Month", off: "14% Off", price: "₹ 65,000", per: "/Month" },
  { id: "monthly", name: "Monthly Package", months: 3, unit: "Months", was: "₹75,000/Month", off: "26%Off", price: "₹ 55,000", per: "/Month" },
  { id: "half", name: "Half Yearly Package", months: 6, unit: "Months", was: "₹75,000/Month", off: "40%Off", price: "₹ 45,000", per: "/Month" },
  { id: "yearly", name: "Yearly Package", months: 12, unit: "Months", was: "₹75,000/Month", off: "54%Off", price: "₹ 35,000", per: "/Month" },
];

export const bookingDetails = [
  { icon: "⏱️", text: "20 Sec (Video + Banner)" },
  { icon: "🎬", text: "Story + Offer + CTA" },
  { icon: "🔁", text: "Plays Every 3–4 Mins" },
  { icon: "⭐⭐⭐", text: "Very High Night Impact" },
  { icon: "📢", text: "Strong Brand Recall" },
];

export const creativeSpecs = [
  { label: "WIDTH :", value: "30" },
  { label: "HEIGHT :", value: "30" },
  { label: "TOTAL AREA :", value: "900 Sq.Ft." },
  { label: "MEDIA OPTION TYPE :", value: "Digital OOH" },
];

export const sopSpecs = [
  { label: "Proof Of Execution :", value: "Video" },
  { label: "First Proof Of Execution(In Days) :", value: "Start and End of the campaign" },
  { label: "End of the campaign execution proof (In Days) :", value: "1" },
  { label: "MEDIA OPTION TYPE :", value: "Digital OOH" },
];

export const industries = [
  { id: "ecommerce", label: "E-commerce", icon: "bag" },
  { id: "travel", label: "Travel", icon: "plane" },
  { id: "technology", label: "Technology", icon: "devices" },
  { id: "food", label: "Food & Beverage", icon: "food" },
  { id: "fashion", label: "Luxury Fashion", icon: "gem" },
] as const;

/* ---------------- Home page ---------------- */

export const homeCities = [
  "Delhi",
  "Mumbai",
  "Gurgaon",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
];

export const trustPoints = [
  { icon: "shield", label: "Verified Inventory" },
  { icon: "clock", label: "Real-Time Booking" },
  { icon: "grid", label: "Smart Management" },
  { icon: "play", label: "Proof of Play" },
];

export const stats = [
  { value: "500+", label: "Premium Screens", body: "Verified high-traffic locations nationwide.", image: "/img/stat-1.jpg" },
  { value: "15+", label: "Cities Covered", body: "Deep presence across all Tier-1 metros.", image: "/img/stat-2.jpg" },
  { value: "99.9%", label: "Uptime", body: "Reliable programmatic delivery guarantee.", image: "/img/stat-3.jpg" },
  { value: "Live", label: "Real-Time Analytics", body: "Instant proof of play & impression data.", image: "/img/stat-4.jpg" },
];

export const lumeNetwork = [
  {
    n: "01",
    title: "Roadside billboard's",
    icon: "road",
    image: "/img/lume-1.jpg",
    points: ["📍 28 Airports", "📈 High Footfall", "🖥️ 140+ D. Screens", "⚡ Instant Booking"],
    body: "Reach travelers through 140+ premium digital screens across major airports in India.",
  },
  {
    n: "02",
    title: "Premium Airport Screens",
    icon: "airport",
    image: "/img/lume-2.jpg",
    points: ["📍 28 Airports", "📈 High Footfall", "🖥️ 140+ D. Screens", "⚡ Instant Booking"],
    body: "Reach travelers through 140+ premium digital screens across major airports in India.",
  },
  {
    n: "03",
    title: "Railway Media Network",
    icon: "railway",
    image: "/img/lume-3.jpg",
    points: ["📍 50+ station", "📈 Millions of Travellers", "🖥️ 140+ D. Screens", "⚡ Extended Viewing"],
    body: "Advertise across high-footfall railway stations through premium digital media networks.",
  },
  {
    n: "04",
    title: "Premium Bus Terminal Screens",
    icon: "bus",
    image: "/img/lume-4.jpg",
    points: ["📍 50+ station", "📈 Daily Movement", "🖥️ 140+ D. Screens", "⚡ Long Waiting-Time"],
    body: "Reach daily travelers through strategically located transit advertising networks.",
    italic: true,
  },
];

export const steps = [
  { n: "1.", title: "Pick A Date", body: "Go Live For A Day, Week, Or Month — Your Choice.", icon: "/img/step-1.png" },
  { n: "2.", title: "Reserve Your Slot", body: "Top Up Your Wallet Or Just Submit A Request. We'll Take It From There.", icon: "/img/step-2.png" },
  { n: "3.", title: "Upload Or We Create", body: "Got A Design? Great. Need Help? Our Team Will Craft It For You.", icon: "/img/step-3.png" },
  { n: "4.", title: "Preview & Approve", body: "See Your Ad On-Screen — Then Hit Approve.", icon: "/img/step-4.png" },
];

export { formatINR } from "@/lib/format";
