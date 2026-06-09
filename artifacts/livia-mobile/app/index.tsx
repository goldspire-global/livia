/**
 * App entry gateway — operator vs guest split on cold open.
 * Deep links (public-book, my-livia/visit, etc.) bypass this via AuthGate allowlist.
 */
import { AppEntryGateway } from "@/components/gateway/AppEntryGateway";

export default function AppEntryScreen() {
  return <AppEntryGateway />;
}
