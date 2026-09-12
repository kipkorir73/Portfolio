export function formatWhen(iso: string | null | undefined) {
  if (!iso) return "Not yet";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  try {
    return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}

export function formatDay(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleDateString("en-GB", { dateStyle: "medium" });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
