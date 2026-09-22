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
} from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, apiErrorMessage } from "../../lib/api";
import { signInWithGoogle, GoogleSignInUnavailableError } from "../../lib/googleAuth";
import { useAuthStore } from "../../store/auth";
import { colors } from "../../lib/theme";
import GoogleButton from "../../components/GoogleButton";
import OrDivider from "../../components/OrDivider";

export default function SignUp() {
  const signIn = useAuthStore((s) => s.signIn);
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
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
        role: "user",
      });
      const { token, ...user } = data;
      await signIn(user, token);
      goToDestination();
    } catch (error) {
      Alert.alert("Sign up failed", apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignUp = async () => {
    if (mobile.length < 10) {
      Alert.alert(
        "Mobile number required",
        "Enter your mobile number above first — it's required to create an account."
      );
      return;
    }
    setGoogleLoading(true);
    try {
      const { user, token } = await signInWithGoogle("user", mobile);
      await signIn(user, token);
      goToDestination();
    } catch (error) {
      if (error instanceof GoogleSignInUnavailableError) {
        Alert.alert("Google Sign-In unavailable", error.message);
      } else {
        Alert.alert("Google sign-up failed", (error as Error).message);
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

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Order from your favorite restaurants</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
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
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </Pressable>

        <OrDivider />
        <GoogleButton
          label="Sign up with Google"
          onPress={onGoogleSignUp}
          loading={googleLoading}
        />

        <Link href={{ pathname: "/(auth)/sign-in", params: redirect ? { redirect } : {} }} asChild>
          <Pressable>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  skipButton: {
    position: "absolute",
    right: 20,
    zIndex: 1,
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
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, textAlign: "center" },
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
