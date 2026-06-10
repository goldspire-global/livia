import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
} from "@expo-google-fonts/cormorant-garamond";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { fetchOperatorSurface } from "@/lib/operator-surface";
import {
  setAuthTokenGetter,
  setBaseUrl,
} from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { isDemoRoute, isGatewayRoute, isGuestPublicRoute } from "@/lib/navigation";
import { GUEST_HUB_TOKEN_KEY } from "@/lib/guest-hub";
import { consumeMobileHomeRoute } from "@/lib/demo-session";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { isPushSupportedInThisBuild } from "@/lib/push-notifications";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingGate } from "@/components/OnboardingGate";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { PresentationThemeProvider } from "@/contexts/PresentationThemeContext";
import { usePushRegistration } from "@/hooks/usePushRegistration";
import { usePushNavigation } from "@/hooks/usePushNavigation";
import { getApiBaseUrl } from "@/lib/api-base";
import { initMobileSentry } from "@/lib/sentry";

// Set API base URL at module level — runs once before any component mounts.
setBaseUrl(getApiBaseUrl());
initMobileSentry();

if (!isPushSupportedInThisBuild()) {
  LogBox.ignoreLogs([
    "expo-notifications: Android Push notifications",
    "expo-notifications: iOS Push notifications",
  ]);
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const tokenCache = {
  getToken: (key: string) => AsyncStorage.getItem(key),
  saveToken: (key: string, value: string) => AsyncStorage.setItem(key, value),
  clearToken: (key: string) => AsyncStorage.removeItem(key),
};

function ClerkAuthBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return (await getToken()) ?? null;
      } catch {
        return null;
      }
    });
  }, [getToken]);
  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;
    const onSignIn = segments[0] === "sign-in";
    const onGateway = isGatewayRoute(segments);
    const onExecDesk = segments[0] === "_internal";
    const onDemo = isDemoRoute(segments);
    const onGuestPublic = isGuestPublicRoute(segments);
    const allowDemo =
      onDemo &&
      (process.env.EXPO_PUBLIC_DEMO_LOGIN === "true" || __DEV__);
    if (onDemo && !allowDemo) {
      router.replace("/");
      return;
    }
    if (isSignedIn && (onGateway || onSignIn)) {
      void (async () => {
        const surface = await fetchOperatorSurface(() => getToken());
        if (surface?.platformExec) {
          router.replace("/_internal/desk" as never);
          return;
        }
        const home = await consumeMobileHomeRoute();
        router.replace((home ?? "/(tabs)") as never);
      })();
      return;
    }
    if (!isSignedIn && onGateway) {
      void (async () => {
        const hubToken = await AsyncStorage.getItem(GUEST_HUB_TOKEN_KEY);
        if (hubToken) {
          router.replace("/my-livia" as never);
        }
      })();
      return;
    }
    if (!isSignedIn && !onGateway && !onSignIn && !allowDemo && !onGuestPublic) {
      router.replace("/");
    } else if (isSignedIn && onSignIn) {
      void (async () => {
        const surface = await fetchOperatorSurface(() => getToken());
        if (surface?.platformExec) {
          router.replace("/_internal/desk" as never);
          return;
        }
        const home = await consumeMobileHomeRoute();
        router.replace((home ?? "/(tabs)") as never);
      })();
    } else if (isSignedIn && !onExecDesk && !onDemo && !onGuestPublic && !onGateway) {
      void (async () => {
        const surface = await fetchOperatorSurface(() => getToken());
        if (surface?.platformExec) {
          router.replace("/_internal/desk" as never);
        }
      })();
    }
  }, [isSignedIn, isLoaded, segments, router, getToken]);

  return <>{children}</>;
}

function PushRegistrationBridge() {
  usePushRegistration();
  usePushNavigation();
  return null;
}

function RootLayoutNav() {
  return (
    <BusinessProvider>
      <PresentationThemeProvider>
      <PushRegistrationBridge />
      <AuthGate>
        <OnboardingGate>
        <Stack
          screenOptions={{
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="my" options={{ headerShown: false }} />
          <Stack.Screen name="demo/index" options={{ headerShown: false }} />
          <Stack.Screen name="demo/wedge/[vertical]" options={{ headerShown: false }} />
          <Stack.Screen name="demo/[persona]" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding-setup" options={{ title: "Setup essentials" }} />
          <Stack.Screen name="onboarding-continue" options={{ title: "Setup" }} />
          <Stack.Screen name="experience" options={{ title: "Experience" }} />
          <Stack.Screen name="demo-guide" options={{ headerShown: false }} />
          <Stack.Screen name="public-book/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="my-livia/index" options={{ headerShown: false }} />
          <Stack.Screen name="my-livia/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="my-livia/[slug]/visit/[bookingId]" options={{ headerShown: false }} />
          <Stack.Screen name="guest-surface" options={{ headerShown: false }} />
          <Stack.Screen name="booking/[id]" options={{ title: "Booking" }} />
          <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="booking/new" options={{ title: "New Booking" }} />
          <Stack.Screen name="customer/[id]" options={{ title: "Client" }} />
          <Stack.Screen name="customer/new" options={{ title: "New Client" }} />
          <Stack.Screen name="staff/index" options={{ title: "Staff" }} />
          <Stack.Screen name="staff/invite" options={{ title: "Invite" }} />
          <Stack.Screen name="staff/[id]" options={{ title: "Staff Member" }} />
          <Stack.Screen name="services/index" options={{ title: "Services" }} />
          <Stack.Screen name="service/new" options={{ title: "New Service" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen name="_internal/desk" options={{ title: "Overview", headerShown: false }} />
          <Stack.Screen name="founder/cockpit" options={{ headerShown: false }} />
          <Stack.Screen name="plan" options={{ title: "Plan" }} />
          <Stack.Screen name="design-proofs" options={{ title: "Design proofs" }} />
          <Stack.Screen name="clinical-hub" options={{ title: "Clinical hub" }} />
          <Stack.Screen name="liv-mandate" options={{ title: "Liv Mandate" }} />
          <Stack.Screen name="accountant-preview" options={{ title: "Accountant preview" }} />
          <Stack.Screen name="audit" options={{ title: "Audit" }} />
          <Stack.Screen name="lifecycle" options={{ title: "Lifecycle" }} />
          <Stack.Screen name="host" options={{ title: "Host floor" }} />
          <Stack.Screen name="brands" options={{ title: "Brands" }} />
          <Stack.Screen name="premises" options={{ headerShown: false }} />
          <Stack.Screen name="day-packages" options={{ headerShown: false }} />
          <Stack.Screen name="rota" options={{ title: "Team rota" }} />
          <Stack.Screen name="time-off" options={{ title: "Request leave" }} />
        </Stack>
        </OnboardingGate>
      </AuthGate>
      </PresentationThemeProvider>
    </BusinessProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider
            publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ""}
            tokenCache={tokenCache}
          >
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#09090b" }}>
              <KeyboardProvider>
                <StatusBar style="light" />
                <ClerkAuthBridge />
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </ClerkProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
