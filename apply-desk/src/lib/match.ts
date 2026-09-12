import type { Job } from "./types";

const POSITIVE: { re: RegExp; weight: number; label: string }[] = [
  { re: /\bit support\b|\bict\b|\bhelp ?desk\b|\bservice desk\b|\bdesktop support\b|\btechnical support\b/i, weight: 28, label: "IT support" },
  { re: /\bsystems? admin|\bnetwork admin|\bsysadmin\b|\bcomputer (operator|technician)\b/i, weight: 24, label: "sysadmin" },
  { re: /\btechnician\b|\bhardware\b|\bperipherals?\b|\bprinter|\bbiometric/i, weight: 16, label: "hardware" },
  { re: /\bwindows\b|\blinux\b|\bactive directory\b|\bms office\b|\bexcel\b/i, weight: 14, label: "OS / office" },
  { re: /\bnetwork|\blan\b|\bwan\b|\bdhcp\b|\bfirewall\b|\bmikrotik\b|\bubiquiti\b|\bwifi\b/i, weight: 16, label: "networking" },
  { re: /\bnairobi\b|\bkenya\b|\bremote\b/i, weight: 10, label: "location" },
  { re: /\bschool\b|\bacademy\b|\beducation\b|\bcampus\b|\badmissions?\b|\bbursar\b/i, weight: 10, label: "education / admin" },
  { re: /\bl1\b|\bfirst[- ]line\b|\bticketing\b|\buser (account|support)/i, weight: 12, label: "L1" },
  {
    re: /\b(office assistant|administrative assistant|admin assistant|data entry|data clerk|receptionist|front office|customer (care|service|support)|call cent(re|er)|records clerk|computer operator|office intern|graduate (trainee|intern)|entry[- ]level|no experience|filing clerk|secretary)\b/i,
    weight: 18,
    label: "generalist",
  },
];

const NEGATIVE = [
  /\b(senior staff engineer|principal|staff software|quant|android native|ios native)\b/i,
  /\b(10\+|15\+) years\b/i,
  /\b(registered nurse|clinical officer|pharmacist|chef\b|heavy duty driver|truck driver|full[- ]stack engineer|backend engineer|data scientist|chartered accountant|advocate of the high court)\b/i,
];

export function scoreText(title: string, description: string, extraKeywords = "") {
  const blob = `${title}\n${description}\n${extraKeywords}`;
  const reasons: string[] = [];
  let score = 10;

  for (const rule of POSITIVE) {
    if (rule.re.test(blob)) {
      score += rule.weight;
      reasons.push(rule.label);
    }
  }
  for (const kw of extraKeywords.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)) {
    if (kw.length > 2 && blob.toLowerCase().includes(kw.toLowerCase())) {
      score += 4;
      reasons.push(kw.length > 24 ? kw.slice(0, 24) : kw);
    }
  }
  if (NEGATIVE.some((re) => re.test(blob))) score -= 25;

  return { score: Math.max(0, Math.min(99, score)), reasons: [...new Set(reasons)].slice(0, 5) };
}

export function guessChannel(url: string, applyEmail: string | null): Job["channel"] {
  if (applyEmail) return "email";
  if (/linkedin\.com/i.test(url)) return "linkedin";
  if (/brightermonday|myjobmag|fuzu|indeed|glassdoor|careerjet|jobwebkenya|elevolt|corporate.?staffing/i.test(url)) {
    return "job_board";
  }
  return "company_site";
}
