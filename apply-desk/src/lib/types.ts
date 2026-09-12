export type Channel = "email" | "job_board" | "company_site" | "linkedin";

export type ApplicationStatus =
  | "queued"
  | "sent"
  | "needs_you"
  | "replied"
  | "rejected"
  | "interview";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  applyEmail: string | null;
  channel: Channel;
  description: string;
  tags: string[];
  score: number;
  reasons: string[];
  postedAt: string;
  scannedAt: string;
};

export type Application = {
  id: string;
  jobId: string;
  title: string;
  company: string;
  channel: Channel;
  status: ApplicationStatus;
  appliedAt: string;
  toEmail: string | null;
  url: string;
  note: string;
};

export type InboxMessage = {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  receivedAt: string;
  applicationId: string | null;
  kind: "reply" | "rejection" | "interview" | "other";
  unread: boolean;
};

export type ProfileState = {
  cvFileName: string | null;
  cvUploadedAt: string | null;
  cvText: string | null;
};

export type Settings = {
  autoApplyEmail: boolean;
  dailyCap: number;
  minScore: number;
  keywords: string;
  emailConnected: boolean;
  connectedEmail: string | null;
  lastScanAt: string | null;
  lastApplyAt: string | null;
};

export type Store = {
  settings: Settings;
  jobs: Job[];
  applications: Application[];
  inbox: InboxMessage[];
  profile: ProfileState;
};
