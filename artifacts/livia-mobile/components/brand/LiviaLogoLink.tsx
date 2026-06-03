import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { LiviaWordmark } from "@/components/brand/LiviaWordmark";

type Props = {
  size?: "sm" | "md" | "lg";
  color?: string;
  style?: StyleProp<ViewStyle>;
  /** Tab home route for the signed-in app. */
  href?: string;
};

/** Top-of-screen Livia wordmark — navigates to the persona Today tab. */
export function LiviaLogoLink({ size = "sm", color, style, href = "/(tabs)" }: Props) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href as never)}
      accessibilityRole="link"
      accessibilityLabel="Livia home"
      style={style}
    >
      <LiviaWordmark size={size} color={color} />
    </Pressable>
  );
}
