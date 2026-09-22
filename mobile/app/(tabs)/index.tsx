import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useLocationStore } from "../../store/location";
import { colors } from "../../lib/theme";
import type { Shop } from "../../types";

export default function Home() {
  const { city, address, setLocation } = useLocationStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [locating, setLocating] = useState(false);

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
    setPickerOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>Deliver to</Text>
          <Pressable onPress={() => setPickerOpen(true)}>
            <Text style={styles.headerCity} numberOfLines={1}>
              {city ? `${city} ▾` : "Select your city ▾"}
            </Text>
          </Pressable>
        </View>
      </View>

      {!city ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Choose your city to see restaurants near you</Text>
          <Pressable style={styles.primaryButton} onPress={() => setPickerOpen(true)}>
            <Text style={styles.primaryButtonText}>Select City</Text>
          </Pressable>
        </View>
      ) : shopsQuery.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />
      ) : shopsQuery.isError || !shopsQuery.data?.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No restaurants found in {city} yet.</Text>
        </View>
      ) : (
        <FlatList
          data={shopsQuery.data}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          renderItem={({ item }) => <ShopCard shop={item} />}
        />
      )}

      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Choose your city</Text>

          <Pressable style={styles.locateButton} onPress={useCurrentLocation} disabled={locating}>
            {locating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.locateButtonText}>📍 Use current location</Text>
            )}
          </Pressable>

          {citiesQuery.isLoading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={citiesQuery.data ?? []}
              keyExtractor={(c) => c}
              renderItem={({ item }) => (
                <Pressable style={styles.cityRow} onPress={() => selectCity(item)}>
                  <Text style={styles.cityRowText}>{item}</Text>
                </Pressable>
              )}
            />
          )}

          <Pressable style={styles.closeButton} onPress={() => setPickerOpen(false)}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/shop/${shop._id}`)}>
      <Image source={{ uri: shop.image }} style={styles.cardImage} contentFit="cover" />
      {!shop.isOpen && (
        <View style={styles.closedBadge}>
          <Text style={styles.closedBadgeText}>Closed</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{shop.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {shop.address}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLabel: { fontSize: 12, color: colors.muted },
  headerCity: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 2 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  emptyText: { fontSize: 15, color: colors.muted, textAlign: "center" },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: { width: "100%", height: 150, backgroundColor: colors.border },
  closedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closedBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardSubtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  modal: { flex: 1, backgroundColor: colors.bg, paddingTop: 60, paddingHorizontal: 20 },
  modalTitle: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  locateButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  locateButtonText: { color: colors.primary, fontWeight: "700" },
  cityRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  cityRowText: { fontSize: 16, color: colors.text },
  closeButton: { paddingVertical: 18, alignItems: "center" },
  closeButtonText: { color: colors.muted, fontSize: 15 },
});
