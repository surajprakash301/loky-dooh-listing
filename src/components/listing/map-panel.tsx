import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Static map panel cropped from the design. Pins are baked into the artwork;
 * swap for a live map component later without touching the layout.
 */
export function MapPanel({ src = "/img/map-listing.jpg", className }: { src?: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-line bg-white", className)}>
      <Image src={src} alt="Billboard locations map" fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover object-top" />
    </div>
  );
}
