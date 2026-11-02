import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingSection } from "@/components/detail/booking-section";
import { DetailHero, type DetailData } from "@/components/detail/detail-hero";
import { ExecutionDetails, LokyLabSection, WhatsappBanner } from "@/components/detail/detail-sections";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { SearchBar } from "@/components/site/search-bar";
import { SiteHeader } from "@/components/site/site-header";
import { TIER_LABEL } from "@/lib/domain";
import { formatImpressions, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getPublicBillboard, headlinePrice, mediaUrls } from "@/services/catalog";

export async function generateMetadata(props: PageProps<"/billboard/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const b = await getPublicBillboard(id);
  return { title: b ? `${b.name} #${b.code} — Loky Media` : "Billboard — Loky Media" };
}

const inr = (n: number) => formatINR(n, { space: true });

export default async function BillboardPage(props: PageProps<"/billboard/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const showMap = sp.map === "1";
  const b = await getPublicBillboard(id);
  if (!b) notFound();

  const price = headlinePrice(b);
  const monthly = (b.pricing ?? []).find((p) => p.slotSeconds === 20 && p.package === "month") ?? (b.pricing ?? [])[0];
  const perDay = monthly ? Number(monthly.offerPrice) / (monthly.package === "day" ? 1 : 30) : price?.price ?? 0;
  const gallery = mediaUrls(b);
  const crumb = `${b.name} #${b.code}`;
  const d: DetailData = {
    code: b.code,
    title: `DOOH - ${b.name} #${b.code}`,
    address: `${b.addressLine}${b.landmark ? `, ${b.landmark}` : ""}, ${b.locality}, ${b.city}, ${b.state}${b.pincode ? ` ${b.pincode}` : ""}.`,
    gallery,
    lokySense: b.lokySense,
    partner: {
      logo: "/img/partner-logo.png",
      name: `${TIER_LABEL[b.tier].replace(/ [✨⭐]$/u, "")} · ${b.vendor?.tradeName ?? "Loky partner"}`,
      board: `${b.category?.name ?? "DOOH"} · ${b.screenType.toUpperCase()} ${b.pixelPitch ?? ""}`.trim(),
      weeklyPrice: `${inr(perDay * 7)} / Per Week`,
      dailyPrice: `${inr(perDay)} / per day`,
      rating: "4.8",
      ratingLabel: "google rating Top Rated (500)",
    },
    quickSpecs: [
      { icon: "megaphone", label: `${formatImpressions(b.dailyImpressions)} Reach/Day` },
      { icon: "target", label: `${b.opsStart} - ${b.opsEnd}`, sub: "Operational time" },
      { icon: "target", label: b.category?.name ?? "Urban" },
      { icon: "target", label: `${Number(b.widthFt)} X ${Number(b.heightFt)} Sqft` },
      { icon: "target", label: `${b.loopSeconds}s loop · ${b.slotsPerLoop} slots` },
      { icon: "target", label: b.brightnessNits ? `${b.brightnessNits} nits` : `${b.refreshRateHz ?? "—"} Hz` },
    ],
  };
  const pricing = (b.pricing ?? []).map((p) => ({ slotSeconds: p.slotSeconds, package: p.package, listPrice: Number(p.listPrice), offerPrice: Number(p.offerPrice) }));
  const specs = [
    { label: "WIDTH :", value: `${Number(b.widthFt)} ft` },
    { label: "HEIGHT :", value: `${Number(b.heightFt)} ft` },
    { label: "TOTAL AREA :", value: `${Number(b.widthFt) * Number(b.heightFt)} Sq.Ft.` },
    { label: "MEDIA OPTION TYPE :", value: b.screenType === "static" ? "Static OOH" : "Digital OOH" },
  ];

  return (
    <>
      <SiteHeader variant="detail" />

      <div className="bg-page">
        <div className="mx-auto max-w-[1512px] space-y-3 px-8 pt-3 pb-3">
          <SearchBar />
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Digital OOH", href: "/listing" }, { label: crumb }]} />
            <Link href={showMap ? `/billboard/${b.code}` : `/billboard/${b.code}?map=1`} className="flex items-center gap-2 text-[12px] font-bold">
              Map
              <span className={cn("relative h-4 w-8 rounded-full transition-colors", showMap ? "bg-green" : "bg-ink")}>
                <span className={cn("absolute top-0.5 size-3 rounded-full bg-white transition-all", showMap ? "left-[18px]" : "left-0.5")} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1512px] px-8 pt-4 pb-16">
        <DetailHero showMap={showMap} d={d} />
        <BookingSection pricing={pricing} previewImage={gallery[0] ?? "/img/booking-preview.jpg"} code={b.code} />
        <WhatsappBanner />
        <ExecutionDetails specs={specs} />
        <LokyLabSection />
      </main>
    </>
  );
}
