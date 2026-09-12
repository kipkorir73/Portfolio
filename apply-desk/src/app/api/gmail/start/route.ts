import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { gmailAuthUrl, isGmailConfigured } from "@/lib/gmail";
import { hasSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!hasSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!isGmailConfigured()) {
    return NextResponse.redirect(new URL("/inbox?gmail=setup", request.url));
  }
  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(gmailAuthUrl(request.nextUrl.origin, state));
  res.cookies.set("gmail_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
