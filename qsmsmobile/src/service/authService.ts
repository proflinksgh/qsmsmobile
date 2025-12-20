import { getReactNativePersistence } from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  PhoneAuthProvider,
  sendEmailVerification,
  signInWithCredential,
  signInWithEmailAndPassword,
  User
} from "firebase/auth";
import { env } from "../config/env";
import firebaseConfig from "../config/firebaseConfig";
import { normalizeEmail } from "../utils/helpers";
import { apiClient } from "./apiClient";

/**
 * ApplicationVerifier interface for phone auth.
 * This matches the Firebase ApplicationVerifier interface.
 * Used with expo-firebase-recaptcha's FirebaseRecaptchaVerifierModal.
 */
export interface ApplicationVerifier {
  readonly type: string;
  verify(): Promise<string>;
}

/* --------------------------- App Initialization --------------------------- */
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let auth: Auth | null = null;

/* ------------------------- Auth Initialization --------------------------- */
async function initAuth(): Promise<Auth> {
  if (auth) return auth;

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    return auth;
  } catch (error: any) {
    if (error?.code === "auth/already-initialized") {
      auth = getAuth(app);
      return auth;
    }
    throw error;
  }
}

/* --------------------------- Public API --------------------------- */

export async function getAuthInstance(): Promise<Auth> {
  return initAuth();
}

export async function register(email: string, password: string): Promise<User> {
  const a = await initAuth();
  const userCredential = await createUserWithEmailAndPassword(
    a,
    normalizeEmail(email),
    password
  );

  await sendEmailVerification(userCredential.user);

  return userCredential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const a = await initAuth();
  const userCredential = await signInWithEmailAndPassword(
    a,
    normalizeEmail(email),
    password
  );

  if (!userCredential.user.emailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  return userCredential.user;
}

export async function signOut(): Promise<void> {
  const a = await initAuth();
  await firebaseSignOut(a);
}

export async function sendVerificationEmail(user: User): Promise<void> {
  if (!user.email) throw new Error("User has no email");
  await sendEmailVerification(user);
}

export async function subscribeToAuthState(
  callback: (user: User | null) => void
): Promise<() => void> {
  const a = await initAuth();
  return onAuthStateChanged(a, callback);
}

/* ------------------------ Token Helpers --------------------------------- */

/**
 * Get a fresh Firebase ID token for backend calls.
 * @param forceRefresh - If true, forces token refresh even if not expired.
 */
export async function getFreshIdToken(forceRefresh = false): Promise<string> {
  const a = await initAuth();
  const user = a.currentUser;
  if (!user) {
    throw new Error("No authenticated user. Please sign in first.");
  }
  return user.getIdToken(forceRefresh);
}

/* ------------------------ Google Authentication ------------------------- */

/**
 * Sign in to Firebase using Google OAuth credentials.
 * Use this after obtaining tokens from expo-auth-session or similar.
 */
export async function signInWithGoogleCredential(
  googleIdToken: string,
  googleAccessToken?: string
): Promise<User> {
  const a = await initAuth();
  const credential = GoogleAuthProvider.credential(googleIdToken, googleAccessToken);
  const userCredential = await signInWithCredential(a, credential);
  return userCredential.user;
}

export async function googleSignIn(idToken: string): Promise<User> {
  const a = await initAuth();
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(a, credential);

  // Send payload to your custom backend using apiClient
  await apiClient.get(env.endpoints.googleAuth, {
    params: {
      email: userCredential.user.email,
      phone: userCredential.user.phoneNumber ?? "",
    },
    timeout: env.requestTimeout,
  });

  return userCredential.user;
}

/* ------------------------ Phone Authentication -------------------------- */

/**
 * Generate RecaptchaVerifier (required for Firebase Phone Auth on web).
 * Firebase v12+ signature: RecaptchaVerifier(auth, containerId, options)
 *
 * NOTE: RecaptchaVerifier is NOT available in the React Native build of Firebase.
 * For phone auth in React Native, use one of these options:
 * 1. Install `expo-firebase-recaptcha` and use FirebaseRecaptchaVerifierModal
 * 2. Switch to `@react-native-firebase/auth` which handles phone auth natively
 * 
 * This function is stubbed to throw an error in React Native.
 */
export async function getRecaptchaVerifier(_containerId: string): Promise<ApplicationVerifier> {
  throw new Error(
    "RecaptchaVerifier is not available in React Native. " +
    "Install expo-firebase-recaptcha or use @react-native-firebase/auth for phone authentication."
  );
}

/**
 * Send verification code to phone number
 * @param phoneNumber - Phone number in E.164 format (e.g., +1234567890)
 * @param recaptchaVerifier - ApplicationVerifier from expo-firebase-recaptcha or similar
 */
export async function sendPhoneVerification(phoneNumber: string, recaptchaVerifier: ApplicationVerifier) {
  const a = await initAuth();
  const provider = new PhoneAuthProvider(a);
  const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
  return verificationId;
}

/**
 * Verify phone code (OTP)
 */
export async function verifyPhoneCode(verificationId: string, code: string): Promise<User> {
  const a = await initAuth();
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const userCredential = await signInWithCredential(a, credential);

  // Send payload to your custom backend using apiClient
  await apiClient.get(env.endpoints.register, {
    params: {
      email: userCredential.user.email ?? "",
      phone: userCredential.user.phoneNumber ?? "",
      firebaseUid: userCredential.user.uid,
    },
    timeout: env.requestTimeout,
  });

  return userCredential.user;
}
