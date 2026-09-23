import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";
import type { Order, Shop } from "../../types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Order placed",
  preparing: "Preparing",
  "out of delivery": "Out for delivery",
  delivered: "Delivered",
};

export default function Orders() {
  const user = useAuthStore((s) => s.user);
  const ordersQuery = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => (await api.get<Order[]>("/order/my-orders")).data,
    // Only ever fetch this as a "user" role — the root layout's auto-sign-out
    // guard clears a wrong-role session, but that runs in an effect *after*
    // this render, so it can't stop a bad response from being requested (or
    // an already-cached one from being shown) on this exact render.
    enabled: !!user && user.role === "user",
  });

  // The backend returns a differently-shaped response for non-"user" roles
  // (shopOrders is a single object instead of an array — see
  // backend/controllers/order.controllers.js getMyOrders). Filtering these
  // out here means a stale cache entry or a render that beats the
  // auto-sign-out effect can never crash this screen, only show fewer rows
  // until the sign-out completes.
  const orders = (ordersQuery.data ?? []).filter((o) => Array.isArray(o.shopOrders));

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🧾</Text>
        <Text style={styles.emptyTitle}>Sign in to see your orders</Text>
        <Pressable
          style={styles.signInButton}
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (ordersQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You haven't placed any orders yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o._id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => {
          const shopNames = item.shopOrders
            .map((so) => (typeof so.shop === "object" ? (so.shop as Shop).name : "Restaurant"))
            .join(", ");
          const status = item.shopOrders[0]?.status ?? "pending";
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/order/${item._id}`)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {shopNames}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString()} · ₹{item.totalAmount}
                </Text>
                <Text style={styles.status}>{STATUS_LABEL[status] ?? status}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, paddingHorizontal: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    paddingHorizontal: 32,
    gap: 6,
  },
  emptyText: { fontSize: 15, color: colors.muted },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 14 },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  signInButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shopName: { fontSize: 15, fontWeight: "700", color: colors.text },
  date: { fontSize: 13, color: colors.muted, marginTop: 4 },
  status: { fontSize: 13, color: colors.primary, fontWeight: "700", marginTop: 4 },
  chevron: { fontSize: 24, color: colors.muted },
});
