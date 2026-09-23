import { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { useCartStore } from "../store/cart";
import { useLocationStore } from "../store/location";

// Keep the native splash (configured in app.json, same logo) up until we
// explicitly hide it below, so there's no blank/spinner flash between the
// native splash and our own branded loading view.
SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_MS = 1100;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateCart = useCartStore((s) => s.hydrate);
  const hydrateLocation = useLocationStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hand off from the native splash to this same-logo JS view immediately;
    // the minimum delay below keeps the logo on screen a moment even when
    // hydration (reading a few local storage keys) finishes near-instantly.
    SplashScreen.hideAsync();
    const start = Date.now();
    Promise.all([hydrateAuth(), hydrateCart(), hydrateLocation()]).finally(() => {
      const remaining = MIN_SPLASH_MS - (Date.now() - start);
      setTimeout(() => setReady(true), Math.max(0, remaining));
    });
  }, []);

  useEffect(() => {
    // Without this, signing out and a different account signing in on the
    // same device (or in dev, Fast Refresh across accounts) would show the
    // previous account's cached orders/profile data until every query
    // happened to refetch — a real cross-account data leak, not just a
    // stale UI. Guest browsing data (shops/items) is harmless to keep, but
    // clearing everything on any auth change is simplest and safest.
    queryClient.clear();
  }, [user?._id]);

  useEffect(() => {
    // This app only handles the "user" role — sign-in already rejects other
    // roles going forward, but a session from before that check (or a token
    // whose role changed server-side) can still be sitting in SecureStore.
    // The backend's /order/my-orders returns a differently-shaped response
    // for owner accounts (a single shopOrders object instead of an array),
    // which crashes every screen that assumes the customer shape. Signing
    // out here rather than trying to render owner-shaped data as if it were
    // a customer's own orders.
    if (user && user.role !== "user") {
      signOut();
    }
  }, [user]);

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
            <Stack.Screen name="shop/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: true, title: "Checkout" }} />
            <Stack.Screen name="order/[id]" options={{ headerShown: true, title: "Order" }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
