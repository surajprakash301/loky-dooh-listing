import Image from "next/image";
import {
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  EllipsisVertical,
  FileText,
  Globe,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  Phone,
  Radio,
  Timer,
  Users,
  Video,
  LayoutPanelTop,
} from "lucide-react";
import { CreativeFeedback } from "@/components/vendor/creative-feedback";
import {
  Eyebrow,
  IconTile,
  OutlineButton,
  PrimaryButton,
  SectionTitle,
  StatusChip,
  VCard,
  VendorPageHeader,
} from "@/components/vendor/ui";
import { campaignOrder as o } from "@/lib/vendor-data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Check The Campaign Order — Loky Media Vendor" };

const TAG_ICON = { industry: Building2, globe: Globe, key: CheckCircle2 } as const;
const SPEC_ICON = { slot: LayoutPanelTop, timer: Timer, pin: MapPin, audience: Users } as const;
const VERIFY_ICON = { camera: Camera, video: Video, gps: MapPin, calendar: Calendar } as const;

export default function CampaignOrderPage() {
  // route param is cosmetic for now — mock data covers a single order
  return (
    <>
      <VendorPageHeader
        title="Check The Campaign Order"
        subtitle="Track ads running across your screens"
        actions={<PrimaryButton className="h-14 px-10">Approve Order</PrimaryButton>}
      />

      <div className="space-y-8 px-8 py-7">
        {/* client + support */}
        <div className="grid gap-5 xl:grid-cols-[1fr_410px]">
          <div className="flex gap-7 rounded-xl bg-v-lavender p-5">
            <div className="grid w-[130px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f7f7f9]">
              <Image src={o.client.logo} alt="Samsung" width={130} height={150} className="h-[150px] w-[130px] object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="text-[36px] leading-tight font-bold tracking-tight">{o.client.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.client.tags.map((t) => {
                  const Icon = TAG_ICON[t.icon as keyof typeof TAG_ICON];
                  return (
                    <span
                      key={t.label}
                      className={cn(
                        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold",
                        t.highlight ? "bg-v-key text-v-deep" : "bg-white text-ink",
                      )}
                    >
                      <Icon className="size-3.5" />
                      {t.label}
                    </span>
                  );
                })}
              </div>
              <div className="mt-auto flex items-center justify-between pt-5">
                <div className="flex items-center gap-3">
                  <Image
                    src={o.client.contact.avatar}
                    alt={o.client.contact.name}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover ring-2 ring-white"
                  />
                  <div className="leading-tight">
                    <p className="text-[14px] font-semibold">{o.client.contact.name}</p>
                    <p className="text-[12px] text-ink-soft">{o.client.contact.role}</p>
                  </div>
                </div>
                <button type="button" aria-label="More" className="text-v-green">
                  <EllipsisVertical className="size-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-v-sage p-5">
            <Eyebrow className="text-v-green">Dedicated Support</Eyebrow>
            <div className="mt-4 flex items-center gap-4">
              <Image
                src={o.support.avatar}
                alt={o.support.name}
                width={56}
                height={56}
                className="size-14 rounded-full object-cover ring-2 ring-white"
              />
              <div className="leading-tight">
                <p className="text-[17px] font-semibold">{o.support.name}</p>
                <p className="text-[14px] text-ink-soft">{o.support.role}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <OutlineButton className="h-12 px-2 text-[14px] whitespace-nowrap">
                <MessageSquare className="size-4 text-v-green" /> WhatsApp Support
              </OutlineButton>
              <OutlineButton className="h-12 px-2 text-[14px] whitespace-nowrap">
                <Phone className="size-4 text-v-green" /> Direct Call
              </OutlineButton>
            </div>
          </div>
        </div>

        {/* placement specs */}
        <section>
          <Eyebrow>Placement Specifications</Eyebrow>
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {o.specs.map((s) => {
              const Icon = SPEC_ICON[s.icon as keyof typeof SPEC_ICON];
              return (
                <VCard key={s.label} className="p-4">
                  <IconTile tone={s.tone as "green" | "orange"}>
                    <Icon />
                  </IconTile>
                  <p className="mt-8 text-[14px] font-semibold tracking-wide text-ink-soft uppercase">{s.label}</p>
                  <p className="mt-1 text-[16px]">
                    {s.value}
                    {s.strong && <b className="font-bold">{s.strong}</b>}
                  </p>
                </VCard>
              );
            })}
          </div>
        </section>

        {/* booked inventory */}
        <section>
          <div className="flex items-center justify-between">
            <SectionTitle>Booked Inventory</SectionTitle>
            <a href="#" className="flex items-center gap-1.5 text-[14px] font-semibold text-v-green">
              View Map <MapIcon className="size-4" />
            </a>
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {o.inventory.map((inv) => (
              <div key={inv.title} className="relative h-[370px] overflow-hidden rounded-xl">
                <Image src={inv.image} alt={inv.title} fill sizes="50vw" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_55%,rgba(0,0,0,0.75)_100%)]" />
                <span className="absolute top-4 right-4 inline-flex h-7 items-center gap-1.5 rounded-full bg-v-deep px-3 text-[12px] font-semibold text-white">
                  <Radio className="size-3.5" /> Playing
                </span>
                <div className="absolute bottom-5 left-6 text-white">
                  <p className="text-[18px] font-semibold">{inv.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-[13px] text-white/90">
                    <MapPin className="size-3.5" /> {inv.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* contract + creative */}
        <div className="grid gap-6 lg:grid-cols-2">
          <VCard className="p-6">
            <div className="flex items-center justify-between">
              <Eyebrow>Contract Center</Eyebrow>
              <StatusChip tone="green" className="h-8 px-5 text-[13px] text-v-green">
                SIGNED
              </StatusChip>
            </div>
            <div className="mt-6 grid h-[350px] place-items-center rounded-lg bg-v-panel text-center">
              <div>
                <FileText className="mx-auto size-8 text-ink" strokeWidth={1.6} />
                <p className="mt-5 text-[15px]">{o.contract.file}</p>
              </div>
            </div>
            <p className="mt-6 text-[14px] text-ink-soft">{o.contract.verified}</p>
            <PrimaryButton className="mt-4 h-12 w-full">Confirm Contract &amp; Complete Onboarding</PrimaryButton>
          </VCard>

          <VCard className="p-6">
            <div className="flex items-center justify-between">
              <Eyebrow>Creative File Center</Eyebrow>
              <StatusChip tone="solid-orange" className="h-8 px-5 text-[13px]">
                HD READY
              </StatusChip>
            </div>
            <div className="mt-6 overflow-hidden rounded-lg">
              <div className="relative h-[220px]">
                <Image src={o.creative.image} alt="Creative preview" fill sizes="50vw" className="object-cover" />
              </div>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 bg-v-deep text-[15px] font-medium text-white"
              >
                <FileText className="size-4" /> Download Ads Video
              </button>
            </div>
            <CreativeFeedback />
          </VCard>
        </div>

        {/* verification */}
        <section>
          <SectionTitle>Multi-Dimensional Verification</SectionTitle>
          <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {o.verification.map((v) => {
              const Icon = VERIFY_ICON[v.icon as keyof typeof VERIFY_ICON];
              return (
                <div
                  key={v.title}
                  className="flex h-[290px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c6d6c9] p-6 text-center"
                >
                  <IconTile tone={v.tone as "green" | "orange" | "grey"} size="lg">
                    <Icon />
                  </IconTile>
                  <p className="mt-5 text-[17px] font-semibold whitespace-pre-line">{v.title}</p>
                  <p className="mt-1 text-[14px] whitespace-pre-line text-ink-soft">{v.body}</p>
                  {v.chip && (
                    <span className="mt-4 inline-flex h-7 items-center gap-2 rounded-full bg-v-panel px-4 text-[10px] font-bold tracking-wide">
                      <span className="size-2 rounded-full bg-v-mint" /> {v.chip}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
