"use client";

import { COUNTRIES } from "@/lib/countries";
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
      <Label htmlFor={id}>Country</Label>
      <select
        id={id}
        name="country"
        value={value || "worldwide"}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Scan that country plus remote jobs you can do from anywhere. Choose
        Worldwide to search every board.
      </p>
    </div>
  );
}
