import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Link, router } from "expo-router";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";

export default function SignIn() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signin", { email, password });
      if (data.role !== "owner") {
        Alert.alert(
          "Not a partner account",
          "This app is for restaurant partners only. Sign in with your ChakiyaEats partner account."
        );
        return;
      }
      const { token, ...user } = data;
      await signIn(user, token);
      router.replace("/");
    } catch (error) {
      Alert.alert("Sign in failed", apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Image
        source={require("../../assets/chakiya-eats-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>ChakiyaEats Partner</Text>
      <Text style={styles.subtitle}>Manage your restaurant on the go</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </Pressable>

      <Link href="/(auth)/sign-up" asChild>
        <Pressable>
          <Text style={styles.link}>New partner? Create an account</Text>
        </Pressable>
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.bg,
  },
  logo: { width: 96, height: 96, alignSelf: "center", marginBottom: 12 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});
