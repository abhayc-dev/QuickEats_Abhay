import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { api, apiErrorMessage } from "../lib/api";
import { useCartStore } from "../store/cart";
import { useLocationStore } from "../store/location";
import { colors } from "../lib/theme";
import type { Order } from "../types";

type PaymentMethod = "cod" | "online";

export default function Checkout() {
  const cart = useCartStore();
  const savedLocation = useLocationStore();
  const [addressText, setAddressText] = useState(savedLocation.address ?? "");
  const [coords, setCoords] = useState({
    latitude: savedLocation.latitude ?? 0,
    longitude: savedLocation.longitude ?? 0,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [locating, setLocating] = useState(false);
  const [placing, setPlacing] = useState(false);

  const total = cart.totalAmount();

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Enable location access to auto-fill your address.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const formatted = [place?.name, place?.street, place?.city, place?.region]
        .filter(Boolean)
        .join(", ");
      setAddressText(formatted || `${pos.coords.latitude}, ${pos.coords.longitude}`);
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch {
      Alert.alert("Location error", "Could not fetch your current location.");
    } finally {
      setLocating(false);
    }
  };

  const placeOrder = async () => {
    if (!addressText.trim()) {
      Alert.alert("Address required", "Please enter or fetch a delivery address.");
      return;
    }
    if (!coords.latitude || !coords.longitude) {
      Alert.alert(
        "Precise location needed",
        "Please tap 'Use current location' so we can pinpoint your delivery address."
      );
      return;
    }
    if (paymentMethod === "online") {
      Alert.alert(
        "Online payment coming soon",
        "Online payment needs a native build (Razorpay SDK) which isn't wired up yet in this preview. Please pay with Cash on Delivery for now."
      );
      return;
    }

    setPlacing(true);
    try {
      const { data } = await api.post<Order>("/order/place-order", {
        cartItems: cart.items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          shop: i.shop,
        })),
        paymentMethod,
        deliveryAddress: { text: addressText, latitude: coords.latitude, longitude: coords.longitude },
        totalAmount: total,
      });
      cart.clear();
      router.replace(`/order/${data._id}`);
    } catch (error) {
      Alert.alert("Order failed", apiErrorMessage(error));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.section}>Delivery Address</Text>
      <TextInput
        style={styles.addressInput}
        placeholder="Enter your full delivery address"
        multiline
        value={addressText}
        onChangeText={setAddressText}
      />
      <Pressable style={styles.locateButton} onPress={useCurrentLocation} disabled={locating}>
        {locating ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.locateButtonText}>📍 Use current location</Text>
        )}
      </Pressable>

      <Text style={styles.section}>Payment Method</Text>
      <Pressable
        style={[styles.paymentOption, paymentMethod === "cod" && styles.paymentOptionActive]}
        onPress={() => setPaymentMethod("cod")}
      >
        <Text style={styles.paymentTitle}>Cash on Delivery</Text>
        <Text style={styles.paymentSubtitle}>Pay when your order arrives</Text>
      </Pressable>
      <Pressable
        style={[styles.paymentOption, paymentMethod === "online" && styles.paymentOptionActive]}
        onPress={() => setPaymentMethod("online")}
      >
        <Text style={styles.paymentTitle}>Pay Online (Razorpay)</Text>
        <Text style={styles.paymentSubtitle}>Coming soon in this preview build</Text>
      </Pressable>

      <Text style={styles.section}>Order Summary</Text>
      <View style={styles.summaryCard}>
        {cart.items.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.summaryItem}>
              {item.quantity} × {item.name}
            </Text>
            <Text style={styles.summaryItem}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>₹{total}</Text>
        </View>
      </View>

      <Pressable style={styles.placeButton} onPress={placeOrder} disabled={placing}>
        {placing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeButtonText}>Place Order · ₹{total}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 20, marginBottom: 10 },
  addressInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    minHeight: 70,
    textAlignVertical: "top",
    fontSize: 15,
  },
  locateButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  locateButtonText: { color: colors.primary, fontWeight: "700" },
  paymentOption: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  paymentOptionActive: { borderColor: colors.primary, borderWidth: 2 },
  paymentTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  paymentSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryItem: { fontSize: 13, color: colors.text },
  summaryTotalRow: { marginTop: 4, marginBottom: 0, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  summaryTotalLabel: { fontSize: 15, fontWeight: "800", color: colors.text },
  summaryTotalValue: { fontSize: 15, fontWeight: "800", color: colors.text },
  placeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  placeButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
