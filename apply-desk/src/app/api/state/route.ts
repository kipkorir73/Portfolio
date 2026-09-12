import { NextRequest, NextResponse } from "next/server";
import { getDeskPayload } from "@/lib/payload";
import { hasSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!hasSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getDeskPayload());
}
