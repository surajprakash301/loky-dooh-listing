"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-6 text-center font-inter">
      <h1 className="text-[26px] font-bold">Something went wrong</h1>
      <p className="max-w-[48ch] text-[15px] text-ink-soft">The page could not be loaded. Try again; if it keeps happening, contact Loky Media support{error.digest ? ` and quote ${error.digest}` : ""}.</p>
      <button type="button" onClick={reset} className="inline-flex h-11 items-center rounded-lg bg-v-deep px-5 text-[14px] font-semibold text-white">Try again</button>
    </div>
  );
}
