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
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useLocationStore } from "../../store/location";
import { useCartStore } from "../../store/cart";
import { colors } from "../../lib/theme";
import type { Item, Shop } from "../../types";

function shopRating(shop: Shop) {
  const rated = shop.items.filter((i) => i.rating?.count > 0);
  if (!rated.length) return null;
  const avg = rated.reduce((sum, i) => sum + i.rating.average, 0) / rated.length;
  const totalReviews = rated.reduce((sum, i) => sum + i.rating.count, 0);
  return { avg: Math.round(avg * 10) / 10, totalReviews };
}

export default function ShopDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const city = useLocationStore((s) => s.city);
  const cart = useCartStore();
  const insets = useSafeAreaInsets();

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

  const rating = shopRating(shop);
  const quantityInCart = (itemId: string) =>
    cart.items.find((i) => i.id === itemId)?.quantity ?? 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View>
              <Image source={{ uri: shop.image }} style={styles.banner} contentFit="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.75)"]}
                style={styles.bannerGradient}
              />
              <View style={[styles.bannerContent, { paddingBottom: 16 }]}>
                <Text style={styles.name}>{shop.name}</Text>
                <View style={styles.bannerMetaRow}>
                  {rating && (
                    <View style={styles.ratingPill}>
                      <Text style={styles.ratingPillText}>★ {rating.avg}</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.statusText,
                      { color: shop.isOpen ? "#8FE38F" : "#FF9B9B" },
                    ]}
                  >
                    {shop.isOpen ? "Open now" : "Currently closed"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.address}>📍 {shop.address}, {shop.city}</Text>
              {rating && (
                <Text style={styles.reviewCount}>{rating.totalReviews} ratings</Text>
              )}
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(c) => c}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}
              renderItem={({ item: c }) => (
                <Pressable
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              )}
            />
          </>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <MenuItemRow
              item={item}
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
          </View>
        )}
      />

      <Pressable
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </Pressable>

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
        <Text style={styles.itemName}>{item.name}</Text>

        {item.rating?.count > 0 && (
          <Text style={styles.itemRating}>
            ★ {item.rating.average.toFixed(1)} ({item.rating.count})
          </Text>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
          <Text style={styles.itemPrice}>₹{finalPrice}</Text>
          {item.discount > 0 && <Text style={styles.itemOldPrice}>₹{item.price}</Text>}
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{item.discount}% OFF</Text>
            </View>
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
  banner: { width: "100%", height: 240, backgroundColor: colors.border },
  bannerGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 130 },
  bannerContent: { position: "absolute", left: 16, right: 16, bottom: 0 },
  name: { fontSize: 23, fontWeight: "800", color: "#fff" },
  bannerMetaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  ratingPill: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingPillText: { color: "#fff", fontSize: 12.5, fontWeight: "800" },
  statusText: { fontSize: 13, fontWeight: "700" },
  backButton: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: -2 },
  info: {
    padding: 16,
    paddingBottom: 4,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  address: { fontSize: 13, color: colors.muted },
  reviewCount: { fontSize: 12, color: colors.muted, marginTop: 6 },
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
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  foodTypeDot: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  foodTypeInner: { width: 7, height: 7, borderRadius: 4 },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.text },
  itemRating: { fontSize: 11.5, color: colors.success, fontWeight: "700", marginTop: 3 },
  itemPrice: { fontSize: 14, fontWeight: "700", color: colors.text },
  itemOldPrice: { fontSize: 12, color: colors.muted, textDecorationLine: "line-through" },
  discountBadge: {
    backgroundColor: "#FFF1EC",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: { fontSize: 10.5, fontWeight: "800", color: colors.primaryDark },
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cartBarText: { color: "#fff", fontWeight: "700" },
});
