import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../lib/theme";
import { useAuthStore } from "../../store/auth";

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>;
}

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // This app has no guest mode — every tab assumes an authenticated owner.
    // Catches any sign-out path that doesn't explicitly navigate away, e.g.
    // the API client's own 401 interceptor.
    if (!user) {
      router.replace("/(auth)/sign-in");
    }
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => <TabIcon symbol="🧾" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ focused }) => <TabIcon symbol="🍽️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Shop",
          tabBarIcon: ({ focused }) => <TabIcon symbol="🏪" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
