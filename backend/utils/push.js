// Sends notifications through Expo's push service so an owner still gets
// alerted (sound + heads-up notification) when their app is backgrounded or
// fully closed — the socket-based "newOrder" event only reaches an app that
// is open and connected.
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_TOKENS_PER_REQUEST = 100;

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Never let a push failure break the caller's request (placing an order
// must still succeed even if Expo's push service is down or a token is
// stale) — errors are logged and swallowed.
export async function sendPushNotifications(tokens, { title, body, data }) {
  const validTokens = (tokens || []).filter(
    (t) => typeof t === "string" && t.startsWith("ExponentPushToken")
  );
  if (!validTokens.length) return;

  const messages = validTokens.map((to) => ({
    to,
    title,
    body,
    data,
    sound: "default",
    priority: "high",
    channelId: "orders",
  }));

  try {
    for (const batch of chunk(messages, MAX_TOKENS_PER_REQUEST)) {
      await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(batch),
      });
    }
  } catch (error) {
    console.error("Expo push send error:", error.message);
  }
}
