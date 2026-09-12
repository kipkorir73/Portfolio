"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDesk } from "@/components/desk-provider";
import { Button } from "@/components/ui/button";
import { PROFILE } from "@/lib/profile";

function GmailPanelInner() {
  const { store, gmailReady, syncInbox, disconnectGmail } = useDesk();
  const params = useSearchParams();
  const [busy, setBusy] = useState<"sync" | "off" | null>(null);
  const flag = params.get("gmail");
  const connected = Boolean(store?.settings.emailConnected);
  const email = store?.settings.connectedEmail ?? PROFILE.email;

  return (
    <section className="mt-8 rounded-xl border bg-card p-5">
      <h2 className="font-heading text-2xl">Gmail</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Connect {PROFILE.email} so recruiter replies can file against jobs you
        marked as applied. The desk only reads inbox mail. It never sends
        applications.
      </p>
      {flag === "setup" ? (
        <p className="mt-3 rounded-md border px-3 py-2 text-sm">
          Add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in
          Netlify → Site settings → Environment variables, then redeploy. Authorized
          redirect URI: <code>/api/gmail/callback</code> on this site.
        </p>
      ) : null}
      {flag === "denied" ? (
        <p className="mt-3 rounded-md border px-3 py-2 text-sm">Google access was cancelled.</p>
      ) : null}
      {flag === "error" ? (
        <p className="mt-3 rounded-md border px-3 py-2 text-sm">
          Google sign-in failed. Check the OAuth client redirect URI and try again.
        </p>
      ) : null}
      {flag === "connected" ? (
        <p className="mt-3 rounded-md border px-3 py-2 text-sm">Gmail connected. Sync to pull follow-up mail.</p>
      ) : null}

      {!gmailReady && !connected ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Google OAuth is not configured on this deploy yet. After you add the two
          env vars, Connect Gmail will open Google&apos;s permission screen.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {connected ? (
          <>
            <p className="w-full text-sm">Connected as {email}</p>
            <Button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                setBusy("sync");
                void syncInbox().finally(() => setBusy(null));
              }}
            >
              {busy === "sync" ? "Syncing…" : "Sync inbox"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => {
                setBusy("off");
                void disconnectGmail().finally(() => setBusy(null));
              }}
            >
              {busy === "off" ? "Disconnecting…" : "Disconnect"}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => {
              window.location.href = "/api/gmail/start";
            }}
          >
            Connect Gmail
          </Button>
        )}
      </div>
    </section>
  );
}

export function GmailPanel() {
  return (
    <Suspense fallback={<section className="mt-8 rounded-xl border bg-card p-5">Gmail</section>}>
      <GmailPanelInner />
    </Suspense>
  );
}
