import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { ReviewSection, Vendor } from "@/db";
import { SECTION_LABEL } from "@/services/onboarding";
import { cn } from "@/lib/utils";

/** Review status the vendor sees on their dashboard until they are approved. */
export function VendorStatusBanner({ v }: { v: Vendor }) {
  const rows = v.reviewSections ?? [];
  if (v.status === "approved" && !rows.some((r) => r.status !== "approved")) return null;
  const tone =
    v.status === "rejected" ? { cls: "border-v-red/40 bg-v-red-tint text-v-red", Icon: XCircle, title: "Your onboarding was not approved" }
    : v.status === "changes_requested" ? { cls: "border-v-orange/50 bg-v-orange-tint text-v-rust", Icon: AlertTriangle, title: "Loky Media asked your representative for changes" }
    : v.status === "approved" ? { cls: "border-v-line bg-v-panel text-ink", Icon: Clock, title: "A new billboard is under review" }
    : { cls: "border-amber-200 bg-amber-50 text-amber-800", Icon: Clock, title: "Your onboarding is under review" };
  const label = (r: ReviewSection) => (r.section === "billboard" ? `Billboard #${v.billboards?.find((b) => b.id === r.billboardId)?.code ?? ""}` : SECTION_LABEL[r.section]);
  return (
    <div className={cn("mx-8 mt-6 rounded-xl border p-5", tone.cls)}>
      <div className="flex items-center gap-2">
        <tone.Icon className="size-5" />
        <h2 className="text-[16px] font-bold">{tone.title}</h2>
      </div>
      {v.status === "rejected" ? (
        <p className="mt-2 text-[13.5px]">{v.rejectionReason}</p>
      ) : (
        <>
          <p className="mt-1 text-[13.5px] opacity-90">Your billboards appear on the Loky marketplace once every section below is approved. Your representative handles any changes.</p>
          <ul className="mt-3 grid gap-1.5 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <li key={r.id} className="flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2 text-ink">
                {r.status === "approved" ? <CheckCircle2 className="mt-0.5 size-4 text-v-green" /> : r.status === "changes_requested" ? <AlertTriangle className="mt-0.5 size-4 text-v-rust" /> : <Clock className="mt-0.5 size-4 text-amber-600" />}
                <span>
                  <span className="font-medium">{label(r)}</span>
                  <span className="ml-1 text-ink-soft">· {r.status.replace("_", " ")}</span>
                  {r.remark && <span className="block text-[12px] text-v-rust">{r.remark}</span>}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-3 text-[12.5px] opacity-80">Questions? <Link href="#" className="underline">Contact your Loky representative</Link>.</p>
    </div>
  );
}
