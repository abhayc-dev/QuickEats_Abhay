import { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useLocationStore } from "../../store/location";
import { useCartStore } from "../../store/cart";
import { colors } from "../../lib/theme";
import type { Item, Shop } from "../../types";

export default function ShopDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const city = useLocationStore((s) => s.city);
  const cart = useCartStore();

  const shopsQuery = useQuery({
    queryKey: ["shops", city],
    queryFn: async () =>
      (await api.get<Shop[]>(`/shop/get-by-city/${encodeURIComponent(city!)}`)).data,
    enabled: !!city,
  });

  const shop = shopsQuery.data?.find((s) => s._id === id);
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(() => {
    if (!shop) return ["All"];
    const set = new Set(shop.items.map((i) => i.category));
    return ["All", ...Array.from(set)];
  }, [shop]);

  const items = useMemo(() => {
    if (!shop) return [];
    return category === "All" ? shop.items : shop.items.filter((i) => i.category === category);
  }, [shop, category]);

  if (shopsQuery.isLoading || !shop) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const quantityInCart = (itemId: string) =>
    cart.items.find((i) => i.id === itemId)?.quantity ?? 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: shop.name }} />

      <Image source={{ uri: shop.image }} style={styles.banner} contentFit="cover" />
      <View style={styles.info}>
        <Text style={styles.name}>{shop.name}</Text>
        <Text style={styles.address}>{shop.address}, {shop.city}</Text>
        <Text style={[styles.status, { color: shop.isOpen ? colors.success : colors.danger }]}>
          {shop.isOpen ? "Open now" : "Currently closed"}
        </Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
        renderItem={({ item: c }) => (
          <Pressable
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        )}
      />

      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <MenuItemRow
            item={item}
            shop={shop}
            quantity={quantityInCart(item._id)}
            disabled={!shop.isOpen}
            onAdd={() =>
              cart.addItem({
                id: item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image,
                shop: shop._id,
                shopName: shop.name,
              })
            }
            onIncrement={() => cart.updateQuantity(item._id, quantityInCart(item._id) + 1)}
            onDecrement={() => cart.updateQuantity(item._id, quantityInCart(item._id) - 1)}
          />
        )}
      />

      {cart.items.length > 0 && (
        <Pressable style={styles.cartBar} onPress={() => router.push("/(tabs)/cart")}>
          <Text style={styles.cartBarText}>
            {cart.items.reduce((n, i) => n + i.quantity, 0)} items · ₹{cart.totalAmount()}
          </Text>
          <Text style={styles.cartBarText}>View Cart →</Text>
        </Pressable>
      )}
    </View>
  );
}

function MenuItemRow({
  item,
  quantity,
  disabled,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  item: Item;
  shop: Shop;
  quantity: number;
  disabled: boolean;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const finalPrice = item.discount
    ? Math.round(item.price - (item.price * item.discount) / 100)
    : item.price;

  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <View style={styles.foodTypeRow}>
          <View
            style={[
              styles.foodTypeDot,
              { borderColor: item.foodType === "veg" ? colors.success : colors.danger },
            ]}
          >
            <View
              style={[
                styles.foodTypeInner,
                { backgroundColor: item.foodType === "veg" ? colors.success : colors.danger },
              ]}
            />
          </View>
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
          <Text style={styles.itemPrice}>₹{finalPrice}</Text>
          {item.discount > 0 && (
            <Text style={styles.itemOldPrice}>₹{item.price}</Text>
          )}
        </View>
        {item.description ? (
          <Text style={styles.itemDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <View style={{ alignItems: "center" }}>
        <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
        {quantity === 0 ? (
          <Pressable
            style={[styles.addButton, disabled && styles.addButtonDisabled]}
            onPress={onAdd}
            disabled={disabled}
          >
            <Text style={styles.addButtonText}>ADD</Text>
          </Pressable>
        ) : (
          <View style={styles.stepper}>
            <Pressable onPress={onDecrement} style={styles.stepperButton}>
              <Text style={styles.stepperText}>−</Text>
            </Pressable>
            <Text style={styles.stepperCount}>{quantity}</Text>
            <Pressable onPress={onIncrement} style={styles.stepperButton}>
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  banner: { width: "100%", height: 160, backgroundColor: colors.border },
  info: { padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  address: { fontSize: 13, color: colors.muted, marginTop: 4 },
  status: { fontSize: 13, fontWeight: "700", marginTop: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  row: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodTypeRow: { marginBottom: 4 },
  foodTypeDot: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  foodTypeInner: { width: 7, height: 7, borderRadius: 4 },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.text },
  itemPrice: { fontSize: 14, fontWeight: "700", color: colors.text },
  itemOldPrice: { fontSize: 12, color: colors.muted, textDecorationLine: "line-through" },
  itemDesc: { fontSize: 12, color: colors.muted, marginTop: 4 },
  itemImage: { width: 96, height: 80, borderRadius: 10, backgroundColor: colors.border },
  addButton: {
    marginTop: -14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  addButtonDisabled: { borderColor: colors.border, opacity: 0.5 },
  addButtonText: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  stepper: {
    marginTop: -14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  stepperButton: { paddingHorizontal: 8, paddingVertical: 8 },
  stepperText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  stepperCount: { color: "#fff", fontWeight: "800", minWidth: 16, textAlign: "center" },
  cartBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cartBarText: { color: "#fff", fontWeight: "700" },
});
