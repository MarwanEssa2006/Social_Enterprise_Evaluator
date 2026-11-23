import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Passes the current path to server components (used by the language switch to return to the same page).
// Not used for authorisation — every page and action checks the session itself.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
