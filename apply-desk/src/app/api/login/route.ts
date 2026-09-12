import { NextRequest, NextResponse } from "next/server";
import { LOGIN_EMAIL, LOGIN_PASSWORD } from "@/lib/profile";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  const loginUrl = new URL("/login", request.url);

  if (email !== LOGIN_EMAIL.toLowerCase() || password !== LOGIN_PASSWORD) {
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl, 303);
  }

  const res = NextResponse.redirect(new URL("/", request.url), 303);
  res.cookies.set(SESSION_COOKIE, LOGIN_EMAIL, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
