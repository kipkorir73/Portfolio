import { NextRequest, NextResponse } from "next/server";
import {
  markApplication,
  markJobApplied,
  markRead,
  runDailyScan,
} from "@/lib/daily";
import { disconnectGmail, isGmailConfigured, syncGmailInbox } from "@/lib/gmail";
import { isStore } from "@/lib/merge";
import { getDeskPayload } from "@/lib/payload";
import { hasSession, SESSION_COOKIE } from "@/lib/session";
import { mutateStore, replaceStore } from "@/lib/store";
import type { ApplicationStatus, Store } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

type Body = {
  op?: string;
  jobId?: string;
  id?: string;
  status?: ApplicationStatus;
  minScore?: number;
  keywords?: string;
  store?: Store;
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
      return NextResponse.json({ ...(await getDeskPayload()), ...result });
    }
    if (op === "applied" && body.jobId) {
      await markJobApplied(body.jobId);
      return NextResponse.json(await getDeskPayload());
    }
    if (op === "status" && body.id && body.status) {
      await markApplication(body.id, body.status);
      return NextResponse.json(await getDeskPayload());
    }
    if (op === "read" && body.id) {
      await markRead(body.id);
      return NextResponse.json(await getDeskPayload());
    }
    if (op === "settings") {
      await mutateStore((s) => {
        s.settings.autoApplyEmail = false;
        s.settings.minScore = Math.max(0, Number(body.minScore ?? 40));
        s.settings.keywords = String(body.keywords ?? s.settings.keywords);
      });
      return NextResponse.json(await getDeskPayload());
    }
    if (op === "persist" && isStore(body.store)) {
      await replaceStore(body.store);
      return NextResponse.json(await getDeskPayload());
    }
    if (op === "sync") {
      if (!isGmailConfigured()) {
        return NextResponse.json(
          { error: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on Netlify, then connect Gmail." },
          { status: 400 },
        );
      }
      const result = await syncGmailInbox();
      return NextResponse.json({ ...(await getDeskPayload()), imported: result.imported });
    }
    if (op === "disconnect") {
      await disconnectGmail();
      return NextResponse.json(await getDeskPayload());
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
