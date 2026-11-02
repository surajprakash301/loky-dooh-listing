import { redirect } from "next/navigation";
import { Billboard, BillboardMedia, Campaign, CampaignScreen, Category, File as FileRow, ReviewSection, User, Vendor } from "@/db";
import { requireRole } from "@/lib/server/auth";
import type { VendorProfile } from "@/components/vendor/shell";
import { formatMonthYear } from "@/lib/format";
import { fileUrl } from "./files";

export async function loadMyVendor() {
  const s = await requireRole("vendor");
  const v = s.vendorId
    ? await Vendor.findByPk(s.vendorId, {
        include: [
          { model: User, as: "user" },
          { model: FileRow, as: "logo" },
          { model: ReviewSection, as: "reviewSections" },
          { model: Billboard, as: "billboards", include: [{ model: Category, as: "category" }, { model: BillboardMedia, as: "media", include: [{ model: FileRow, as: "file" }] }, { model: CampaignScreen, as: "bookings", required: false, include: [{ model: Campaign, as: "campaign", attributes: ["id", "status", "title"] }] }] },
        ],
        order: [[{ model: Billboard, as: "billboards" }, "id", "ASC"]],
      })
    : null;
  if (!v) redirect("/login");
  return { s, v };
}

export function profileOf(v: Vendor, userName: string): VendorProfile {
  const boards = v.billboards ?? [];
  const since = formatMonthYear(v.approvedAt ?? v.createdAt);
  return {
    name: v.tradeName ?? v.legalName ?? "Vendor",
    badge: v.status === "approved" ? "Verified DOOH Partner" : v.status === "rejected" ? "Onboarding rejected" : "Onboarding under review",
    avatar: fileUrl(v.logo) ?? "/img/vendor/vendor-avatar.jpg",
    screens: String(boards.filter((b) => b.status === "approved").length).padStart(2, "0"),
    activeAds: String(boards.reduce((n, b) => n + (b.bookings ?? []).filter((x) => x.campaign?.status === "active").length, 0)).padStart(2, "0"),
    since: v.status === "approved" ? `Partner since ${since}` : `Submitted ${since}`,
    user: { name: userName, role: v.status === "approved" ? "Premium DOOH Partner" : "DOOH Partner (pending)", avatar: "/img/vendor/avatar-rajeev.jpg" },
  };
}
