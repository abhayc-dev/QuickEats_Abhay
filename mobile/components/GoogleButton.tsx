import { Pressable, Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";

export default function GoogleButton({
  onPress,
  loading,
  label = "Continue with Google",
}: {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <Pressable style={styles.button} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          <View style={styles.gBadge}>
            <Text style={styles.gBadgeText}>G</Text>
          </View>
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 13,
  },
  gBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  gBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  label: { fontSize: 15, fontWeight: "600", color: colors.text },
});
