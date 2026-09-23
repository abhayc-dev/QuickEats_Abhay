import { useEffect } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../lib/theme";
import type { OwnerOrderRow } from "../types";

const AUTO_DISMISS_MS = 12_000;

export default function NewOrderModal({
  order,
  onView,
  onDismiss,
}: {
  order: OwnerOrderRow | null;
  onView: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!order) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [order]);

  if (!order) return null;
  const so = order.shopOrders;
  const itemsSummary = so.shopOrderItems.map((i) => `${i.quantity}× ${i.name}`).join(", ");

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.bell}>🔔</Text>
          <Text style={styles.title}>New Order Received!</Text>
          <Text style={styles.customer}>{order.user?.fullName ?? "Customer"}</Text>
          <Text style={styles.items} numberOfLines={3}>
            {itemsSummary}
          </Text>
          <Text style={styles.subtotal}>₹{so.subtotal}</Text>
          <Text style={styles.paymentMethod}>
            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
          </Text>

          <Pressable style={styles.viewButton} onPress={onView}>
            <Text style={styles.viewButtonText}>View Order</Text>
          </Pressable>
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    alignItems: "center",
  },
  bell: { fontSize: 42, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  customer: { fontSize: 15, fontWeight: "600", color: colors.text, marginTop: 10 },
  items: { fontSize: 13.5, color: colors.muted, textAlign: "center", marginTop: 6, paddingHorizontal: 8 },
  subtotal: { fontSize: 24, fontWeight: "800", color: colors.primary, marginTop: 12 },
  paymentMethod: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  viewButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  viewButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dismissButton: { paddingVertical: 14, alignItems: "center", width: "100%" },
  dismissButtonText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
});
