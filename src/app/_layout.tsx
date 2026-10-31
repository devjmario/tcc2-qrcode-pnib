
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack
} from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <AnimatedSplashOverlay />

      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="scanner"
          options={{
            title: "Ler QR Code",
            headerStyle: {
              backgroundColor: "#1B4332"
            },
            headerTintColor: "#FFFFFF"
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
