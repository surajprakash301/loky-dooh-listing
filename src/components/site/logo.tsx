import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  light = false,
  className,
  height = 34,
  href = "/",
}: {
  light?: boolean;
  className?: string;
  height?: number;
  /** Where the logo links; pass `null` to render the image alone (when a parent already is a link). */
  href?: string | null;
}) {
  const width = Math.round(height * (348 / 136));
  const img = (
    <Image
      src={light ? "/img/logo-light.png" : "/img/logo.png"}
      alt="Loky Media"
      width={width}
      height={height}
      priority
      style={{ height, width }}
    />
  );
  if (href === null) return <span className={cn("inline-flex shrink-0", className)}>{img}</span>;
  return (
    <Link href={href} aria-label="Loky Media home" className={cn("inline-flex shrink-0", className)}>
      {img}
    </Link>
  );
}
