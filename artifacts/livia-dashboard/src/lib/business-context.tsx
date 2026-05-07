import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Business } from "@workspace/api-client-react";

const STORAGE_KEY = "livia.currentBusinessId";

interface BusinessContextType {
  business: Business | null;
  businesses: Business[];
  setBusiness: (business: Business | null) => void;
  setBusinessById: (id: string) => void;
  isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

/**
 * Resolve the active business from a list of memberships.
 * Order: persisted-id-if-still-member > first OWNER membership > businesses[0].
 * Per ADR 0010 (multi-tenant + persona model) — the Tenant axis is first-class
 * and persisted client-side; we don't put the businessId in the URL.
 */
function resolveInitialBusiness(businesses: Business[]): Business | null {
  if (businesses.length === 0) return null;
  let persisted: string | null = null;
  try {
    persisted = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  } catch {
    persisted = null;
  }
  if (persisted) {
    const found = businesses.find((b) => b.id === persisted);
    if (found) return found;
  }
  // Prefer the first business where the user is OWNER, if role info ever lands
  // on the Business object. For now, just return the first.
  return businesses[0];
}

export function BusinessProvider({
  children,
  businesses = [],
  isLoading,
}: {
  children: ReactNode;
  businesses?: Business[];
  isLoading?: boolean;
}) {
  const qc = useQueryClient();
  const [business, setBusinessState] = useState<Business | null>(() =>
    resolveInitialBusiness(businesses)
  );

  // Re-resolve whenever the membership list changes (e.g. after invite accept).
  useEffect(() => {
    setBusinessState((prev) => {
      if (prev && businesses.find((b) => b.id === prev.id)) return prev;
      return resolveInitialBusiness(businesses);
    });
  }, [businesses]);

  const persist = useCallback((b: Business | null) => {
    try {
      if (b) window.localStorage.setItem(STORAGE_KEY, b.id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const setBusiness = useCallback(
    (b: Business | null) => {
      setBusinessState(b);
      persist(b);
      // Reset persona when switching tenants — viewing-as-staff doesn't carry across.
      try {
        window.localStorage.removeItem("livia.viewingAsStaffId");
      } catch {
        // ignore
      }
      // Invalidate all per-business queries so the UI repaints with the new tenant.
      qc.invalidateQueries();
    },
    [persist, qc]
  );

  const setBusinessById = useCallback(
    (id: string) => {
      const target = businesses.find((b) => b.id === id);
      if (target) setBusiness(target);
    },
    [businesses, setBusiness]
  );

  const value = useMemo(
    () => ({
      business,
      businesses,
      setBusiness,
      setBusinessById,
      isLoading: isLoading || false,
    }),
    [business, businesses, setBusiness, setBusinessById, isLoading]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
