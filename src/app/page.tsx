import { HomeHero } from "@/components/home/home-hero";
import {
  AiLabSection,
  LumeNetworkSection,
  StepsSection,
  TopBillboardsSection,
  TransformSection,
} from "@/components/home/home-sections";
import { SiteHeader } from "@/components/site/site-header";
import { listPublicBillboards, toCard } from "@/services/catalog";

export default async function HomePage() {
  const billboards = (await listPublicBillboards()).map(toCard);
  return (
    <>
      <SiteHeader variant="home" />
      <main className="bg-page">
        <HomeHero />
        <TransformSection />
        <LumeNetworkSection />
        <TopBillboardsSection billboards={billboards} />
        <StepsSection />
        <AiLabSection />
      </main>
    </>
  );
}
