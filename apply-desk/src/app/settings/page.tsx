import { saveSettingsAction } from "@/app/actions";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE } from "@/lib/profile";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { settings } = readStore();
  return (
    <Shell current="/settings">
      <h1 className="font-heading text-4xl">Settings</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        The desk scans and lists jobs. It does not send applications. Gmail is
        for follow-up after you apply yourself.
      </p>
      {saved ? <p className="mt-4 text-sm">Saved.</p> : null}

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

      <form action={saveSettingsAction} className="mt-6 space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-2xl">Scan</h2>
        <div className="space-y-2">
          <Label htmlFor="minScore">Minimum match score</Label>
          <Input id="minScore" name="minScore" type="number" min={0} max={99} defaultValue={settings.minScore} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Textarea id="keywords" name="keywords" rows={3} defaultValue={settings.keywords} />
        </div>
        <Button type="submit">Save</Button>
      </form>
    </Shell>
  );
}
