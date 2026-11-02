import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, homeFor, readSession } from "@/lib/session";

// Optimistic role check at the edge. Every server action re-checks the session itself.
const AREAS: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/rep", roles: ["representative"] },
  { prefix: "/vendor", roles: ["vendor"] },
  { prefix: "/agency", roles: ["agency", "agency_member"] },
];
// Agency self-registration happens before a session exists.
const PUBLIC = ["/agency/register", "/agency/verify"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const area = AREAS.find((a) => pathname === a.prefix || pathname.startsWith(a.prefix + "/"));
  if (!area || PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();

  const session = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!area.roles.includes(session.role)) {
    return NextResponse.redirect(new URL(homeFor(session.role), req.url));
  }
  if (session.role === "vendor" && session.mustChangePassword && pathname !== "/vendor/settings/password") {
    return NextResponse.redirect(new URL("/vendor/settings/password", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/rep/:path*", "/vendor/:path*", "/agency/:path*"],
};
