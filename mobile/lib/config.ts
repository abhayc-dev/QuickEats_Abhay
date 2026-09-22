// Defaults to the deployed backend so the app works out of the box on a
// physical device or simulator without any local server running.
// Override by setting EXPO_PUBLIC_API_URL in mobile/.env (e.g. to your LAN IP
// like http://192.168.1.10:8000 when testing against a local backend).
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://abhay-food-delivery.onrender.com";

// From Firebase Console -> Authentication -> Sign-in method -> Google ->
// "Web SDK configuration" client ID (ends in .apps.googleusercontent.com).
// Required for Google Sign-In; the button shows a clear error until this is set.
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";
