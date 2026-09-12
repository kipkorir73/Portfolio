"use client";

import { useState } from "react";
import { GmailPanel } from "@/components/gmail-panel";
import { useDesk } from "@/components/desk-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROFILE } from "@/lib/profile";
import { formatWhen } from "@/lib/dates";
import { toast } from "sonner";

export function ProfileView() {
  const { store, refresh } = useDesk();
  const [uploading, setUploading] = useState(false);
  if (!store) return null;
  const cvName = store.profile?.cvFileName;

  return (
    <>
      <h1 className="font-heading text-4xl">Profile</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        This is the CV the desk matches against worldwide IT roles and generalist
        office jobs. Upload a new PDF anytime.
      </p>

      <section className="mt-8 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-2xl">Collins Kipkorir</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Title</dt>
            <dd>{PROFILE.title}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd>{PROFILE.location}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{PROFILE.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{PROFILE.phone}</dd>
          </div>
        </dl>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{PROFILE.summary}</p>
        <p className="mt-3 text-sm">
          Skills: {PROFILE.skills.join(", ")}
        </p>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-2xl">CV</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Current file: {cvName ?? "built-in IT Assistant CV"}. Uploaded{" "}
          {formatWhen(store.profile?.cvUploadedAt)}. Scans use text from this file
          plus your keywords.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
        <a
          className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
          href="/api/cv"
          target="_blank"
          rel="noreferrer"
        >
          Open CV
        </a>
        </div>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const file = (e.currentTarget.elements.namedItem("cv") as HTMLInputElement)?.files?.[0];
            if (!file) {
              toast.error("Choose a PDF or TXT file.");
              return;
            }
            const body = new FormData();
            body.set("cv", file);
            setUploading(true);
            void fetch("/api/cv", { method: "POST", body })
              .then(async (res) => {
                const data = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(data.error || "Upload failed");
                toast.success("CV saved. The next scan will use it.");
                await refresh();
              })
              .catch((err: unknown) => {
                toast.error(err instanceof Error ? err.message : "Upload failed");
              })
              .finally(() => setUploading(false));
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="cv">Upload another CV (PDF or TXT, under 1.8 MB)</Label>
            <Input id="cv" name="cv" type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" />
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Save CV"}
          </Button>
        </form>
      </section>

      <GmailPanel />
    </>
  );
}
