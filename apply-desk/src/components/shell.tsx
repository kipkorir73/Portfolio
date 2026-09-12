import Link from "next/link";
import { PROFILE } from "@/lib/profile";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/jobs", label: "Openings" },
  { href: "/applications", label: "Applied" },
  { href: "/inbox", label: "Inbox" },
  { href: "/settings", label: "Settings" },
];

export function Shell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: string;
}) {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="font-heading text-xl tracking-tight">
            Apply Desk
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  current === l.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {PROFILE.email}
            </span>
            <form action="/api/logout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Log out
              </Button>
            </form>
          </div>
        </div>
        <nav className="flex gap-3 overflow-x-auto border-t border-border px-4 py-2 text-sm md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={current === l.href ? "text-foreground" : "text-muted-foreground"}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
