import { Stack } from "expo-router";
import { colors } from "@/src/theme/tokens";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.bg }
      }}
    >
      <Stack.Screen name="welcome" options={{ animation: "fade" }} />
    </Stack>
  );
}
