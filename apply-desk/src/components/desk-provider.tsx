"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LOCAL_STORE_KEY, isStore, mergeStores } from "@/lib/merge";
import { statsFrom, type DeskStats } from "@/lib/stats";
import type { ApplicationStatus, Store } from "@/lib/types";

export type DeskPayload = {
  store: Store;
  stats: DeskStats;
  jobs?: number;
  keptPrevious?: boolean;
  imported?: number;
  gmailReady?: boolean;
  error?: string;
};

type DeskContextValue = {
  store: Store | null;
  stats: DeskStats | null;
  loading: boolean;
  scanning: boolean;
  error: string | null;
  gmailReady: boolean;
  refresh: () => Promise<void>;
  scan: () => Promise<number>;
  applied: (jobId: string) => Promise<void>;
  setStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  saveSettings: (minScore: number, keywords: string, country?: string) => Promise<void>;
  syncInbox: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
  connectGmailApp: (email: string, appPassword: string) => Promise<void>;
  persistAndLogout: () => Promise<void>;
};

const DeskContext = createContext<DeskContextValue | null>(null);

function readLocal(): Store | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isStore(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocal(store: Store) {
  try {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(store));
  } catch {
    // private mode
  }
}

async function readJson(res: Response) {
  const data = (await res.json()) as DeskPayload;
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [stats, setStats] = useState<DeskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gmailReady, setGmailReady] = useState(false);

  const applyPayload = useCallback((data: DeskPayload, local?: Store | null) => {
    const merged = mergeStores(data.store, local ?? null);
    setStore(merged);
    setStats(statsFrom(merged));
    setGmailReady(Boolean(data.gmailReady));
    setError(null);
    writeLocal(merged);
    return merged;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const local = readLocal();
      const res = await fetch("/api/state", { cache: "no-store" });
      const data = await readJson(res);
      const merged = applyPayload(data, local);
      if (local && JSON.stringify(merged) !== JSON.stringify(data.store)) {
        await fetch("/api/desk", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ op: "persist", store: merged }),
        });
      }
    } catch (err) {
      const local = readLocal();
      if (local) {
        setStore(local);
        setStats(statsFrom(local));
        setError(null);
        return;
      }
      setError(err instanceof Error ? err.message : "Could not load the desk");
      throw err;
    }
  }, [applyPayload]);

  useEffect(() => {
    const local = readLocal();
    if (local) {
      setStore(local);
      setStats(statsFrom(local));
      setLoading(false);
    }
    let alive = true;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (alive && !readLocal()) {
          setError(err instanceof Error ? err.message : "Could not load the desk");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch("/api/desk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await readJson(res);
      applyPayload(data, readLocal());
      return data;
    },
    [applyPayload],
  );

  const scan = useCallback(async () => {
    setScanning(true);
    try {
      const data = await post({ op: "scan" });
      if (data.keptPrevious) {
        toast.message("Boards were slow. Showing the last successful scan.");
      } else {
        toast.success(`Scan finished. ${data.jobs ?? data.store.jobs.length} matching openings.`);
      }
      return data.jobs ?? data.store.jobs.length;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scan failed";
      toast.error(message);
      throw err;
    } finally {
      setScanning(false);
    }
  }, [post]);

  const applied = useCallback(
    async (jobId: string) => {
      await post({ op: "applied", jobId });
      toast.success("Logged as applied.");
    },
    [post],
  );

  const setStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      await post({ op: "status", id, status });
    },
    [post],
  );

  const markRead = useCallback(
    async (id: string) => {
      await post({ op: "read", id });
    },
    [post],
  );

  const saveSettings = useCallback(
    async (minScore: number, keywords: string, country?: string) => {
      setStore((prev) => {
        const current = prev ?? readLocal();
        if (!current) return prev;
        const next: Store = {
          ...current,
          settings: {
            ...current.settings,
            minScore,
            keywords,
            country: country || current.settings.country || "worldwide",
            updatedAt: new Date().toISOString(),
          },
        };
        writeLocal(next);
        setStats(statsFrom(next));
        return next;
      });
      await post({ op: "settings", minScore, keywords, country });
      toast.success("Saved.");
    },
    [post],
  );

  const syncInbox = useCallback(async () => {
    const data = await post({ op: "sync" });
    toast.success(
      data.imported ? `Pulled ${data.imported} message${data.imported === 1 ? "" : "s"} from Gmail.` : "Gmail is up to date.",
    );
  }, [post]);

  const disconnectGmail = useCallback(async () => {
    await post({ op: "disconnect" });
    toast.message("Gmail disconnected.");
  }, [post]);

  const connectGmailApp = useCallback(
    async (email: string, appPassword: string) => {
      await post({ op: "gmail-app", email, appPassword });
      toast.success("Gmail connected.");
    },
    [post],
  );

  const persistAndLogout = useCallback(async () => {
    const snapshot = store ?? readLocal();
    if (snapshot) writeLocal(snapshot);
    try {
      if (snapshot) {
        await fetch("/api/desk", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ op: "persist", store: snapshot }),
        });
      }
    } catch {
      // Browser copy is already saved.
    }
    await fetch("/api/logout", { method: "POST", redirect: "manual" });
    window.location.assign("/login");
  }, [store]);

  const value = useMemo(
    () => ({
      store,
      stats,
      loading,
      scanning,
      error,
      gmailReady,
      refresh,
      scan,
      applied,
      setStatus,
      markRead,
      saveSettings,
      syncInbox,
      disconnectGmail,
      connectGmailApp,
      persistAndLogout,
    }),
    [
      store,
      stats,
      loading,
      scanning,
      error,
      gmailReady,
      refresh,
      scan,
      applied,
      setStatus,
      markRead,
      saveSettings,
      syncInbox,
      disconnectGmail,
      connectGmailApp,
      persistAndLogout,
    ],
  );

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export function useDesk() {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside DeskProvider");
  return ctx;
}

export function DeskGate({ children }: { children: React.ReactNode }) {
  const { loading, error, refresh, store } = useDesk();
  if (loading && !store) {
    return <p className="text-muted-foreground">Loading desk…</p>;
  }
  if (error && !store) {
    return (
      <div className="max-w-md">
        <h1 className="font-heading text-4xl">Could not load</h1>
        <p className="mt-3 text-muted-foreground">{error}</p>
        <button
          type="button"
          className="mt-6 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
          onClick={() => {
            void refresh().catch(() => {});
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  return children;
}
