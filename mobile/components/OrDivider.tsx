import { View, Text, StyleSheet } from "react-native";
import { colors } from "../lib/theme";

export default function OrDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>OR</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  text: { fontSize: 12, fontWeight: "700", color: colors.muted },
});
