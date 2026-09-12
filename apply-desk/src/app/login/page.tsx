import { loginAction } from "@/app/actions";
import { LOGIN_EMAIL, LOGIN_PASSWORD, PROFILE } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm tracking-wide text-muted-foreground uppercase">
        Nairobi · personal job desk
      </p>
      <h1 className="font-heading mt-2 text-5xl leading-none">Apply Desk</h1>
      <p className="mt-4 text-muted-foreground">
        Scan roles that fit {PROFILE.name}’s IT support profile. You apply on
        the posting. After that, Gmail can follow up on replies — grant access
        when you are ready.
      </p>
      <form action={loginAction} className="mt-8 space-y-4 rounded-xl border bg-card p-5">
        {error ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Email or password does not match. Use the demo login below.
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={LOGIN_EMAIL} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            defaultValue={LOGIN_PASSWORD}
            required
          />
        </div>
        <Button className="w-full" type="submit">
          Log in
        </Button>
        <p className="text-xs text-muted-foreground">
          Demo account: {LOGIN_EMAIL} / {LOGIN_PASSWORD}. Change DESK_PASSWORD in
          .env when you host this yourself.
        </p>
      </form>
    </main>
  );
}
