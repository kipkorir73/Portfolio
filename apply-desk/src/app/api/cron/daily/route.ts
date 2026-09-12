import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/session";
import { runDailyScan } from "@/lib/daily";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  const ok = (expected && secret === expected) || (await isLoggedIn());
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runDailyScan({ apply: true });
  return NextResponse.json({ ok: true, ...result });
}
