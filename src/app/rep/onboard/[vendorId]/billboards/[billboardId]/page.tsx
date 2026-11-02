import { notFound } from "next/navigation";
import { saveBillboardAction } from "@/actions/onboarding";
import { BillboardForm, type BillboardValues, type MediaItem, type PricingRow } from "@/components/rep/billboard-form";
import { SectionFrame } from "@/components/rep/section-frame";
import { Category } from "@/db";
import { fileUrl } from "@/services/files";
import type { StepState } from "@/services/onboarding";
import { loadStepPage } from "@/services/rep-page";

export default async function BillboardEditPage(props: PageProps<"/rep/onboard/[vendorId]/billboards/[billboardId]">) {
  const { vendorId, billboardId } = await props.params;
  const sp = await props.searchParams;
  const warn = typeof sp.warn === "string" ? sp.warn : null;
  const { v, steps } = await loadStepPage(vendorId);
  const isNew = billboardId === "new";
  const b = isNew ? null : v.billboards?.find((x) => x.id === Number(billboardId));
  if (!isNew && !b) notFound();
  const categories = (await Category.findAll({ order: [["sortOrder", "ASC"]] })).map((c) => ({ id: c.id, name: c.name }));

  const step: StepState = isNew
    ? { key: "billboard", section: "billboard", label: "E · New billboard", href: "", filled: false, status: "draft", remark: null, round: 0, editable: v.status === "draft" || v.status === "approved" }
    : steps.find((s) => s.billboardId === b!.id)!;

  const initial: BillboardValues = b
    ? {
        name: b.name, categoryId: b.categoryId, tier: b.tier, screenType: b.screenType, addressLine: b.addressLine, landmark: b.landmark, locality: b.locality, city: b.city, state: b.state, pincode: b.pincode,
        lat: b.lat, lng: b.lng, widthFt: Number(b.widthFt), heightFt: Number(b.heightFt), pixelPitch: b.pixelPitch, refreshRateHz: b.refreshRateHz, brightnessNits: b.brightnessNits, viewingAngleH: b.viewingAngleH, viewingAngleV: b.viewingAngleV,
        opsStart: b.opsStart, opsEnd: b.opsEnd, loopSeconds: b.loopSeconds, slotsPerLoop: b.slotsPerLoop, dailyImpressions: b.dailyImpressions, lokySense: b.lokySense, description: b.description,
      }
    : { city: v.city, state: v.state };
  const media: MediaItem[] = (b?.media ?? []).map((m) => ({ id: m.id, url: fileUrl(m.file)!, kind: m.kind, isCover: m.isCover }));
  const pricing: PricingRow[] = (b?.pricing ?? []).map((p) => ({ slotSeconds: p.slotSeconds, package: p.package, listPrice: Number(p.listPrice), offerPrice: Number(p.offerPrice) }));

  return (
    <SectionFrame step={step} title={isNew ? "E · New billboard" : `E · ${b!.name} #${b!.code}`} warning={warn ? `Saved, but this billboard still ${warn}.` : undefined}>
      <BillboardForm action={saveBillboardAction.bind(null, v.id, b?.id ?? null)} initial={initial} media={media} pricing={pricing} categories={categories} locked={!step.editable} isNew={isNew} />
    </SectionFrame>
  );
}
