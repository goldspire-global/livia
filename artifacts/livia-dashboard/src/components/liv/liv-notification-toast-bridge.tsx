import { useActNotificationToasts } from "@/hooks/use-act-notification-toasts";

/** Mount once in app shell — toasts act-priority Twin/commerce notifications. */
export function LivNotificationToastBridge() {
  useActNotificationToasts();
  return null;
}
