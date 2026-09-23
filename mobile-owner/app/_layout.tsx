import { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";

SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_MS = 1100;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const userId = useAuthStore((s) => s.user?._id);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
    const start = Date.now();
    hydrateAuth().finally(() => {
      const remaining = MIN_SPLASH_MS - (Date.now() - start);
      setTimeout(() => setReady(true), Math.max(0, remaining));
    });
  }, []);

  useEffect(() => {
    // Without this, signing out and a different owner signing in on the
    // same device (or in dev, Fast Refresh across accounts) would show the
    // previous owner's cached shop/orders/menu until every query happened
    // to refetch — a real cross-account data leak, not just a stale UI.
    queryClient.clear();
  }, [userId]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
        <Image
          source={require("../assets/chakiya-eats-logo.png")}
          style={{ width: 220, height: 220 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="shop-setup" options={{ headerShown: true, title: "Shop Details" }} />
            <Stack.Screen name="item/new" options={{ headerShown: true, title: "Add Item" }} />
            <Stack.Screen name="item/[id]/edit" options={{ headerShown: true, title: "Edit Item" }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
