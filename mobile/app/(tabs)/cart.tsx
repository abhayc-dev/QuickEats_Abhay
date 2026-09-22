import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCartStore } from "../../store/cart";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";

export default function Cart() {
  const cart = useCartStore();
  const user = useAuthStore((s) => s.user);

  const onCheckout = () => {
    if (!user) {
      router.push({ pathname: "/(auth)/sign-in", params: { redirect: "/checkout" } });
      return;
    }
    router.push("/checkout");
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Pressable style={styles.browseButton} onPress={() => router.push("/(tabs)")}>
          <Text style={styles.browseButtonText}>Browse restaurants</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      <Text style={styles.shopName}>{cart.items[0].shopName}</Text>

      <FlatList
        data={cart.items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => cart.updateQuantity(item.id, item.quantity - 1)}
              >
                <Text style={styles.stepperText}>−</Text>
              </Pressable>
              <Text style={styles.stepperCount}>{item.quantity}</Text>
              <Pressable
                style={styles.stepperButton}
                onPress={() => cart.updateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{cart.totalAmount()}</Text>
        </View>
        <Pressable style={styles.checkoutButton} onPress={onCheckout}>
          <Text style={styles.checkoutButtonText}>
            {user ? "Proceed to Checkout" : "Sign In to Checkout"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, paddingHorizontal: 16 },
  shopName: { fontSize: 14, color: colors.muted, paddingHorizontal: 16, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: 56, height: 56, borderRadius: 10, backgroundColor: colors.border },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.text },
  itemPrice: { fontSize: 13, color: colors.muted, marginTop: 2 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  stepperButton: { paddingHorizontal: 10, paddingVertical: 8 },
  stepperText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  stepperCount: { color: "#fff", fontWeight: "800", minWidth: 18, textAlign: "center" },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  totalLabel: { fontSize: 16, color: colors.muted },
  totalValue: { fontSize: 20, fontWeight: "800", color: colors.text },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  checkoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.bg },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: colors.muted },
  browseButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  browseButtonText: { color: "#fff", fontWeight: "700" },
});
