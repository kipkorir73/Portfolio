import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mergeStores } from "./merge";
import type { Store } from "./types";

const DATA_DIR =
  process.env.NODE_ENV === "production" || process.env.NETLIFY
    ? join("/tmp", "apply-desk")
    : join(process.cwd(), "data");
const FILE = join(DATA_DIR, "store.json");
const AUTH_FILE = join(DATA_DIR, "gmail-auth.json");

export type GmailAuth = {
  accessToken: string;
  refreshToken: string;
  expiry: number;
  email: string;
  appPassword?: string;
};

function seed(): Store {
  return {
    settings: {
      autoApplyEmail: false,
      dailyCap: 6,
      minScore: 10,
      keywords:
        "IT support, helpdesk, systems administrator, network, Nairobi, ICT, office assistant, data entry, customer service, receptionist, computer operator",
      emailConnected: false,
      connectedEmail: null,
      lastScanAt: null,
      lastApplyAt: null,
      country: "worldwide",
      updatedAt: null,
    },
    jobs: [],
    applications: [],
    inbox: [],
    profile: {
      cvFileName: null,
      cvUploadedAt: null,
      cvText: null,
    },
  };
}

let memory: Store | null = null;
let authMemory: GmailAuth | null | undefined;
let loadPromise: Promise<Store> | null = null;

function readJsonFile<T>(path: string): T | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function writeJsonFile(path: string, value: unknown) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path, JSON.stringify(value));
}

async function blobs() {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: "apply-desk", consistency: "strong" });
  } catch {
    return null;
  }
}

async function readBlob<T>(key: string): Promise<T | null> {
  try {
    const store = await blobs();
    if (!store) return null;
    const value = await store.get(key, { type: "json" });
    return (value as T) ?? null;
  } catch {
    return null;
  }
}

async function writeBlob(key: string, value: unknown) {
  try {
    const store = await blobs();
    if (!store) return;
    await store.set(key, JSON.stringify(value));
  } catch {
    // Local dev and some Netlify contexts have no blob store; file still saves.
  }
}

function asAuth(value: unknown): GmailAuth | null {
  if (!value || typeof value !== "object") return null;
  const v = value as GmailAuth;
  if (!v.email) return null;
  if (!v.accessToken && !v.refreshToken && !v.appPassword) return null;
  return v;
}

function normalizeStore(store: Store): Store {
  if (!store.profile) {
    store.profile = { cvFileName: null, cvUploadedAt: null, cvText: null };
  }
  if (!store.settings.country) {
    store.settings.country = "worldwide";
  }
  return store;
}

async function loadStore(): Promise<Store> {
  const [fromBlob, fromFile] = await Promise.all([readBlob<Store>("desk"), Promise.resolve(readJsonFile<Store>(FILE))]);
  const blobOk = fromBlob && Array.isArray(fromBlob.jobs);
  const fileOk = fromFile && Array.isArray(fromFile.jobs);
  if (blobOk && fileOk) return normalizeStore(mergeStores(fromBlob, fromFile));
  if (blobOk) return normalizeStore(fromBlob);
  if (fileOk) return normalizeStore(fromFile);
  return seed();
}

export async function readStore(): Promise<Store> {
  if (memory) return memory;
  if (!loadPromise) {
    loadPromise = loadStore()
      .then((store) => {
        memory = store;
        return store;
      })
      .finally(() => {
        loadPromise = null;
      });
  }
  return loadPromise;
}

export async function writeStore(store: Store) {
  memory = store;
  try {
    writeJsonFile(FILE, store);
  } catch {
    // /tmp should work on Netlify; memory still holds this instance.
  }
  await writeBlob("desk", store);
  return store;
}

export async function mutateStore(fn: (store: Store) => void): Promise<Store> {
  const store = await readStore();
  fn(store);
  await writeStore(store);
  return store;
}

export async function replaceStore(next: Store): Promise<Store> {
  const current = await readStore();
  const merged = mergeStores(current, next);
  await writeStore(merged);
  return merged;
}

export async function readGmailAuth(): Promise<GmailAuth | null> {
  if (authMemory !== undefined) return authMemory;
  const fromBlob = asAuth(await readBlob<GmailAuth>("gmail-auth"));
  const fromFile = asAuth(readJsonFile<GmailAuth>(AUTH_FILE));
  authMemory = fromBlob ?? fromFile ?? null;
  return authMemory;
}

export async function writeGmailAuth(auth: GmailAuth | null) {
  authMemory = auth;
  try {
    if (auth) writeJsonFile(AUTH_FILE, auth);
    else if (existsSync(AUTH_FILE)) writeJsonFile(AUTH_FILE, {});
  } catch {
    // ignore file errors
  }
  await writeBlob("gmail-auth", auth ?? {});
}

export function peekStore() {
  return memory;
}

const CV_FILE = join(DATA_DIR, "cv.bin");
const CV_META = join(DATA_DIR, "cv-meta.json");

export async function saveCvFile(buffer: Buffer, filename: string, mime: string) {
  const meta = { filename, mime, size: buffer.length };
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(CV_FILE, buffer);
    writeJsonFile(CV_META, meta);
  } catch {
    // blobs still save
  }
  try {
    const store = await blobs();
    if (store) {
      await store.set("cv-file", buffer.toString("base64"), { metadata: { filename, mime, encoding: "base64" } });
    }
  } catch {
    // ignore
  }
  return meta;
}

export async function readCvFile(): Promise<{ buffer: Buffer; filename: string; mime: string } | null> {
  try {
    const store = await blobs();
    if (store) {
      const raw = await store.get("cv-file", { type: "text" });
      if (raw) {
        const meta = readJsonFile<{ filename: string; mime: string }>(CV_META);
        return {
          buffer: Buffer.from(raw, "base64"),
          filename: meta?.filename || "cv.pdf",
          mime: meta?.mime || "application/pdf",
        };
      }
    }
  } catch {
    // file fallback
  }
  try {
    if (!existsSync(CV_FILE)) return null;
    const meta = readJsonFile<{ filename: string; mime: string }>(CV_META);
    return {
      buffer: readFileSync(CV_FILE),
      filename: meta?.filename || "cv.pdf",
      mime: meta?.mime || "application/pdf",
    };
  } catch {
    return null;
  }
}
