import AsyncStorage from "@react-native-async-storage/async-storage";

const HANDOFF_KEY = "livia.gatewayHandoff.v1";

export async function markGatewaySkinHandoff(vertical?: string | null) {
  try {
    await AsyncStorage.setItem(
      HANDOFF_KEY,
      JSON.stringify({ at: Date.now(), vertical: vertical ?? null }),
    );
  } catch {
    // ignore
  }
}

export async function consumeGatewaySkinHandoff(): Promise<{ vertical: string | null } | null> {
  try {
    const raw = await AsyncStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(HANDOFF_KEY);
    const parsed = JSON.parse(raw) as { at: number; vertical: string | null };
    if (Date.now() - parsed.at > 30_000) return null;
    return { vertical: parsed.vertical };
  } catch {
    return null;
  }
}
