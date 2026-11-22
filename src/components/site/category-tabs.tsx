import Link from "next/link";
import { CategoryIcon, LumeMark } from "@/components/site/category-icon";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CategoryTabs({
  active = "all",
  view,
}: {
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
      <div className="no-scrollbar flex items-center gap-7 overflow-x-auto">
        {categories.map((c) => {
          const isActive = c.id === active;
          return (
            <Link
              key={c.id}
              href={href(c.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex h-10 shrink-0 items-center gap-1.5 text-[13.5px] whitespace-nowrap text-ink-soft",
                isActive && "text-brand",
              )}
            >
              {c.icon === "lume" ? (
                <span className="flex items-center gap-2 font-bold text-brand">
                  <span className="text-[13.5px] tracking-wide">ALL</span>
                  <LumeMark className="text-[15px]" />
                </span>
              ) : (
                <>
                  <CategoryIcon icon={c.icon} className="size-4" strokeWidth={1.7} />
                  {c.label}
                </>
              )}
              {isActive && <span className="absolute inset-x-[-12px] bottom-0 h-[3px] rounded-t bg-brand" />}
            </Link>
          );
        })}
      </div>

    </div>
  );
}
