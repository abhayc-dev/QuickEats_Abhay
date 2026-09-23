import { useEffect, useRef, useState } from "react";
import { View, Image, Vibration } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { getSocket, disconnectSocket } from "../lib/socket";
import { api } from "../lib/api";
import { registerForPushNotificationsAsync } from "../lib/pushNotifications";
import NewOrderModal from "../components/NewOrderModal";
import type { OwnerOrderRow } from "../types";

SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_MS = 1100;
// Double buzz so it's distinguishable from a plain incoming-message vibration.
const NEW_ORDER_VIBRATION_PATTERN = [0, 400, 200, 400];

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function OwnerRealtimeBridge() {
  const user = useAuthStore((s) => s.user);
  const [incomingOrder, setIncomingOrder] = useState<OwnerOrderRow | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();

    // Re-emitted on every connect (including auto-reconnects), matching the
    // web app's pattern — the server only routes "newOrder" to this socket
    // once it's joined a room named after the owner's own user id.
    const onConnect = () => socket.emit("identity", { userId: user._id });

    const onNewOrder = (payload: OwnerOrderRow) => {
      setIncomingOrder(payload);
      Vibration.vibrate(NEW_ORDER_VIBRATION_PATTERN);
      try {
        if (!playerRef.current) {
          playerRef.current = createAudioPlayer(require("../assets/notification.mp3"));
        }
        playerRef.current.seekTo(0);
        playerRef.current.play();
      } catch {
        // Non-fatal — a missed sound shouldn't block the popup/vibration.
      }
      queryClient.invalidateQueries({ queryKey: ["ownerOrders"] });
    };

    socket.on("connect", onConnect);
    socket.on("newOrder", onNewOrder);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("newOrder", onNewOrder);
    };
  }, [user?._id]);

  useEffect(() => {
    return () => {
      playerRef.current?.release();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    // Fire-and-forget: registerForPushNotificationsAsync already swallows
    // every failure (denied permission, no EAS project id, simulator), so
    // there's nothing to await or branch on here beyond "did we get a token".
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        api.post("/user/register-push-token", { token }).catch(() => {
          // Non-fatal — worst case this device just doesn't get pushes
          // until the next successful registration (e.g. next app open).
        });
      }
    });
  }, [user?._id]);

  useEffect(() => {
    // A tap on the OS notification (app backgrounded or cold-started from
    // it) should land the owner straight on Orders, same as tapping "View
    // Order" in the in-app popup.
    const goToOrders = () => router.push("/(tabs)/orders");

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification.request.content.data?.type === "newOrder") {
        goToOrders();
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.content.data?.type === "newOrder") {
        goToOrders();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <NewOrderModal
      order={incomingOrder}
      onDismiss={() => setIncomingOrder(null)}
      onView={() => {
        setIncomingOrder(null);
        router.push("/(tabs)/orders");
      }}
    />
  );
}

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
          <OwnerRealtimeBridge />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
