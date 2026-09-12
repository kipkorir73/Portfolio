"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDesk } from "@/components/desk-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROFILE } from "@/lib/profile";

function GmailPanelInner() {
  const { store, syncInbox, disconnectGmail, connectGmailApp } = useDesk();
  const params = useSearchParams();
  const [busy, setBusy] = useState<"sync" | "off" | "connect" | null>(null);
  const flag = params.get("gmail");
  const connected = Boolean(store?.settings.emailConnected);
  const email = store?.settings.connectedEmail ?? PROFILE.email;

  return (
    <section className="mt-8 rounded-xl border bg-card p-5">
      <h2 className="font-heading text-2xl">Gmail</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        No Google Cloud website needed. Turn on 2-Step Verification, then create
        an App Password at{" "}
        <a className="underline" href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">
          myaccount.google.com/apppasswords
        </a>
        . Paste it here. The desk only reads unread mail. It never sends applications.
      </p>
      {flag === "connected" ? (
        <p className="mt-3 rounded-md border px-3 py-2 text-sm">Gmail connected. Sync to pull follow-up mail.</p>
      ) : null}
      {flag === "error" || flag === "denied" ? (
        <p className="mt-3 rounded-md border px-3 py-2 text-sm">
          Use an App Password below instead of Google Cloud credentials.
        </p>
      ) : null}

      {connected ? (
        <div className="mt-4 flex flex-wrap gap-2">
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
        </div>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setBusy("connect");
            void connectGmailApp(String(form.get("email") ?? ""), String(form.get("appPassword") ?? "")).finally(
              () => setBusy(null),
            );
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="gmail-email">Gmail</Label>
            <Input id="gmail-email" name="email" type="email" defaultValue={PROFILE.email} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gmail-pass">App Password</Label>
            <Input
              id="gmail-pass"
              name="appPassword"
              type="password"
              autoComplete="off"
              placeholder="xxxx xxxx xxxx xxxx"
              required
            />
          </div>
          <Button type="submit" disabled={busy !== null}>
            {busy === "connect" ? "Connecting…" : "Connect Gmail"}
          </Button>
        </form>
      )}
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
