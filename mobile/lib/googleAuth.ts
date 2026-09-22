import { GOOGLE_WEB_CLIENT_ID } from "./config";
import { api, apiErrorMessage } from "./api";
import type { Role, User } from "../types";

export class GoogleSignInUnavailableError extends Error {}

let configured = false;

async function getGoogleSignIn() {
  // Dynamic import (not a static one) so Expo Go — which has no native
  // Google Sign-In module compiled in — fails inside this try/catch instead
  // of crashing the whole bundle at import time. Requires a custom dev
  // build (`npx expo run:android` / `run:ios` or an EAS dev build) to work;
  // it can never run inside plain Expo Go.
  try {
    return await import("@react-native-google-signin/google-signin");
  } catch {
    throw new GoogleSignInUnavailableError(
      "Google Sign-In requires a custom dev build — it isn't available in the Expo Go preview."
    );
  }
}

async function ensureConfigured() {
  if (configured) return;
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new GoogleSignInUnavailableError(
      "Google Sign-In isn't configured yet — add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (see mobile/.env.example)."
    );
  }
  const { GoogleSignin } = await getGoogleSignIn();
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  configured = true;
}

interface GoogleAuthResult {
  user: User;
  token: string;
}

// Mirrors the web app's handleGoogleAuth (frontend/src/pages/SignIn.jsx and
// SignUp.jsx): the backend's /api/auth/google-auth doesn't verify the Google
// ID token server-side, it just trusts {fullName, email, mobile, role} and
// creates the user if they don't exist yet — so mobile is required up front
// for a brand-new account, same as the web flow.
export async function signInWithGoogle(
  role: Role,
  mobile?: string
): Promise<GoogleAuthResult> {
  await ensureConfigured();
  const { GoogleSignin } = await getGoogleSignIn();

  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (response.type !== "success") {
    throw new Error("Google sign-in was cancelled.");
  }

  const { name, email } = response.data.user;

  try {
    const { data } = await api.post("/auth/google-auth", {
      fullName: name,
      email,
      mobile,
      role,
    });
    const { token, ...user } = data;
    return { user, token };
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Google sign-in failed"));
  }
}
