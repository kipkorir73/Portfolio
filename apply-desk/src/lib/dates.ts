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

export function postedLabel(iso: string) {
  const age = Date.now() - Date.parse(iso);
  if (Number.isNaN(age) || age < 0) return "Posted this week";
  const hours = Math.floor(age / (60 * 60 * 1000));
  if (hours < 24) return hours <= 1 ? "Posted today" : `Posted ${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}
