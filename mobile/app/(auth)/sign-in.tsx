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
import { Link, router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, apiErrorMessage } from "../../lib/api";
import { signInWithGoogle, GoogleSignInUnavailableError } from "../../lib/googleAuth";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";
import GoogleButton from "../../components/GoogleButton";
import OrDivider from "../../components/OrDivider";

export default function SignIn() {
  const signIn = useAuthStore((s) => s.signIn);
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const goToDestination = () => {
    router.replace(redirect ? (redirect as any) : "/(tabs)");
  };

  const skip = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signin", { email, password });
      if (data.role !== "user") {
        Alert.alert(
          "Not a customer account",
          "This app is for ordering food. Restaurant partner and delivery accounts use their own apps."
        );
        return;
      }
      const { token, ...user } = data;
      await signIn(user, token);
      goToDestination();
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
      if (user.role !== "user") {
        Alert.alert(
          "Not a customer account",
          "This app is for ordering food. Restaurant partner and delivery accounts use their own apps."
        );
        return;
      }
      await signIn(user, token);
      goToDestination();
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
      <Pressable style={[styles.skipButton, { top: insets.top + 10 }]} onPress={skip} hitSlop={10}>
        <Text style={styles.skipButtonText}>✕</Text>
      </Pressable>

      <Text style={styles.title}>ChakiyaEats</Text>
      <Text style={styles.subtitle}>
        {redirect ? "Sign in to complete your order" : "Sign in to order food"}
      </Text>

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

      <Link href={{ pathname: "/(auth)/sign-up", params: redirect ? { redirect } : {} }} asChild>
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
  skipButton: {
    position: "absolute",
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: { fontSize: 16, color: colors.muted, fontWeight: "700" },
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
