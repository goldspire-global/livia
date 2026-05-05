import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Mode = "sign-in" | "sign-up" | "verify";

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!signInLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
      }
    } catch (err: unknown) {
      const e = err as { errors?: Array<{ message: string }> };
      setError(e?.errors?.[0]?.message ?? "Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("verify");
    } catch (err: unknown) {
      const e = err as { errors?: Array<{ message: string }> };
      setError(e?.errors?.[0]?.message ?? "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signUpLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
      }
    } catch (err: unknown) {
      const e = err as { errors?: Array<{ message: string }> };
      setError(e?.errors?.[0]?.message ?? "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.input,
      color: colors.foreground,
      borderColor: colors.border,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={styles.brand}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: colors.foreground }]}>Bliq</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            {mode === "verify"
              ? "Check your email for a code"
              : mode === "sign-up"
              ? "Create your account"
              : "Welcome back"}
          </Text>
        </View>

        <View style={styles.form}>
          {mode !== "verify" ? (
            <>
              <TextInput
                style={inputStyle}
                placeholder="Email"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                testID="email-input"
              />
              <TextInput
                style={inputStyle}
                placeholder="Password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                testID="password-input"
              />
            </>
          ) : (
            <TextInput
              style={inputStyle}
              placeholder="Verification code"
              placeholderTextColor={colors.mutedForeground}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoFocus
              testID="otp-input"
            />
          )}

          {error ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={
              mode === "verify"
                ? handleVerify
                : mode === "sign-in"
                ? handleSignIn
                : handleSignUp
            }
            disabled={loading}
            activeOpacity={0.85}
            testID="submit-button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === "verify"
                  ? "Verify Email"
                  : mode === "sign-in"
                  ? "Sign In"
                  : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          {mode !== "verify" ? (
            <TouchableOpacity
              onPress={() => {
                setError("");
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              }}
              style={styles.toggle}
            >
              <Text style={[styles.toggleText, { color: colors.mutedForeground }]}>
                {mode === "sign-in"
                  ? "No account? "
                  : "Already have an account? "}
                <Text style={{ color: colors.primary }}>
                  {mode === "sign-in" ? "Sign up" : "Sign in"}
                </Text>
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => { setMode("sign-up"); setCode(""); setError(""); }}
              style={styles.toggle}
            >
              <Text style={[styles.toggleText, { color: colors.mutedForeground }]}>
                Back to sign up
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  brand: {
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  form: {
    gap: 12,
    paddingBottom: 12,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  toggle: {
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
