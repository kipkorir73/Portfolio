import { NextRequest, NextResponse } from "next/server";
import { connectGmailFromCode } from "@/lib/gmail";
import { hasSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const inbox = new URL("/inbox", request.url);
  if (!hasSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    inbox.searchParams.set("gmail", "denied");
    return NextResponse.redirect(inbox);
  }
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expected = request.cookies.get("gmail_oauth_state")?.value;
  if (!code || !state || !expected || state !== expected) {
    inbox.searchParams.set("gmail", "denied");
    return NextResponse.redirect(inbox);
  }
  try {
    await connectGmailFromCode(code, request.nextUrl.origin);
    inbox.searchParams.set("gmail", "connected");
  } catch {
    inbox.searchParams.set("gmail", "error");
  }
  const res = NextResponse.redirect(inbox);
  res.cookies.set("gmail_oauth_state", "", { path: "/", maxAge: 0 });
  return res;
}
