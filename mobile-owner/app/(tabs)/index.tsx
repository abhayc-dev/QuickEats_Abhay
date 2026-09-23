import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert, Switch } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";
import type { Shop } from "../../types";

export default function ShopTab() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuthStore();
  const queryClient = useQueryClient();

  const shopQuery = useQuery({
    queryKey: ["myShop"],
    queryFn: async () => (await api.get<Shop>("/shop/get-my")).data,
  });

  const toggleMutation = useMutation({
    mutationFn: async () => (await api.patch("/shop/toggle-status")).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myShop"] }),
    onError: (error) => Alert.alert("Couldn't update status", apiErrorMessage(error)),
  });

  const onSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  if (shopQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const shop = shopQuery.data;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>My Shop</Text>
      </View>

      {shop && (
        <>
          <Image source={{ uri: shop.image }} style={styles.banner} contentFit="cover" />
          <View style={styles.card}>
            <Text style={styles.shopName}>{shop.name}</Text>
            <Text style={styles.shopAddress}>
              {shop.address}, {shop.city}, {shop.state}
            </Text>

            <View style={styles.statusRow}>
              <View>
                <Text style={styles.statusLabel}>Accepting orders</Text>
                <Text style={[styles.statusValue, { color: shop.isOpen ? colors.success : colors.danger }]}>
                  {shop.isOpen ? "Open" : "Closed"}
                </Text>
              </View>
              <Switch
                value={shop.isOpen}
                onValueChange={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                trackColor={{ false: colors.border, true: "#B7E4C7" }}
                thumbColor={shop.isOpen ? colors.success : "#fff"}
              />
            </View>
          </View>

          <Pressable style={styles.menuRow} onPress={() => router.push("/shop-setup")}>
            <Text style={styles.menuRowText}>Edit shop details</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </>
      )}

      <View style={styles.card}>
        <Text style={styles.ownerLabel}>Signed in as</Text>
        <Text style={styles.ownerName}>{user?.fullName}</Text>
        <Text style={styles.ownerEmail}>{user?.email}</Text>
      </View>

      <Pressable style={styles.signOutButton} onPress={onSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 14, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: "800", color: colors.text },
  banner: { width: "100%", height: 150, backgroundColor: colors.border },
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  shopName: { fontSize: 18, fontWeight: "800", color: colors.text },
  shopAddress: { fontSize: 13, color: colors.muted, marginTop: 4 },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusLabel: { fontSize: 13, color: colors.muted },
  statusValue: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuRowText: { fontSize: 15, fontWeight: "600", color: colors.text },
  chevron: { fontSize: 20, color: colors.muted },
  ownerLabel: { fontSize: 12, color: colors.muted },
  ownerName: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 2 },
  ownerEmail: { fontSize: 13, color: colors.muted, marginTop: 2 },
  signOutButton: {
    margin: 16,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: { color: colors.danger, fontWeight: "700" },
});
