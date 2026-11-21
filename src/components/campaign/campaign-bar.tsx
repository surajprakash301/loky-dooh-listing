"use client";

import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";
import { campaign, useCampaign } from "@/lib/campaign-store";

/** Floating summary of the current selection with the way into the quotation builder. Hidden while empty. */
export function CampaignBar() {
  const codes = useCampaign();
  if (codes.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 print:hidden">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-ink/10 bg-ink px-2 py-2 pl-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]" data-testid="campaign-bar">
        <span className="text-[14px]">
          <b className="text-brand">{codes.length}</b> billboard{codes.length === 1 ? "" : "s"} in your campaign
        </span>
        <button type="button" onClick={() => campaign.clear()} className="inline-flex size-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" title="Clear selection">
          <Trash2 className="size-4" />
        </button>
        <Link href="/quote/new" className="btn-3d inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-[14px] font-bold text-ink" data-testid="create-quotation">
          <FileText className="size-4" /> Create quotation
        </Link>
      </div>
    </div>
  );
}
