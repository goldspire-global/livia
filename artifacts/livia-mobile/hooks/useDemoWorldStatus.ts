import { useCallback, useEffect, useState } from "react";
import {
  fetchDemoStatus,
  repairDemoDatabase,
  syncDemoWorld,
  type DemoBusinessTenant,
} from "@/lib/demo-portal";
import {
  readDemoWorldStatusCache,
  writeDemoWorldStatusCache,
} from "@/lib/demo-world-status-cache";

export function useDemoWorldStatus() {
  const [provisioned, setProvisioned] = useState(false);
  const [tenants, setTenants] = useState<DemoBusinessTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const cached = await readDemoWorldStatusCache();
      if (cancelled) return;
      if (cached) {
        setProvisioned(cached.provisioned);
        setTenants(cached.businesses);
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const st = await fetchDemoStatus();
      const businesses = st.businesses ?? [];
      setProvisioned(st.provisioned);
      setTenants(businesses);
      await writeDemoWorldStatusCache(st.provisioned, businesses);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Demo status unreachable";
      setError(msg);
      const cached = await readDemoWorldStatusCache();
      if (cached) {
        setProvisioned(cached.provisioned);
        setTenants(cached.businesses);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void refresh();
  }, [hydrated, refresh]);

  const setup = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await syncDemoWorld();
      setProvisioned(result.provisioned);
      await writeDemoWorldStatusCache(result.provisioned, result.businesses as DemoBusinessTenant[]);
      await refresh();
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Demo setup failed";
      setError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const repair = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await repairDemoDatabase();
      setProvisioned(result.provisioned);
      await writeDemoWorldStatusCache(result.provisioned, result.businesses as DemoBusinessTenant[]);
      await refresh();
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Demo repair failed";
      setError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  return { provisioned, tenants, loading, error, busy, refresh, setup, repair };
}
