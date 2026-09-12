"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-heading text-4xl">Something broke</h1>
      <p className="mt-3 text-muted-foreground">
        The desk hit a server error. Reload, or sign in again.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Reload
      </button>
    </main>
  );
}
