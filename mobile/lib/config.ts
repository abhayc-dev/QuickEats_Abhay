// Defaults to the deployed backend so the app works out of the box on a
// physical device or simulator without any local server running.
// Override by setting EXPO_PUBLIC_API_URL in mobile/.env (e.g. to your LAN IP
// like http://192.168.1.10:8000 when testing against a local backend).
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://abhay-food-delivery.onrender.com";
