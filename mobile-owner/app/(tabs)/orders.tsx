import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
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

const STATUS_FILTERS: { key: "all" | ShopOrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "out of delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function OrdersTab() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | ShopOrderStatus>("all");
  const [search, setSearch] = useState("");

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

  const orders = ordersQuery.data ?? [];
  const q = search.trim().toLowerCase();
  // useMemo must run on every render regardless of the loading early-return
  // below — hoisting it above that return, like every other hook here, so
  // the hook count stays consistent between renders (otherwise React throws
  // "Rendered more hooks than during the previous render").
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const statusOk = statusFilter === "all" || o.shopOrders.status === statusFilter;
      const nameOk = !q || (o.user?.fullName ?? "").toLowerCase().includes(q);
      return statusOk && nameOk;
    });
  }, [orders, statusFilter, q]);

  if (ordersQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // update-status has a real network round trip before the order flips to
  // its new status, so without this the button just sits there looking
  // unresponsive for that stretch. Track which order is in flight (not just
  // a boolean) so only that row shows the spinner — the others stay legible.
  const pendingOrderId = statusMutation.isPending ? statusMutation.variables?.orderId : undefined;
  const hasActiveFilters = statusFilter !== "all" || !!q;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Orders</Text>

        {!!orders.length && (
          <>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by customer name"
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={STATUS_FILTERS}
              keyExtractor={(f) => f.key}
              contentContainerStyle={{ gap: 8 }}
              style={{ marginTop: 12 }}
              renderItem={({ item: f }) => (
                <Pressable
                  style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
                  onPress={() => setStatusFilter(f.key)}
                >
                  <Text
                    style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              )}
            />
          </>
        )}
      </View>

      {!orders.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : !filteredOrders.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>No orders match your filters.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListHeaderComponent={
            hasActiveFilters ? (
              <Text style={styles.resultsCount}>
                {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"} matching
              </Text>
            ) : null
          }
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
                    style={[
                      styles.actionButton,
                      statusMutation.isPending && styles.actionButtonDisabled,
                    ]}
                    disabled={statusMutation.isPending}
                    onPress={() =>
                      statusMutation.mutate({ orderId: order._id, shopId: thisShopId, status: action.next })
                    }
                  >
                    {order._id === pendingOrderId ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>{action.label}</Text>
                    )}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    marginTop: 14,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, fontWeight: "600", color: colors.text },
  filterChipTextActive: { color: "#fff", fontWeight: "700" },
  resultsCount: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
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
  actionButtonDisabled: { opacity: 0.6 },
});
