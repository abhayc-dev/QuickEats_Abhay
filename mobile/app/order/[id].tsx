import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { colors } from "../../lib/theme";
import type { Order, Shop, ShopOrderStatus, User } from "../../types";

const STEPS: ShopOrderStatus[] = ["pending", "preparing", "out of delivery", "delivered"];
const STEP_LABEL: Record<ShopOrderStatus, string> = {
  pending: "Order placed",
  preparing: "Preparing your food",
  "out of delivery": "Out for delivery",
  delivered: "Delivered",
};

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.get<Order>(`/order/get-order-by-id/${id}`)).data,
    // Status changes now arrive instantly over the socket connection in the
    // root layout (see patchOrderStatus) — this is just a safety net for a
    // missed event or a dropped connection, not the primary sync path.
    refetchInterval: 60_000,
  });

  if (orderQuery.isLoading || !orderQuery.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const order = orderQuery.data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: `Order #${order._id.slice(-6).toUpperCase()}` }} />

      {order.shopOrders.map((shopOrder) => {
        const shop = typeof shopOrder.shop === "object" ? (shopOrder.shop as Shop) : null;
        const deliveryBoy =
          typeof shopOrder.assignedDeliveryBoy === "object"
            ? (shopOrder.assignedDeliveryBoy as User)
            : null;
        const stepIndex = STEPS.indexOf(shopOrder.status);

        return (
          <View key={shop?._id ?? shopOrder.shopOrderItems[0]?.name} style={styles.card}>
            <Text style={styles.shopName}>{shop?.name ?? "Restaurant"}</Text>

            <View style={styles.progressRow}>
              {STEPS.map((step, i) => (
                <View key={step} style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={[
                      styles.progressDot,
                      i <= stepIndex && styles.progressDotActive,
                    ]}
                  />
                  {i < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.progressLine,
                        i < stepIndex && styles.progressLineActive,
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.currentStatus}>{STEP_LABEL[shopOrder.status]}</Text>

            {deliveryBoy && shopOrder.status === "out of delivery" && (
              <Text style={styles.deliveryBoy}>
                Delivery partner: {deliveryBoy.fullName} · {deliveryBoy.mobile}
              </Text>
            )}

            <View style={styles.divider} />

            {shopOrder.shopOrderItems.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {item.quantity} × {item.name}
                </Text>
                <Text style={styles.itemText}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
            <View style={[styles.itemRow, { marginTop: 4 }]}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalLabel}>₹{shopOrder.subtotal}</Text>
            </View>
          </View>
        );
      })}

      <View style={styles.card}>
        <Text style={styles.shopName}>Delivery Details</Text>
        <Text style={styles.detailText}>{order.deliveryAddress.text}</Text>
        <Text style={styles.detailLabel}>
          Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
        </Text>
        <View style={[styles.itemRow, { marginTop: 10 }]}>
          <Text style={styles.subtotalLabel}>Order Total</Text>
          <Text style={styles.subtotalLabel}>₹{order.totalAmount}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  shopName: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 14 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
  },
  progressDotActive: { backgroundColor: colors.primary },
  progressLine: {
    position: "absolute",
    top: 6,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: colors.border,
  },
  progressLineActive: { backgroundColor: colors.primary },
  currentStatus: { fontSize: 14, fontWeight: "700", color: colors.primary, textAlign: "center" },
  deliveryBoy: { fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  itemText: { fontSize: 13, color: colors.text },
  subtotalLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
  detailText: { fontSize: 14, color: colors.text, marginTop: 6 },
  detailLabel: { fontSize: 13, color: colors.muted, marginTop: 10 },
});
