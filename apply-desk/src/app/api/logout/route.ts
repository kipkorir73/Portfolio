import { NextRequest, NextResponse } from "next/server";

const COOKIE = "apply_desk";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url), 303);
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
