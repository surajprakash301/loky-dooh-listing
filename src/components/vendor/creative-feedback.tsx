"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/vendor/ui";

export function CreativeFeedback() {
  const [remark, setRemark] = useState("");
  return (
    <div className="mt-6">
      <label htmlFor="creative-feedback" className="text-[15px] font-semibold">
        Creative Feedback*
      </label>
      <textarea
        id="creative-feedback"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="Enter vendor remarks or feedback here..."
        className="mt-3 h-[76px] w-full resize-none rounded-lg bg-v-panel p-4 text-[15px] outline-none placeholder:text-v-muted focus:ring-2 focus:ring-v-green/30"
      />
      <div className="mt-4 grid grid-cols-[1.3fr_1fr] gap-4">
        <PrimaryButton className="h-14">Confirm Creative</PrimaryButton>
        <button
          type="button"
          disabled={!remark}
          className="h-14 rounded-lg border-2 border-[#b4261a] text-[15px] font-medium text-[#b4261a] disabled:opacity-100"
        >
          Reject with Remark
        </button>
      </div>
    </div>
  );
}
