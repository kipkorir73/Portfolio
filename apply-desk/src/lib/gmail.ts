import { mutateStore, readGmailAuth, readStore, writeGmailAuth, type GmailAuth } from "./store";
import type { Application, InboxMessage } from "./types";

const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

export function isGmailConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function gmailRedirectUri(origin: string) {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/gmail/callback`;
}

export function gmailAuthUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: gmailRedirectUri(origin),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
    cache: "no-store",
  });
  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Google token exchange failed");
  }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

export async function exchangeGmailCode(code: string, origin: string): Promise<GmailAuth> {
  const data = await tokenRequest({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: gmailRedirectUri(origin),
    grant_type: "authorization_code",
  });
  const email = await fetchGmailEmail(data.access_token);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? "",
    expiry: Date.now() + (data.expires_in ?? 3600) * 1000,
    email,
  };
}

async function fetchGmailEmail(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = (await res.json()) as { email?: string };
  if (!res.ok || !data.email) throw new Error("Could not read the Google account email");
  return data.email;
}

async function freshAuth(): Promise<GmailAuth> {
  const auth = await readGmailAuth();
  if (!auth?.accessToken && !auth?.refreshToken) {
    throw new Error("Gmail is not connected");
  }
  if (auth.expiry > Date.now() + 60_000) return auth;
  if (!auth.refreshToken) throw new Error("Gmail needs to be connected again");
  const data = await tokenRequest({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    refresh_token: auth.refreshToken,
    grant_type: "refresh_token",
  });
  const next: GmailAuth = {
    ...auth,
    accessToken: data.access_token!,
    refreshToken: data.refresh_token || auth.refreshToken,
    expiry: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  await writeGmailAuth(next);
  return next;
}

type GmailHeader = { name: string; value: string };
type GmailPart = {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
};

function header(headers: GmailHeader[] | undefined, name: string) {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function decodeBody(raw?: string) {
  if (!raw) return "";
  const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function walkParts(part?: GmailPart): string {
  if (!part) return "";
  if (part.mimeType?.startsWith("text/plain") && part.body?.data) return decodeBody(part.body.data);
  if (part.parts) {
    for (const child of part.parts) {
      const text = walkParts(child);
      if (text) return text;
    }
  }
  if (part.body?.data) return decodeBody(part.body.data);
  return "";
}

function parseFrom(value: string) {
  const email = value.match(/<([^>]+)>/)?.[1] || value;
  const name = value.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || email;
  return { name, email: email.trim() };
}

function classify(subject: string, body: string): InboxMessage["kind"] {
  const blob = `${subject}\n${body}`;
  if (/interview|availability|schedule (a |the )?call|please come in/i.test(blob)) return "interview";
  if (/unfortunately|not (been )?selected|other candidates|will not be moving|rejected|not successful/i.test(blob)) {
    return "rejection";
  }
  if (/thank you for (your )?application|received your application|next steps|shortlist/i.test(blob)) return "reply";
  return "other";
}

function matchApplication(apps: Application[], subject: string, from: string, body: string) {
  const blob = `${subject} ${from} ${body}`.toLowerCase();
  return (
    apps.find((a) => a.company && blob.includes(a.company.toLowerCase())) ||
    apps.find((a) => a.title && blob.includes(a.title.toLowerCase().slice(0, 24))) ||
    null
  );
}

export async function connectGmailFromCode(code: string, origin: string) {
  const auth = await exchangeGmailCode(code, origin);
  const existing = await readGmailAuth();
  if (!auth.refreshToken && existing?.refreshToken) auth.refreshToken = existing.refreshToken;
  await writeGmailAuth(auth);
  await mutateStore((s) => {
    s.settings.emailConnected = true;
    s.settings.connectedEmail = auth.email;
  });
  return auth.email;
}

export async function disconnectGmail() {
  await writeGmailAuth(null);
  await mutateStore((s) => {
    s.settings.emailConnected = false;
    s.settings.connectedEmail = null;
  });
}

export async function syncGmailInbox() {
  const auth = await freshAuth();
  const store = await readStore();
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("maxResults", "20");
  listUrl.searchParams.set("q", "in:inbox newer_than:21d -category:promotions -category:social");
  const listRes = await fetch(listUrl, {
    headers: { authorization: `Bearer ${auth.accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  const list = (await listRes.json()) as { messages?: { id: string }[]; error?: { message?: string } };
  if (!listRes.ok) throw new Error(list.error?.message || "Gmail listing failed");

  const existing = new Set(store.inbox.map((m) => m.id));
  const imported: InboxMessage[] = [];
  for (const row of (list.messages ?? []).slice(0, 12)) {
    if (existing.has(`gmail-${row.id}`)) continue;
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${row.id}?format=full`,
      {
        headers: { authorization: `Bearer ${auth.accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      },
    );
    if (!msgRes.ok) continue;
    const msg = (await msgRes.json()) as {
      id: string;
      internalDate?: string;
      payload?: { headers?: GmailHeader[]; body?: { data?: string }; parts?: GmailPart[]; mimeType?: string };
    };
    const headers = msg.payload?.headers;
    const subject = header(headers, "Subject") || "(no subject)";
    const fromRaw = header(headers, "From");
    const { name, email } = parseFrom(fromRaw);
    const body = walkParts(msg.payload).replace(/\s+/g, " ").trim().slice(0, 1200);
    const app = matchApplication(store.applications, subject, fromRaw, body);
    const kind = classify(subject, body);
    imported.push({
      id: `gmail-${msg.id}`,
      from: name,
      fromEmail: email,
      subject,
      body: body || subject,
      receivedAt: msg.internalDate ? new Date(Number(msg.internalDate)).toISOString() : new Date().toISOString(),
      applicationId: app?.id ?? null,
      kind: app && kind === "other" ? "reply" : kind,
      unread: true,
    });
  }

  await mutateStore((s) => {
    s.settings.emailConnected = true;
    s.settings.connectedEmail = auth.email;
    for (const msg of imported.reverse()) {
      if (s.inbox.some((m) => m.id === msg.id)) continue;
      s.inbox.unshift(msg);
      if (msg.applicationId && (msg.kind === "reply" || msg.kind === "interview" || msg.kind === "rejection")) {
        const app = s.applications.find((a) => a.id === msg.applicationId);
        if (!app) continue;
        if (msg.kind === "interview") app.status = "interview";
        else if (msg.kind === "rejection") app.status = "rejected";
        else if (app.status === "sent") app.status = "replied";
      }
    }
    s.inbox = s.inbox.slice(0, 80);
  });

  return { imported: imported.length, email: auth.email };
}
