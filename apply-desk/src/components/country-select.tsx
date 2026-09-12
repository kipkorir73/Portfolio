"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { COUNTRIES, COUNTRY_REGIONS, countryLabel } from "@/lib/countries";
import { Label } from "@/components/ui/label";

export function CountrySelect({
  id = "country",
  value,
  onChange,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = value || "worldwide";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRY_REGIONS.map((region) => ({
      region,
      countries: COUNTRIES.filter((c) => c.region === region).filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.aliases.some((alias) => alias.includes(q))
        );
      }),
    })).filter((group) => group.countries.length > 0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  return (
    <div className="space-y-2" ref={rootRef}>
      <Label htmlFor={id}>Country they are hiring in</Label>
      <input type="hidden" name="country" value={selected} />
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
          setQuery("");
        }}
        className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        <span className="truncate">{countryLabel(selected)}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
      </button>
      {open ? (
        <div className="relative z-40">
          <div className="absolute top-1 z-40 w-full rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
            <div className="border-b border-border p-2">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or city"
                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1" role="listbox">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">No matching country.</p>
              ) : (
                filtered.map((group) => (
                  <div key={group.region}>
                    <p className="px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      {group.region}
                    </p>
                    {group.countries.map((c) => {
                      const active = c.code === selected;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted ${active ? "bg-muted/80" : ""}`}
                          onClick={() => {
                            onChange(c.code);
                            setOpen(false);
                            setQuery("");
                          }}
                        >
                          <span>{c.name}</span>
                          {active ? <Check className="size-4 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Type to find a country. LinkedIn uses that country (and main cities) as the
        hiring location on the posting, not a Kenya default. Remote roles stay included.
      </p>
    </div>
  );
}
