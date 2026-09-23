import { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { createAudioPlayer } from "expo-audio";
import { colors } from "../lib/theme";

// checkmark.json — plays on a loop rather than stopping after one pass.
export default function OrderPlaced() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  useEffect(() => {
    // Fires once, right as the ring-fill animation starts — the Zomato-style
    // confirmation chime. A missed/blocked sound is non-fatal, so this is
    // fire-and-forget rather than something the screen waits on.
    const player = createAudioPlayer(require("../assets/order-success.mp3"));
    player.play();
    return () => player.release();
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/checkmark.json")}
        autoPlay
        loop
        style={styles.lottie}
      />

      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.subtitle}>
        Thank you for your order. It's being prepared.{"\n"}
        You can track its status below.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.replace(orderId ? `/order/${orderId}` : "/(tabs)/orders")}
      >
        <Text style={styles.buttonText}>Track Order</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  lottie: { width: 150, height: 150 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 8 },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
