export function extractResumeText(buffer: Buffer, filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return buffer.toString("utf8").replace(/\s+/g, " ").trim().slice(0, 16000);
  }
  const raw = buffer.toString("latin1");
  const fromParens = [...raw.matchAll(/\((?:\\.|[^\\)]){4,}\)/g)]
    .map((m) =>
      m[0]
        .slice(1, -1)
        .replace(/\\n/g, " ")
        .replace(/\\r/g, " ")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\[A-Za-z]/g, " "),
    )
    .join(" ");
  const ascii = `${fromParens} ${raw.replace(/[^\x09\x0a\x0d\x20-\x7E]/g, " ")}`;
  return ascii.replace(/\s+/g, " ").trim().slice(0, 16000);
}
