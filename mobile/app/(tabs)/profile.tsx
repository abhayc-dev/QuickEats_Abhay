import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";

export default function Profile() {
  const { user, signOut } = useAuthStore();

  const onSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.guestTitle}>You're browsing as a guest</Text>
        <Text style={styles.guestText}>Sign in to view your profile and past orders</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(auth)/sign-up")}>
          <Text style={styles.guestLink}>Create an account</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.fullName?.[0]?.toUpperCase() ?? "U"}</Text>
      </View>
      <Text style={styles.name}>{user?.fullName}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.infoCard}>
        <InfoRow label="Mobile" value={String(user?.mobile ?? "-")} />
        <InfoRow label="Account type" value={user?.role ?? "-"} />
      </View>

      <Pressable style={styles.signOutButton} onPress={onSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 80, alignItems: "center" },
  guestContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 6,
  },
  guestTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 18 },
  guestText: { fontSize: 14, color: colors.muted, textAlign: "center", marginBottom: 18 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  guestLink: { color: colors.primary, fontWeight: "600", marginTop: 16, fontSize: 14 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 34, fontWeight: "800" },
  name: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 14 },
  email: { fontSize: 14, color: colors.muted, marginTop: 4 },
  infoCard: {
    width: "88%",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 28,
    padding: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 14, color: colors.muted },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: "600", textTransform: "capitalize" },
  signOutButton: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 13,
  },
  signOutText: { color: colors.danger, fontWeight: "700" },
});
