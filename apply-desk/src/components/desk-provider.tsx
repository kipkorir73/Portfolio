"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { DeskStats } from "@/lib/stats";
import type { ApplicationStatus, Store } from "@/lib/types";

export type DeskPayload = {
  store: Store;
  stats: DeskStats;
  jobs?: number;
  keptPrevious?: boolean;
  error?: string;
};

type DeskContextValue = {
  store: Store | null;
  stats: DeskStats | null;
  loading: boolean;
  scanning: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  scan: () => Promise<number>;
  applied: (jobId: string) => Promise<void>;
  setStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  saveSettings: (minScore: number, keywords: string) => Promise<void>;
};

const DeskContext = createContext<DeskContextValue | null>(null);

async function readJson(res: Response) {
  const data = (await res.json()) as DeskPayload & { error?: string; jobs?: number };
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [stats, setStats] = useState<DeskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPayload = useCallback((data: DeskPayload) => {
    setStore(data.store);
    setStats(data.stats);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      applyPayload(await readJson(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the desk");
      throw err;
    }
  }, [applyPayload]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Could not load the desk");
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
      applyPayload(data);
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
    async (minScore: number, keywords: string) => {
      await post({ op: "settings", minScore, keywords });
      toast.success("Saved.");
    },
    [post],
  );

  const value = useMemo(
    () => ({
      store,
      stats,
      loading,
      scanning,
      error,
      refresh,
      scan,
      applied,
      setStatus,
      markRead,
      saveSettings,
    }),
    [
      store,
      stats,
      loading,
      scanning,
      error,
      refresh,
      scan,
      applied,
      setStatus,
      markRead,
      saveSettings,
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
  const { loading, error, refresh } = useDesk();
  if (loading) {
    return <p className="text-muted-foreground">Loading desk…</p>;
  }
  if (error) {
    return (
      <div className="max-w-md">
        <h1 className="font-heading text-4xl">Could not load</h1>
        <p className="mt-3 text-muted-foreground">{error}</p>
        <button
          type="button"
          className="mt-6 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
          onClick={() => {
            void refresh();
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  return children;
}
