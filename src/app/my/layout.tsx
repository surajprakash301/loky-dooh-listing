import { MyTabs } from "@/components/quote/my-tabs";
import { SiteHeader } from "@/components/site/site-header";
import { requireRole } from "@/lib/server/auth";

export default async function MyLayout({ children }: LayoutProps<"/my">) {
  const s = await requireRole("customer");
  return (
    <>
      <div className="print:hidden"><SiteHeader variant="listing" /></div>
      <div className="mx-auto max-w-[1512px] px-8 pt-6 pb-20">
        <div className="print:hidden">
          <h1 className="text-[26px] font-bold">Hi {s.name.split(" ")[0]}, your campaigns</h1>
          <MyTabs />
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </>
  );
}
