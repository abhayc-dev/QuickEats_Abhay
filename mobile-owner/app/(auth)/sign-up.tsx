import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Link, router } from "expo-router";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";

export default function SignUp() {
  const signIn = useAuthStore((s) => s.signIn);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!fullName || !email || !mobile || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    if (mobile.length < 10) {
      Alert.alert("Invalid mobile", "Mobile number must be at least 10 digits.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", {
        fullName,
        email,
        mobile,
        password,
        role: "owner",
      });
      const { token, ...user } = data;
      await signIn(user, token);
      router.replace("/");
    } catch (error) {
      Alert.alert("Sign up failed", apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Image
          source={require("../../assets/chakiya-eats-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Become a partner</Text>
        <Text style={styles.subtitle}>List your restaurant on ChakiyaEats</Text>

        <TextInput
          style={styles.input}
          placeholder="Owner full name"
          value={fullName}
          onChangeText={setFullName}
        />
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
          placeholder="Mobile number"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
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
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </Pressable>

        <Link href="/(auth)/sign-in" asChild>
          <Pressable>
            <Text style={styles.link}>Already a partner? Sign in</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },
  logo: { width: 80, height: 80, alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" },
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
