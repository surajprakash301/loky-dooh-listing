"use client";

import { Download, Link2 } from "lucide-react";
import { useState } from "react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-3d inline-flex h-10 items-center gap-2 rounded-lg bg-green px-4 text-[14px] font-semibold text-white print:hidden">
      <Download className="size-4" /> Download PDF
    </button>
  );
}

export function CopyLinkButton({ path }: { path: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt("Copy this link", `${window.location.origin}${path}`);
        }
      }}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink/25 bg-white px-4 text-[14px] font-semibold print:hidden"
    >
      <Link2 className="size-4" /> {done ? "Link copied" : "Copy share link"}
    </button>
  );
}
