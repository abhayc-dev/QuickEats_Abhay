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
} from "react-native";
import { Link, router } from "expo-router";
import { api, apiErrorMessage } from "../../lib/api";
import { signInWithGoogle, GoogleSignInUnavailableError } from "../../lib/googleAuth";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";
import GoogleButton from "../../components/GoogleButton";
import OrDivider from "../../components/OrDivider";

export default function SignIn() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signin", { email, password });
      const { token, ...user } = data;
      await signIn(user, token);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Sign in failed", apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Existing accounts only: matches the web app's sign-in behavior,
      // which doesn't collect a mobile number here. New Google users need
      // to use Sign Up first (mobile is required to create an account).
      const { user, token } = await signInWithGoogle("user");
      await signIn(user, token);
      router.replace("/(tabs)");
    } catch (error) {
      if (error instanceof GoogleSignInUnavailableError) {
        Alert.alert("Google Sign-In unavailable", error.message);
      } else {
        Alert.alert("Google sign-in failed", (error as Error).message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>QuickEats</Text>
      <Text style={styles.subtitle}>Sign in to order food</Text>

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

      <OrDivider />
      <GoogleButton onPress={onGoogleSignIn} loading={googleLoading} />

      <Link href="/(auth)/sign-up" asChild>
        <Pressable>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
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
  title: {
    fontSize: 34,
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
