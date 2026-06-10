import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

/** Remote push is not available in Expo Go (SDK 53+). Dev/production builds only. */
export function isPushSupportedInThisBuild(): boolean {
  if (Platform.OS === "web") return false;
  if (Constants.appOwnership === "expo") return false;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return false;
  return true;
}

export async function loadNotificationsModule() {
  if (!isPushSupportedInThisBuild()) return null;
  return import("expo-notifications");
}
