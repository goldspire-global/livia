import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DemoBusinessTenant } from "@/lib/demo-portal";

const CACHE_KEY = "livia.demoWorldStatus.v1";
const CACHE_TTL_MS = 5 * 60_000;

type DemoWorldStatusCache = {
  at: number;
  provisioned: boolean;
  businesses: DemoBusinessTenant[];
};

export async function readDemoWorldStatusCache(): Promise<Omit<DemoWorldStatusCache, "at"> | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoWorldStatusCache;
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return { provisioned: parsed.provisioned, businesses: parsed.businesses };
  } catch {
    return null;
  }
}

export async function writeDemoWorldStatusCache(
  provisioned: boolean,
  businesses: DemoBusinessTenant[],
) {
  try {
    const payload: DemoWorldStatusCache = {
      at: Date.now(),
      provisioned,
      businesses,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export async function clearDemoWorldStatusCache() {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
