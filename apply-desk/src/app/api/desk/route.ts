import { NextRequest, NextResponse } from "next/server";
import {
  markApplication,
  markJobApplied,
  markRead,
  runDailyScan,
} from "@/lib/daily";
import { getDeskPayload } from "@/lib/payload";
import { hasSession, SESSION_COOKIE } from "@/lib/session";
import { mutateStore } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

type Body = {
  op?: string;
  jobId?: string;
  id?: string;
  status?: ApplicationStatus;
  minScore?: number;
  keywords?: string;
};

export async function POST(request: NextRequest) {
  if (!hasSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const op = body.op;
  try {
    if (op === "scan") {
      const result = await runDailyScan();
      return NextResponse.json({ ...getDeskPayload(), ...result });
    }
    if (op === "applied" && body.jobId) {
      markJobApplied(body.jobId);
      return NextResponse.json(getDeskPayload());
    }
    if (op === "status" && body.id && body.status) {
      markApplication(body.id, body.status);
      return NextResponse.json(getDeskPayload());
    }
    if (op === "read" && body.id) {
      markRead(body.id);
      return NextResponse.json(getDeskPayload());
    }
    if (op === "settings") {
      mutateStore((s) => {
        s.settings.autoApplyEmail = false;
        s.settings.minScore = Math.max(0, Number(body.minScore ?? 40));
        s.settings.keywords = String(body.keywords ?? s.settings.keywords);
      });
      return NextResponse.json(getDeskPayload());
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
