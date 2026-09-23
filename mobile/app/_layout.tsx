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
import { getSocket, disconnectSocket } from "../lib/socket";
import type { Order, ShopOrderStatus } from "../types";

// Keep the native splash (configured in app.json, same logo) up until we
// explicitly hide it below, so there's no blank/spinner flash between the
// native splash and our own branded loading view.
SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_MS = 1100;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function shopIdOf(so: { shop: { _id: string } | string }) {
  return typeof so.shop === "string" ? so.shop : so.shop._id;
}

// Patches both the order-detail cache and the orders-list cache directly
// (no refetch) so a status change from the owner shows up the instant the
// socket event arrives, rather than waiting on the next poll.
function patchOrderStatus(orderId: string, shopId: string, status: ShopOrderStatus) {
  queryClient.setQueryData<Order>(["order", orderId], (old) => {
    if (!old || !Array.isArray(old.shopOrders)) return old;
    return {
      ...old,
      shopOrders: old.shopOrders.map((so) =>
        shopIdOf(so) === shopId ? { ...so, status } : so
      ),
    };
  });
  queryClient.setQueryData<Order[]>(["myOrders"], (old) => {
    if (!old) return old;
    return old.map((o) =>
      o._id === orderId && Array.isArray(o.shopOrders)
        ? {
            ...o,
            shopOrders: o.shopOrders.map((so) =>
              shopIdOf(so) === shopId ? { ...so, status } : so
            ),
          }
        : o
    );
  });
}

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

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    // Re-emitted on every connect (including auto-reconnects) — the server
    // only routes "update-status" to this socket once it's joined a room
    // named after this customer's own user id, per backend/socket.js.
    const onConnect = () => socket.emit("identity", { userId: user._id });
    const onStatusUpdate = ({
      orderId,
      shopId,
      status,
    }: {
      orderId: string;
      shopId: string;
      status: ShopOrderStatus;
    }) => patchOrderStatus(orderId, shopId, status);

    socket.on("connect", onConnect);
    socket.on("update-status", onStatusUpdate);
    socket.on("orderDelivered", onStatusUpdate);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("update-status", onStatusUpdate);
      socket.off("orderDelivered", onStatusUpdate);
    };
  }, [user?._id]);

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
            <Stack.Screen name="order-placed" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="order/[id]" options={{ headerShown: true, title: "Order" }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
