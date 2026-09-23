import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import { colors } from "../lib/theme";

type Destination = "loading" | "sign-in" | "shop-setup" | "tabs";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const [destination, setDestination] = useState<Destination>("loading");

  useEffect(() => {
    if (!user) {
      setDestination("sign-in");
      return;
    }
    let cancelled = false;
    api
      .get("/shop/get-my")
      .then(() => {
        if (!cancelled) setDestination("tabs");
      })
      .catch(() => {
        if (!cancelled) setDestination("shop-setup");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (destination === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (destination === "sign-in") return <Redirect href="/(auth)/sign-in" />;
  if (destination === "shop-setup") return <Redirect href="/shop-setup" />;
  return <Redirect href="/(tabs)" />;
}
