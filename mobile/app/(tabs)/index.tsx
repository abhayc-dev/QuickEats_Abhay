import { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useLocationStore } from "../../store/location";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";
import type { Shop } from "../../types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function shopRating(shop: Shop) {
  const rated = shop.items.filter((i) => i.rating?.count > 0);
  if (!rated.length) return null;
  const avg = rated.reduce((sum, i) => sum + i.rating.average, 0) / rated.length;
  return Math.round(avg * 10) / 10;
}

function shopCategories(shop: Shop) {
  const seen = new Set<string>();
  for (const item of shop.items) {
    if (item.category) seen.add(item.category);
    if (seen.size === 2) break;
  }
  return Array.from(seen);
}

export default function Home() {
  const { city, address, setLocation } = useLocationStore();
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [search, setSearch] = useState("");

  const citiesQuery = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await api.get<string[]>("/shop/cities")).data,
  });

  const shopsQuery = useQuery({
    queryKey: ["shops", city],
    queryFn: async () =>
      (await api.get<Shop[]>(`/shop/get-by-city/${encodeURIComponent(city!)}`)).data,
    enabled: !!city,
  });

  const filteredShops = useMemo(() => {
    const shops = shopsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }, [shopsQuery.data, search]);

  const filteredCities = useMemo(() => {
    const cities = citiesQuery.data ?? [];
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [citiesQuery.data, citySearch]);

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location permission is required to find restaurants near you.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const detectedCity = place?.city || place?.subregion || place?.region;
      if (!detectedCity) {
        Alert.alert("Couldn't detect city", "Please pick your city from the list instead.");
        return;
      }
      setLocation({
        city: detectedCity,
        address: [place.name, place.street, place.city].filter(Boolean).join(", "),
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setPickerOpen(false);
    } catch {
      Alert.alert("Location error", "Could not fetch your current location.");
    } finally {
      setLocating(false);
    }
  };

  const selectCity = (selected: string) => {
    setLocation({
      city: selected,
      address: address || selected,
      latitude: 0,
      longitude: 0,
    });
    setCitySearch("");
    setPickerOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              {greeting()}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
            </Text>
            <Pressable style={styles.locationRow} onPress={() => setPickerOpen(true)}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.headerCity} numberOfLines={1}>
                {city ? city : "Select your city"}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </Pressable>
          </View>
        </View>

        {!!city && (
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search restaurants or dishes"
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}
      </View>

      {!city ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍔</Text>
          <Text style={styles.emptyTitle}>Where should we deliver?</Text>
          <Text style={styles.emptyText}>Choose your city to see restaurants near you</Text>
          <Pressable style={styles.primaryButton} onPress={() => setPickerOpen(true)}>
            <Text style={styles.primaryButtonText}>Select City</Text>
          </Pressable>
        </View>
      ) : shopsQuery.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />
      ) : shopsQuery.isError || !shopsQuery.data?.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyText}>No restaurants found in {city} yet.</Text>
        </View>
      ) : !filteredShops.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>No matches for "{search}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 14 }}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {filteredShops.length} restaurant{filteredShops.length === 1 ? "" : "s"} in {city}
            </Text>
          }
          renderItem={({ item }) => <ShopCard shop={item} />}
        />
      )}

      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.modalTitle}>Choose your city</Text>

          <Pressable style={styles.locateButton} onPress={useCurrentLocation} disabled={locating}>
            {locating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.locateButtonText}>📍 Use current location</Text>
            )}
          </Pressable>

          <TextInput
            style={styles.citySearchInput}
            placeholder="Search cities"
            placeholderTextColor={colors.muted}
            value={citySearch}
            onChangeText={setCitySearch}
          />

          {citiesQuery.isLoading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredCities}
              keyExtractor={(c) => c}
              renderItem={({ item }) => (
                <Pressable style={styles.cityRow} onPress={() => selectCity(item)}>
                  <Text style={styles.cityRowText}>{item}</Text>
                  {item === city && <Text style={styles.cityRowCheck}>✓</Text>}
                </Pressable>
              )}
            />
          )}

          <Pressable
            style={styles.closeButton}
            onPress={() => {
              setCitySearch("");
              setPickerOpen(false);
            }}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  const rating = shopRating(shop);
  const categories = shopCategories(shop);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/shop/${shop._id}`)}
    >
      <View>
        <Image source={{ uri: shop.image }} style={styles.cardImage} contentFit="cover" />
        {!shop.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedOverlayText}>Currently Closed</Text>
          </View>
        )}
        {rating !== null && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>★ {rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{shop.name}</Text>
        {!!categories.length && (
          <Text style={styles.cardCategories} numberOfLines={1}>
            {categories.join(" • ")}
          </Text>
        )}
        <View style={styles.cardAddressRow}>
          <Text style={styles.cardPinIcon}>📍</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {shop.address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  headerTop: { flexDirection: "row", alignItems: "center" },
  greeting: { fontSize: 13, color: colors.muted, fontWeight: "500" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  locationPin: { fontSize: 15 },
  headerCity: { fontSize: 19, fontWeight: "800", color: colors.text, maxWidth: "85%" },
  chevron: { fontSize: 13, color: colors.muted, marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  emptyText: { fontSize: 15, color: colors.muted, textAlign: "center" },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardPressed: { opacity: 0.85 },
  cardImage: { width: "100%", height: 160, backgroundColor: colors.border },
  closedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  closedOverlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    borderWidth: 1.5,
    borderColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  cardCategories: { fontSize: 12.5, color: colors.muted, marginTop: 3, fontWeight: "500" },
  cardAddressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  cardPinIcon: { fontSize: 11 },
  cardSubtitle: { fontSize: 12.5, color: colors.muted, flex: 1 },
  modal: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  modalTitle: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  locateButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  locateButtonText: { color: colors.primary, fontWeight: "700" },
  citySearchInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 8,
    color: colors.text,
  },
  cityRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityRowText: { fontSize: 16, color: colors.text },
  cityRowCheck: { fontSize: 16, color: colors.primary, fontWeight: "800" },
  closeButton: { paddingVertical: 18, alignItems: "center" },
  closeButtonText: { color: colors.muted, fontSize: 15 },
});
