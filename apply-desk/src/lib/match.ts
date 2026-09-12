import type { Job } from "./types";

const POSITIVE: { re: RegExp; weight: number; label: string }[] = [
  { re: /\bit support\b|\bict\b|\bhelp ?desk\b|\bservice desk\b|\bdesktop support\b/i, weight: 28, label: "IT support" },
  { re: /\bsystems? admin|\bnetwork admin|\bsysadmin\b/i, weight: 24, label: "sysadmin" },
  { re: /\btechnician\b|\bhardware\b|\bperipherals?\b|\bprinter/i, weight: 16, label: "hardware" },
  { re: /\bwindows\b|\blinux\b|\bactive directory\b/i, weight: 14, label: "OS" },
  { re: /\bnetwork|\blan\b|\bwan\b|\bdhcp\b|\bfirewall\b|\bmikrotik\b|\bubiquiti\b/i, weight: 16, label: "networking" },
  { re: /\bnairobi\b|\bkenya\b|\bremote\b/i, weight: 10, label: "location" },
  { re: /\bschool\b|\bacademy\b|\beducation\b|\bcampus\b/i, weight: 8, label: "education ICT" },
  { re: /\bl1\b|\bfirst[- ]line\b|\bticketing\b|\buser (account|support)/i, weight: 12, label: "L1" },
];

const NEGATIVE = [
  /\b(senior staff engineer|principal|staff software|quant|android native|ios native)\b/i,
  /\b(10\+|15\+) years\b/i,
];

export function scoreText(title: string, description: string, extraKeywords = "") {
  const blob = `${title}\n${description}\n${extraKeywords}`;
  const reasons: string[] = [];
  let score = 8;

  for (const rule of POSITIVE) {
    if (rule.re.test(blob)) {
      score += rule.weight;
      reasons.push(rule.label);
    }
  }
  for (const kw of extraKeywords.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (kw.length > 2 && blob.toLowerCase().includes(kw.toLowerCase())) {
      score += 6;
      reasons.push(kw);
    }
  }
  if (NEGATIVE.some((re) => re.test(blob))) score -= 25;

  return { score: Math.max(0, Math.min(99, score)), reasons: [...new Set(reasons)].slice(0, 5) };
}

export function guessChannel(url: string, applyEmail: string | null): Job["channel"] {
  if (applyEmail) return "email";
  if (/linkedin\.com/i.test(url)) return "linkedin";
  if (/brightermonday|myjobmag|fuzu|indeed|glassdoor|remoteok|weworkremotely|arbeitnow/i.test(url)) {
    return "job_board";
  }
  return "company_site";
}
