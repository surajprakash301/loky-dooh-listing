import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page header bar used on every vendor screen. */
export function VendorPageHeader({
  title,
  subtitle,
  back = true,
  backHref = "/vendor/campaigns",
  actions,
  className,
}: {
  title: string;
  subtitle: string;
  back?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-8 border-b border-v-line bg-white px-8 py-5", className)}>
      {back && (
        <>
          <Link href={backHref} className="flex items-center gap-3 text-[15px] text-ink-soft">
            <ArrowLeft className="size-5 text-ink" strokeWidth={2.2} />
            Back
          </Link>
          <span className="h-10 w-px bg-v-line" />
        </>
      )}
      <div className="leading-tight">
        <h1 className="text-[30px] font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-[15px] text-ink-soft">{subtitle}</p>
      </div>
      {actions && <div className="ml-auto flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function VCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-v-line bg-white", className)}>{children}</div>;
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-[22px] font-semibold tracking-tight", className)}>{children}</h2>;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[13px] font-semibold tracking-[0.12em] text-ink-soft uppercase", className)}>{children}</p>
  );
}

export function IconTile({
  tone,
  children,
  size = "md",
  className,
}: {
  tone: "green" | "orange" | "grey" | "red";
  children: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  const tones = {
    green: "bg-v-chip text-v-deep",
    orange: "bg-v-orange-tint text-v-orange",
    grey: "bg-v-panel text-ink-soft",
    red: "bg-[#fee6de] text-v-rust",
  };
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-lg",
        size === "md" ? "size-10 [&_svg]:size-5" : "size-[76px] rounded-full [&_svg]:size-7",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-v-deep px-6 text-[15px] font-medium text-white hover:bg-v-deep/90",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function OutlineButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-v-line bg-white px-4 text-[14px] font-medium hover:bg-v-panel",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusChip({
  tone,
  children,
  className,
}: {
  tone: "green" | "orange" | "solid-green" | "solid-orange" | "grey";
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    green: "bg-v-chip text-v-deep",
    orange: "bg-v-orange-tint text-v-orange",
    "solid-green": "bg-v-deep text-white",
    "solid-orange": "bg-v-orange text-white",
    grey: "bg-v-panel text-ink-soft",
  };
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-[12px] font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
