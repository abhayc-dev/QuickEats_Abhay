import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { createAudioPlayer } from "expo-audio";
import { colors } from "../lib/theme";

// checkmark.json (the website's own animation) plays its cart-fills-ring
// intro exactly once, cut at frame 42 — right as it starts crossfading into
// its own plain green circle, which we never actually show. Once that cut
// point is hit we switch entirely to tick-loop.json (the file provided
// directly for this purpose — a self-contained confetti + checkmark clip),
// which then plays on a continuous loop.
const INTRO_CUT_FRAME = 42;

export default function OrderPlaced() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const introRef = useRef<LottieView>(null);
  const [showLoop, setShowLoop] = useState(false);

  useEffect(() => {
    introRef.current?.play(0, INTRO_CUT_FRAME);
  }, []);

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
      {showLoop ? (
        <LottieView
          source={require("../assets/tick-loop.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      ) : (
        <LottieView
          ref={introRef}
          source={require("../assets/checkmark.json")}
          loop={false}
          style={styles.lottie}
          onAnimationFinish={() => setShowLoop(true)}
        />
      )}

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
