import { Redirect } from "expo-router";

// Browsing (Home, Shop, Cart) doesn't need an account — only placing an
// order does, gated at that point instead of on app launch.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
