import { NextResponse, type NextRequest } from "next/server";
import { Billboard, BillboardMedia, File as FileRow, Vendor, VendorDocument } from "@/db";
import { getSession } from "@/lib/server/auth";
import { readStoredFile } from "@/services/files";

/** Streams an uploaded file. Billboard media is public; everything else needs an owner, the rep, or an admin. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/files/[id]">) {
  const { id } = await ctx.params;
  const row = await FileRow.findByPk(Number(id));
  if (!row) return new NextResponse("Not found", { status: 404 });

  if (!row.publicUrl) {
    const s = await getSession();
    if (!s) return new NextResponse("Unauthorized", { status: 401 });
    if (s.role !== "admin") {
      const doc = await VendorDocument.findOne({ where: { fileId: row.id }, include: [{ model: Vendor, as: "vendor", attributes: ["onboardedBy", "userId"] }] });
      const media = doc ? null : await BillboardMedia.findOne({ where: { fileId: row.id }, include: [{ model: Billboard, as: "billboard", include: [{ model: Vendor, as: "vendor", attributes: ["onboardedBy", "userId"] }] }] });
      const owner = doc?.vendor ?? media?.billboard?.vendor;
      const allowed = owner && (owner.onboardedBy === s.uid || owner.userId === s.uid) || row.uploadedBy === s.uid;
      if (!allowed) return new NextResponse("Forbidden", { status: 403 });
    }
  }

  if (row.storageKey.startsWith("static:")) return NextResponse.redirect(new URL(row.storageKey.slice(7), _req.url));
  const buf = await readStoredFile(row);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": row.mimeType,
      "Content-Length": String(buf.length),
      "Cache-Control": row.publicUrl ? "public, max-age=31536000, immutable" : "private, no-store",
      "Content-Disposition": `inline; filename="${encodeURIComponent(row.originalName)}"`,
    },
  });
}
