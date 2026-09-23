import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "../../lib/api";
import { colors } from "../../lib/theme";
import type { Item, Shop } from "../../types";

export default function MenuTab() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const shopQuery = useQuery({
    queryKey: ["myShop"],
    queryFn: async () => (await api.get<Shop>("/shop/get-my")).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => (await api.get(`/item/delete/${itemId}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myShop"] }),
    onError: (error) => Alert.alert("Couldn't delete item", apiErrorMessage(error)),
  });

  const onDelete = (item: Item) => {
    Alert.alert("Delete item", `Remove "${item.name}" from your menu?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(item._id) },
    ]);
  };

  if (shopQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const items = shopQuery.data?.items ?? [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Menu</Text>
        <Pressable style={styles.addButton} onPress={() => router.push("/item/new")}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </Pressable>
      </View>

      {!items.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyText}>No menu items yet</Text>
          <Pressable style={styles.addButton} onPress={() => router.push("/item/new")}>
            <Text style={styles.addButtonText}>+ Add your first item</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.category} · {item.foodType === "veg" ? "Veg" : "Non-veg"}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                  {item.discount > 0 && <Text style={styles.itemDiscount}>{item.discount}% off</Text>}
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => router.push(`/item/${item._id}/edit`)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => onDelete(item)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: 10, padding: 24 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: colors.text },
  addButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, color: colors.muted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemImage: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.border },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.text },
  itemMeta: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: "700", color: colors.text },
  itemDiscount: { fontSize: 11, fontWeight: "700", color: colors.success },
  actions: { gap: 6 },
  actionButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: { color: colors.danger, fontSize: 12, fontWeight: "700" },
});
