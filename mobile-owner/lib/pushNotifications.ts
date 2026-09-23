import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// New-order alerts need to reach the owner even when the app is
// backgrounded or fully closed — the socket-based "newOrder" event (see
// _layout.tsx's OwnerRealtimeBridge) only reaches an app that's open and
// connected. This file registers the device for Expo push notifications and
// configures a high-priority Android channel so those pushes show as a
// heads-up banner with sound, not a silent tray notification.

export const ORDERS_CHANNEL_ID = "orders";

// Keep showing the OS banner/sound even while the app is in the foreground.
// The in-app popup (NewOrderModal) is the primary UX for that case, but
// there's a brief window before the socket event/modal render where this is
// the only signal, so letting it through is more reliable than suppressing it.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ORDERS_CHANNEL_ID, {
    name: "New orders",
    importance: Notifications.AndroidImportance.MAX,
    sound: "notification.mp3",
    vibrationPattern: [0, 400, 200, 400],
    lightColor: "#FF4C29",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

// Requests permission, registers the high-priority Android channel, and
// returns an Expo push token to hand to the backend — or null if push isn't
// available right now (emulator/simulator, permission denied, or no EAS
// project id configured yet). Every failure path is swallowed rather than
// thrown: a missing push token should never block sign-in or app usage.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  await ensureAndroidChannel();

  if (!Device.isDevice) {
    // Physical-device push tokens generally aren't issued on
    // simulators/emulators without Google Play services configured.
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn(
      "[push] No EAS project id configured — run `eas init` so push notifications can be issued a token."
    );
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (error) {
    console.warn("[push] Failed to get Expo push token:", error);
    return null;
  }
}
