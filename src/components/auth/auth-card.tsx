import { Logo } from "@/components/site/logo";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_20%_0%,#e4f0ea_0%,#f9f9f9_55%)] px-4 py-10 font-inter text-ink">
      <Logo height={40} className="mb-8" />
      <div className="w-full max-w-[440px] rounded-2xl border border-v-line bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <h1 className="text-[24px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-ink-soft">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-[13.5px] text-ink-soft">{footer}</div>}
    </div>
  );
}
