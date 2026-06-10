import { useRegisterDeviceToken } from "@workspace/api-client-react";
import { useAuth } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { isPushSupportedInThisBuild, loadNotificationsModule } from "@/lib/push-notifications";

function platformForExpo(): "IOS" | "ANDROID" | "WEB" {
  if (Platform.OS === "ios") return "IOS";
  if (Platform.OS === "android") return "ANDROID";
  return "WEB";
}

/** Registers Expo push token with api-server when signed in (N1). No-op in Expo Go. */
export function usePushRegistration() {
  const { isSignedIn } = useAuth();
  const { mutateAsync: registerToken } = useRegisterDeviceToken();
  const registered = useRef<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !isPushSupportedInThisBuild()) return;

    let cancelled = false;

    (async () => {
      const Notifications = await loadNotificationsModule();
      if (!Notifications || cancelled) return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      const { status: existing } = await Notifications.getPermissionsAsync();
      let final = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        final = status;
      }
      if (final !== "granted" || cancelled) return;

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        (Constants.expoConfig as { extra?: { eas?: { projectId?: string } } })?.extra?.eas
          ?.projectId;

      const tokenResult = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      const token = tokenResult.data;
      if (!token || cancelled || registered.current === token) return;

      await registerToken({
        data: { token, platform: platformForExpo() },
      });
      registered.current = token;
    })().catch((err) => {
      console.warn("[push] registration failed", err);
    });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, registerToken]);
}
