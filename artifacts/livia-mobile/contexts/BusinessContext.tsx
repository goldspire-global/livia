import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetMyBusinesses } from "@workspace/api-client-react";
import type { Business } from "@workspace/api-client-react";
import { useSegments } from "expo-router";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface BusinessContextValue {
  businesses: Business[];
  currentBusiness: Business | null;
  isLoading: boolean;
  isError: boolean;
  setCurrentBusiness: (business: Business) => void;
  refetch: () => void;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);
// ADR 0010 — unified key across web + mobile. Web uses the same string in
// `artifacts/livia-dashboard/src/lib/business-context.tsx` so a founder who
// switches business on her phone sees the change reflected next time she
// logs into the dashboard (and vice versa). Two legacy keys are migrated.
const STORAGE_KEY = "livia.currentBusinessId";
const LEGACY_KEYS = ["livia_current_business_id", "bliq_current_business_id"];

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(
    null
  );

  // The /demo surface is a public, mocked walk-through (the "hotel principle"
  // showcase). It must not hit any tenant-aware endpoint, otherwise an
  // anonymous visitor would trigger /me/businesses and we'd leak the auth
  // boundary out of the demo. Disable the query while the user is inside the
  // demo route tree.
  const segments = useSegments();
  const inDemo = segments[0] === "demo";

  const {
    data: businesses = [],
    isLoading,
    isError,
    refetch,
  } = useGetMyBusinesses({ query: { enabled: !inDemo } } as Parameters<
    typeof useGetMyBusinesses
  >[0]);

  useEffect(() => {
    // One-shot migration: walk the legacy keys (in priority order) and copy
    // the first one we find into the unified key, then clear all legacy keys.
    // Safe to run on every boot.
    (async () => {
      const current = await AsyncStorage.getItem(STORAGE_KEY);
      if (current) {
        setCurrentBusinessId(current);
        return;
      }
      for (const key of LEGACY_KEYS) {
        const legacy = await AsyncStorage.getItem(key);
        if (legacy) {
          await AsyncStorage.setItem(STORAGE_KEY, legacy);
          setCurrentBusinessId(legacy);
          break;
        }
      }
      // Clean up any remaining legacy keys regardless.
      await Promise.all(LEGACY_KEYS.map((k) => AsyncStorage.removeItem(k)));
    })();
  }, []);

  useEffect(() => {
    if (businesses.length > 0 && !currentBusinessId) {
      const first = businesses[0];
      setCurrentBusinessId(first.id);
      AsyncStorage.setItem(STORAGE_KEY, first.id);
    }
  }, [businesses, currentBusinessId]);

  const currentBusiness = useMemo(
    () => businesses.find((b) => b.id === currentBusinessId) ?? businesses[0] ?? null,
    [businesses, currentBusinessId]
  );

  const setCurrentBusiness = (business: Business) => {
    setCurrentBusinessId(business.id);
    AsyncStorage.setItem(STORAGE_KEY, business.id);
  };

  const value = useMemo(
    () => ({
      businesses,
      currentBusiness,
      isLoading,
      isError,
      setCurrentBusiness,
      refetch,
    }),
    [businesses, currentBusiness, isLoading, isError, refetch]
  );

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) throw new Error("useBusiness must be used within BusinessProvider");
  return context;
}
