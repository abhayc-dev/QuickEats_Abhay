import { useMemo, useRef, useState } from "react";
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
  Switch,
  RefreshControl,
  ScrollView,
  Animated,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
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
import type { Item, Shop } from "../../types";

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
  const [vegOnly, setVegOnly] = useState(false);
  const [category, setCategory] = useState("All");
  const [locationRowHeight, setLocationRowHeight] = useState(0);

  // Zomato-style collapsing header: the greeting/location row slides away
  // as soon as the list scrolls down, and comes right back on the first
  // upward scroll — direction-based, not just "past some offset", so it
  // reacts the moment the user reverses their swipe.
  const locationAnim = useRef(new Animated.Value(0)).current; // 0 = shown, 1 = hidden
  const lastScrollY = useRef(0);
  const hiddenRef = useRef(false);

  const setLocationHidden = (hidden: boolean) => {
    if (hiddenRef.current === hidden) return;
    hiddenRef.current = hidden;
    Animated.timing(locationAnim, {
      toValue: hidden ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const onListScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = Math.max(0, e.nativeEvent.contentOffset.y);
    const diff = y - lastScrollY.current;
    if (y < 20) {
      setLocationHidden(false);
    } else if (diff > 6) {
      setLocationHidden(true);
    } else if (diff < -6) {
      setLocationHidden(false);
    }
    lastScrollY.current = y;
  };

  const citiesQuery = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await api.get<string[]>("/shop/cities")).data,
  });

  const shopsQuery = useQuery({
    queryKey: ["shops", city],
    queryFn: async () =>
      (await api.get<Shop[]>(`/shop/get-by-city/${encodeURIComponent(city!)}`)).data,
    enabled: !!city,
    // Tab screens stay mounted in Expo Router, so without this a newly
    // added restaurant/item would only show up once the 30s staleTime
    // happened to line up with some other refetch trigger. Pull-to-refresh
    // (below) covers the "I want it now" case; this covers "I forgot to".
    refetchInterval: 20_000,
  });

  const refreshing = shopsQuery.isRefetching || citiesQuery.isRefetching;
  const onRefresh = () => {
    shopsQuery.refetch();
    citiesQuery.refetch();
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const shop of shopsQuery.data ?? []) {
      for (const item of shop.items) set.add(item.category);
    }
    return ["All", ...Array.from(set).sort()];
  }, [shopsQuery.data]);

  // One representative photo per category, pulled straight from a real menu
  // item in that category (first one found) — so "Burgers" shows an actual
  // burger from the shop that added it, not a stock/fabricated image.
  const categoryThumbnails = useMemo(() => {
    const map: Record<string, string> = {};
    for (const shop of shopsQuery.data ?? []) {
      for (const item of shop.items) {
        if (item.category && item.image && !map[item.category]) {
          map[item.category] = item.image;
        }
      }
    }
    return map;
  }, [shopsQuery.data]);

  const q = search.trim().toLowerCase();

  const itemMatchesFilters = (item: Item) =>
    (category === "All" || item.category === category) &&
    (!vegOnly || item.foodType === "veg") &&
    (!q || item.name.toLowerCase().includes(q));

  const filteredShops = useMemo(() => {
    const shops = shopsQuery.data ?? [];
    return shops.filter((shop) => {
      if (shop.items.some(itemMatchesFilters)) return true;
      // shop name matches the search, and it has at least one item that
      // still satisfies the category/veg filters (ignoring the text search)
      if (q && shop.name.toLowerCase().includes(q)) {
        return shop.items.some(
          (i) =>
            (category === "All" || i.category === category) &&
            (!vegOnly || i.foodType === "veg")
        );
      }
      return false;
    });
  }, [shopsQuery.data, q, category, vegOnly]);

  const filteredItems = useMemo(() => {
    const shops = shopsQuery.data ?? [];
    const result: { item: Item; shop: Shop }[] = [];
    for (const shop of shops) {
      for (const item of shop.items) {
        if (itemMatchesFilters(item)) result.push({ item, shop });
      }
    }
    return result;
  }, [shopsQuery.data, q, category, vegOnly]);

  const filteredCities = useMemo(() => {
    const cities = citiesQuery.data ?? [];
    const cq = citySearch.trim().toLowerCase();
    if (!cq) return cities;
    return cities.filter((c) => c.toLowerCase().includes(cq));
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
    setCategory("All");
    setPickerOpen(false);
  };

  const onMicPress = () => {
    Alert.alert(
      "Voice search unavailable",
      "Voice search needs a custom dev build — speech recognition isn't available in the Expo Go preview."
    );
  };

  const hasActiveFilters = !!q || category !== "All" || vegOnly;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Animated.View
          style={[
            styles.headerTop,
            locationRowHeight
              ? {
                  height: locationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [locationRowHeight, 0],
                  }),
                }
              : null,
            { opacity: locationAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
            { overflow: "hidden" },
          ]}
        >
          <View
            style={{ flex: 1 }}
            onLayout={(e) => {
              if (!locationRowHeight) setLocationRowHeight(e.nativeEvent.layout.height);
            }}
          >
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
        </Animated.View>

        {!!city && (
          <>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search restaurants or dishes"
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
              />
              <Pressable style={styles.micButton} onPress={onMicPress} hitSlop={8}>
                <Text style={styles.micIcon}>🎤</Text>
              </Pressable>
            </View>

            <View style={styles.vegRow}>
              <View style={styles.vegLabelRow}>
                <View style={[styles.vegDotOuter, { borderColor: colors.success }]}>
                  <View style={[styles.vegDotInner, { backgroundColor: colors.success }]} />
                </View>
                <Text style={styles.vegLabel}>Veg Mode</Text>
              </View>
              <Switch
                value={vegOnly}
                onValueChange={setVegOnly}
                trackColor={{ false: colors.border, true: "#B7E4C7" }}
                thumbColor={vegOnly ? colors.success : "#fff"}
              />
            </View>

            {categories.length > 1 && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(c) => c}
                contentContainerStyle={{ gap: 16, paddingRight: 4 }}
                renderItem={({ item: c }) => {
                  const active = category === c;
                  const thumb = categoryThumbnails[c];
                  return (
                    <Pressable style={styles.categoryTile} onPress={() => setCategory(c)}>
                      <View style={[styles.categoryImageWrap, active && styles.categoryImageWrapActive]}>
                        {thumb ? (
                          <Image source={{ uri: thumb }} style={styles.categoryImage} contentFit="cover" />
                        ) : (
                          <View style={styles.categoryImageFallback}>
                            <Text style={styles.categoryImageFallbackText}>
                              {c === "All" ? "🍽️" : "🍴"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[styles.categoryTileText, active && styles.categoryTileTextActive]}
                        numberOfLines={1}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            )}
          </>
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={onListScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>😕</Text>
            <Text style={styles.emptyText}>No restaurants found in {city} yet.</Text>
            <Text style={styles.emptyHint}>Pull down to refresh</Text>
          </View>
        </ScrollView>
      ) : !filteredShops.length && !filteredItems.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>Nothing matches your filters.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 16, gap: 14 }}
          onScroll={onListScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            !!filteredShops.length ? (
              <Text style={styles.sectionTitle}>
                {filteredShops.length} restaurant{filteredShops.length === 1 ? "" : "s"}
                {hasActiveFilters ? " matching" : ` in ${city}`}
              </Text>
            ) : null
          }
          renderItem={({ item }) => <ShopCard shop={item} />}
          ListFooterComponent={
            filteredItems.length ? (
              <View style={{ marginTop: filteredShops.length ? 22 : 0 }}>
                <Text style={styles.sectionTitle}>
                  {hasActiveFilters ? "Dishes matching" : "Popular Dishes"} ({filteredItems.length})
                </Text>
                <View style={styles.dishGrid}>
                  {filteredItems.map(({ item, shop }) => (
                    <DishCard key={`${shop._id}-${item._id}`} item={item} shop={shop} />
                  ))}
                </View>
              </View>
            ) : null
          }
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

function DishCard({ item, shop }: { item: Item; shop: Shop }) {
  const finalPrice = item.discount
    ? Math.round(item.price - (item.price * item.discount) / 100)
    : item.price;

  return (
    <Pressable
      style={({ pressed }) => [styles.dishCard, pressed && styles.cardPressed]}
      onPress={() => router.push(`/shop/${shop._id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.dishImage} contentFit="cover" />
      <View style={styles.dishBody}>
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
        <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.dishShop} numberOfLines={1}>{shop.name}</Text>
        <Text style={styles.dishPrice}>₹{finalPrice}</Text>
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
  micButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  micIcon: { fontSize: 16 },
  vegRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  vegLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  vegDotOuter: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  vegDotInner: { width: 8, height: 8, borderRadius: 4 },
  vegLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
  categoryTile: { alignItems: "center", width: 68 },
  categoryImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryImageWrapActive: { borderColor: colors.primary },
  categoryImage: { width: "100%", height: "100%", borderRadius: 28, backgroundColor: colors.border },
  categoryImageFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryImageFallbackText: { fontSize: 26 },
  categoryTileText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.muted,
    marginTop: 6,
    textAlign: "center",
  },
  categoryTileTextActive: { color: colors.primary, fontWeight: "800" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  emptyText: { fontSize: 15, color: colors.muted, textAlign: "center" },
  emptyHint: { fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 10, opacity: 0.7 },
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
  dishGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  dishCard: {
    width: "47%",
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  dishImage: { width: "100%", height: 100, backgroundColor: colors.border },
  dishBody: { padding: 10 },
  foodTypeDot: {
    width: 13,
    height: 13,
    borderWidth: 1.3,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  foodTypeInner: { width: 6.5, height: 6.5, borderRadius: 4 },
  dishName: { fontSize: 13.5, fontWeight: "700", color: colors.text },
  dishShop: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  dishPrice: { fontSize: 13, fontWeight: "800", color: colors.text, marginTop: 4 },
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
