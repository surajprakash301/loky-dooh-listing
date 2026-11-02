import Link from "next/link";
import { CategoryIcon, LumeMark } from "@/components/site/category-icon";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CategoryTabs({
  ctaStyle = "pill",
  active = "all",
  view,
}: {
  /** "pill" = outlined button (list view), "text" = plain label (grid view) */
  ctaStyle?: "pill" | "text";
  /** category slug from the listing URL */
  active?: string;
  /** current list view, preserved in the links */
  view?: string;
}) {
  const href = (id: string) => {
    const q = new URLSearchParams();
    if (id !== "all") q.set("category", id);
    if (view && view !== "list") q.set("view", view);
    const qs = q.toString();
    return qs ? `/listing?${qs}` : "/listing";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="no-scrollbar flex items-center gap-8 overflow-x-auto">
        {categories.map((c) => {
          const isActive = c.id === active;
          return (
            <Link
              key={c.id}
              href={href(c.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex h-12 shrink-0 items-center gap-2 text-[15px] text-ink-soft",
                isActive && "text-brand",
              )}
            >
              {c.icon === "lume" ? (
                <span className="flex items-center gap-2 font-bold text-brand">
                  <span className="text-[15px] tracking-wide">ALL</span>
                  <LumeMark className="text-[17px]" />
                </span>
              ) : (
                <>
                  <CategoryIcon icon={c.icon} className="size-5" strokeWidth={1.7} />
                  {c.label}
                </>
              )}
              {isActive && <span className="absolute inset-x-[-12px] bottom-0 h-[3px] rounded-t bg-brand" />}
            </Link>
          );
        })}
      </div>

      {ctaStyle === "pill" ? (
        <Link
          href="#"
          className="hidden h-10 shrink-0 items-center rounded-full border border-ink/50 bg-white px-6 text-[14px] font-bold md:flex"
        >
          Create Campaign Using&nbsp;<span className="underline underline-offset-2">LOKY AI</span>
        </Link>
      ) : (
        <Link href="#" className="hidden shrink-0 text-[14px] font-bold md:block">
          Create Campaign Using <span className="underline underline-offset-2">LOKY AI</span>
        </Link>
      )}
    </div>
  );
}
