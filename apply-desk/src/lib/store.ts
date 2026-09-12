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
};

function seed(): Store {
  return {
    settings: {
      autoApplyEmail: false,
      dailyCap: 6,
      minScore: 22,
      keywords: "IT support, helpdesk, systems administrator, network, Nairobi, ICT",
      emailConnected: false,
      connectedEmail: null,
      lastScanAt: null,
      lastApplyAt: null,
    },
    jobs: [],
    applications: [],
    inbox: [],
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
  if (!v.accessToken && !v.refreshToken) return null;
  if (!v.email) return null;
  return v;
}

async function loadStore(): Promise<Store> {
  const [fromBlob, fromFile] = await Promise.all([readBlob<Store>("desk"), Promise.resolve(readJsonFile<Store>(FILE))]);
  const blobOk = fromBlob && Array.isArray(fromBlob.jobs);
  const fileOk = fromFile && Array.isArray(fromFile.jobs);
  if (blobOk && fileOk) return mergeStores(fromBlob, fromFile);
  if (blobOk) return fromBlob;
  if (fileOk) return fromFile;
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
