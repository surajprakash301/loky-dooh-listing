import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-x-4 text-[13px] text-muted-ink", className)}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={item.label}>
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span className={cn(last && "text-ink-soft")}>{item.label}</span>
            )}
            {!last && <span className="text-muted-ink/60">&gt;</span>}
          </Fragment>
        );
      })}
    </nav>
  );
}
