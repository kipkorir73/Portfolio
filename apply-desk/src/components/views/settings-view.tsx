"use client";

import { useState } from "react";
import { useDesk } from "@/components/desk-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE } from "@/lib/profile";

export function SettingsView() {
  const { store, saveSettings } = useDesk();
  const [saving, setSaving] = useState(false);
  if (!store) return null;
  const { settings } = store;

  return (
    <>
      <h1 className="font-heading text-4xl">Settings</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        The desk scans and lists jobs. It does not send applications. Gmail is
        for follow-up after you apply yourself.
      </p>

      <section className="mt-8 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-2xl">Profile</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd>{PROFILE.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Title</dt>
            <dd>{PROFILE.title}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd>{PROFILE.location}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{PROFILE.phone}</dd>
          </div>
        </dl>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{PROFILE.summary}</p>
        <a className="mt-4 inline-block text-sm underline" href={PROFILE.cvPath}>
          Download CV
        </a>
      </section>

      <form
        className="mt-6 space-y-4 rounded-xl border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setSaving(true);
          void saveSettings(
            Number(form.get("minScore") ?? 40),
            String(form.get("keywords") ?? settings.keywords),
          ).finally(() => setSaving(false));
        }}
      >
        <h2 className="font-heading text-2xl">Scan</h2>
        <div className="space-y-2">
          <Label htmlFor="minScore">Minimum match score</Label>
          <Input id="minScore" name="minScore" type="number" min={0} max={99} defaultValue={settings.minScore} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Textarea id="keywords" name="keywords" rows={3} defaultValue={settings.keywords} />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </form>
    </>
  );
}
