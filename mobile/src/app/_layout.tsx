import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { initDatabase } from "@/database/database";
import {
  AuthProvider,
  useAuth,
} from "../contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase();
    setDbReady(true);
  }, []);

  if (!dbReady || loading) return null;

  return (
    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >
      <AnimatedSplashOverlay />

      <Stack screenOptions={{ headerBackTitle: "Voltar" }}>
        <Stack.Protected guard={!user}>
          <Stack.Screen
            name="login"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="cadastro"
            options={{ title: "Criar conta" }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!!user}>
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="perfil"
            options={{ title: "Meu perfil" }}
          />

          <Stack.Screen
            name="propriedades"
            options={{ title: "Minhas propriedades" }}
          />

          <Stack.Screen
            name="scanner"
            options={{ title: "Ler QR Code" }}
          />

          <Stack.Screen
            name="animais/index"
            options={{ title: "Animais cadastrados" }}
          />

          <Stack.Screen
            name="animais/novo"
            options={{ title: "Cadastrar bovino" }}
          />

          <Stack.Screen
            name="animal/[id]"
            options={{ title: "Detalhes do bovino" }}
          />

          <Stack.Screen
            name="eventos/novo"
            options={{ title: "Registrar evento" }}
          />

          <Stack.Screen
            name="eventos/historico"
            options={{ title: "Histórico do bovino" }}
          />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}