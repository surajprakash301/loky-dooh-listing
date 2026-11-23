"use client";

import { Check, Plus } from "lucide-react";
import { campaign, useCampaign } from "@/lib/campaign-store";
import { cn } from "@/lib/utils";

/** Toggles one billboard in the customer's campaign selection. `code` is the public billboard code. */
export function AddToCampaignButton({ code, size = "md", className, labels = ["Add to campaign", "Added"], plain = false }: { code: string; size?: "sm" | "md"; className?: string; labels?: [string, string]; /** reference-platform style: text only, outline / soft green */ plain?: boolean }) {
  const selected = useCampaign().includes(code);
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-testid={`add-${code}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        campaign.toggle(code);
      }}
      className={plain ? cn("inline-flex h-8 items-center justify-center rounded-lg border px-2 text-[12px] font-bold whitespace-nowrap", selected ? "border-lk bg-[#e8f8ef] text-[#0e7a45]" : "border-[#d0d5dd] bg-white text-[#212121] hover:border-lk", className) : cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors",
        size === "sm" ? "h-8 px-3 text-[12.5px]" : "h-10 px-4 text-[14px]",
        selected ? "border-green bg-green text-white" : "border-ink/25 bg-white text-ink hover:border-green hover:text-green",
        className,
      )}
    >
      {plain ? null : selected ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2.5} />}
      {selected ? labels[1] : labels[0]}
    </button>
  );
}
