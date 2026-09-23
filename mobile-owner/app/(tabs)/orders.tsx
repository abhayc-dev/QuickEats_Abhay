import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "../../lib/api";
import { colors } from "../../lib/theme";
import type { OwnerOrderRow, ShopOrderStatus } from "../../types";

const STATUS_LABEL: Record<ShopOrderStatus, string> = {
  pending: "New order",
  preparing: "Preparing",
  "out of delivery": "Out for delivery",
  delivered: "Delivered",
};

const STATUS_COLOR: Record<ShopOrderStatus, string> = {
  pending: colors.warning,
  preparing: colors.primary,
  "out of delivery": "#4285F4",
  delivered: colors.success,
};

const NEXT_ACTION: Partial<Record<ShopOrderStatus, { next: ShopOrderStatus; label: string }>> = {
  pending: { next: "preparing", label: "Start Preparing" },
  preparing: { next: "out of delivery", label: "Mark Out for Delivery" },
};

export default function OrdersTab() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["ownerOrders"],
    queryFn: async () => (await api.get<OwnerOrderRow[]>("/order/my-orders")).data,
    refetchInterval: 15_000,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, shopId, status }: { orderId: string; shopId: string; status: ShopOrderStatus }) =>
      (await api.post(`/order/update-status/${orderId}/${shopId}`, { status })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ownerOrders"] }),
    onError: (error) => Alert.alert("Couldn't update order", apiErrorMessage(error)),
  });

  if (ordersQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const orders = ordersQuery.data ?? [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {!orders.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item: order }) => {
            const so = order.shopOrders;
            const action = NEXT_ACTION[so.status];
            const thisShopId = typeof so.shop === "string" ? so.shop : so.shop._id;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.customerName}>{order.user?.fullName ?? "Customer"}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[so.status] }]}>
                    <Text style={styles.statusBadgeText}>{STATUS_LABEL[so.status]}</Text>
                  </View>
                </View>
                <Text style={styles.orderTime}>
                  {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
                </Text>

                <View style={styles.itemsBlock}>
                  {so.shopOrderItems.map((i, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemText}>{i.quantity} × {i.name}</Text>
                      <Text style={styles.itemText}>₹{i.price * i.quantity}</Text>
                    </View>
                  ))}
                  <View style={[styles.itemRow, styles.subtotalRow]}>
                    <Text style={styles.subtotalLabel}>Subtotal</Text>
                    <Text style={styles.subtotalLabel}>₹{so.subtotal}</Text>
                  </View>
                </View>

                <Text style={styles.address} numberOfLines={2}>
                  📍 {order.deliveryAddress.text}
                </Text>

                {action && (
                  <Pressable
                    style={styles.actionButton}
                    disabled={statusMutation.isPending}
                    onPress={() =>
                      statusMutation.mutate({ orderId: order._id, shopId: thisShopId, status: action.next })
                    }
                  >
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: 8 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: colors.text },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  customerName: { fontSize: 15, fontWeight: "700", color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { color: "#fff", fontSize: 11.5, fontWeight: "800" },
  orderTime: { fontSize: 12, color: colors.muted, marginTop: 4 },
  itemsBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  itemText: { fontSize: 13, color: colors.text },
  subtotalRow: { marginTop: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 },
  subtotalLabel: { fontSize: 13, fontWeight: "800", color: colors.text },
  address: { fontSize: 12, color: colors.muted, marginTop: 10 },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  actionButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
