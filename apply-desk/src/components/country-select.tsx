"use client";

import { COUNTRIES, COUNTRY_REGIONS } from "@/lib/countries";
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
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Country they are hiring in</Label>
      <select
        id={id}
        name="country"
        value={value || "worldwide"}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {COUNTRY_REGIONS.map((region) => (
          <optgroup key={region} label={region}>
            {COUNTRIES.filter((c) => c.region === region).map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        LinkedIn is searched with that country (and main cities) as the hiring
        location — the same LinkedIn filter as “jobs in Nairobi, Kenya”, not a
        Kenya default. Each card keeps the city/country LinkedIn printed on the
        posting. Remote roles stay included.
      </p>
    </div>
  );
}
