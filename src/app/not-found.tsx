import Link from "next/link";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-page px-6 text-center font-inter">
      <Logo height={40} />
      <h1 className="text-[28px] font-bold">Page not found</h1>
      <p className="max-w-[46ch] text-[15px] text-ink-soft">The billboard or page you were looking for does not exist, or it is not live yet.</p>
      <Link href="/" className="inline-flex h-11 items-center rounded-lg bg-v-deep px-5 text-[14px] font-semibold text-white">Back to Loky Media</Link>
    </div>
  );
}
