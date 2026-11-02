import {
  Bus,
  Building2,
  Fuel,
  Plane,
  Store,
  TrainFront,
  type LucideProps,
} from "lucide-react";

/** Roadside billboard glyph (two poles + screen) – not in lucide, drawn inline. */
function RoadSide(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 21 9 3" />
      <path d="M20 21 15 3" />
      <path d="M12 7v14" />
      <path d="M8.5 11h7" />
      <path d="M7 16h10" />
    </svg>
  );
}

/** "LUME" wordmark used inside the ALL tab. */
export function LumeMark({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-poppins)",
        fontWeight: 700,
        letterSpacing: "0.08em",
        fontSize: "0.95em",
      }}
    >
      LUME
    </span>
  );
}

export function CategoryIcon({ icon, ...props }: { icon: string } & LucideProps) {
  switch (icon) {
    case "road":
      return <RoadSide {...props} />;
    case "railway":
      return <TrainFront {...props} />;
    case "airport":
      return <Plane {...props} />;
    case "bus":
      return <Bus {...props} />;
    case "mall":
      return <Building2 {...props} />;
    case "shopping":
      return <Store {...props} />;
    case "fuel":
      return <Fuel {...props} />;
    default:
      return null;
  }
}
