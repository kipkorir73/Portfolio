import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.endsWith(".pdf")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("apply_desk")?.value;
  const isLogin = pathname.startsWith("/login");
  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
