import { NextRequest, NextResponse } from "next/server";
import { extractResumeText } from "@/lib/cv-text";
import { PROFILE } from "@/lib/profile";
import { hasSession, SESSION_COOKIE } from "@/lib/session";
import { mutateStore, readCvFile, saveCvFile } from "@/lib/store";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!hasSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const uploaded = await readCvFile();
  if (uploaded) {
    return new NextResponse(new Uint8Array(uploaded.buffer), {
      headers: {
        "content-type": uploaded.mime,
        "content-disposition": `inline; filename="${uploaded.filename}"`,
      },
    });
  }
  try {
    const fallback = readFileSync(join(process.cwd(), "public", PROFILE.cvPath.replace(/^\//, "")));
    return new NextResponse(new Uint8Array(fallback), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${PROFILE.cvPath.split("/").pop()}"`,
      },
    });
  } catch {
    return NextResponse.redirect(new URL(PROFILE.cvPath, request.url));
  }
}

export async function POST(request: NextRequest) {
  if (!hasSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("cv");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a CV file" }, { status: 400 });
  }
  if (file.size > 1_800_000) {
    return NextResponse.json({ error: "CV must be under 1.8 MB" }, { status: 400 });
  }
  const name = file.name || "cv.pdf";
  if (!/\.(pdf|txt|md)$/i.test(name)) {
    return NextResponse.json({ error: "Upload a PDF or TXT CV" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const text = extractResumeText(buffer, name);
  await saveCvFile(buffer, name, file.type || "application/pdf");
  await mutateStore((s) => {
    s.profile = {
      cvFileName: name,
      cvUploadedAt: new Date().toISOString(),
      cvText: text || s.profile?.cvText || null,
    };
  });
  return NextResponse.json({ ok: true, filename: name, extracted: Boolean(text) });
}
