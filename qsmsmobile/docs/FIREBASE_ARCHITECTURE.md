# Firebase Architecture — qsmsmobile

This document describes the Firebase integration architecture used in **qsmsmobile**, including initialization patterns, authentication flows, and how Firebase interacts with the custom backend ("transporter").

---

## Overview

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Config** | `src/config/firebaseConfig.ts` | Firebase project credentials |
| **Low-level Auth** | `src/firebase/auth.ts` | App/Auth initialization, basic sign-in/register helpers |
| **Email Verification** | `src/firebase/emailVerification.ts` | Helper to send & check email verification status |
| **Phone Verification** | `src/firebase/phoneVerification.ts` | OTP send/confirm using `PhoneAuthProvider` |
| **High-level Service** | `src/service/authService.ts` | Re-exports + Google/Phone sign-in with backend sync |
| **Backend Sync** | `src/service/registrationService.ts`, `googleAuthService.ts` | Send Firebase ID tokens to custom backend |
| **Global State** | `src/context/LoginContext.tsx` | React context that subscribes to Firebase auth state |

---

## 1. Firebase Initialization

Firebase is initialized **once**, with React Native AsyncStorage persistence so sessions survive app restarts.

```
src/firebase/auth.ts
────────────────────
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebaseConfig from "../config/firebaseConfig";

let app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
let auth: Auth | null = null;

async function initAuth(): Promise<Auth> {
  if (auth) return auth;
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e: any) {
    if (e?.code === "auth/already-initialized") auth = getAuth(app);
    else throw e;
  }
  return auth;
}

export async function getAuthInstance() { return initAuth(); }
```

**Key points:**
- `initAuth()` is idempotent — safe to call from multiple places.
- `getReactNativePersistence(AsyncStorage)` keeps the user signed in across app launches.
- Exported helpers (`register`, `signIn`, `signOut`, `subscribeToAuthState`) always call `initAuth()` first.

---

## 2. Authentication Methods

### 2.1 Email/Password

| Function | File | Description |
|----------|------|-------------|
| `register(email, password)` | `src/firebase/auth.ts` | Creates user via `createUserWithEmailAndPassword` |
| `signIn(email, password)` | `src/firebase/auth.ts` | Signs in; throws if email not verified |
| `sendVerificationEmail(user)` | `src/firebase/auth.ts` | Sends Firebase verification email |

**Registration flow (see `RegisterScreen.tsx`):**
1. Call `register(email, password)` → Firebase user created.
2. Call `sendEmailVerification(user)` → user receives verification link.
3. After user clicks link, UI polls `auth.currentUser.reload()` then checks `emailVerified`.
4. Once verified, call backend `registerUserInSystem(uid, email, phone)` to create account in legacy system and receive an **app token**.
5. Store app token via `SecureStore` for future API calls.

### 2.2 Google Sign-In

```
src/components/GoogleAuthButton.tsx
────────────────────────────────────
1. expo-auth-session/providers/google → user grants consent → accessToken
2. Fetch Google userinfo → { email, name }
3. Optionally sign into Firebase with GoogleAuthProvider.credential (if needed)
4. Call backend transporter → registerUserInSystem(uid, email, phone)
5. Store returned token, setLogin(true)
```

**Alternative service helper:** `src/service/googleAuthService.ts`

```ts
export async function handleGoogleSignIn(googleIdToken, googleAccessToken?) {
  const firebaseUser = await signInWithGoogleCredential(googleIdToken, googleAccessToken);
  const idToken = await getFreshIdToken(true);       // Firebase ID token
  const resp = await apiClient.post("/auth/google-login", { ... }, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (resp.data?.token) await setSessionToken(resp.data.token);
  return resp.data;
}
```

### 2.3 Phone Sign-In (OTP)

Located in `src/firebase/phoneVerification.ts` and partially in `src/service/authService.ts`.

```
1. sendPhoneVerificationCode(phone) → PhoneAuthProvider.verifyPhoneNumber → verificationId stored in module
2. confirmPhoneCode(code, user) → PhoneAuthProvider.credential → signInWithCredential
3. After success, register in backend with firebase UID
```

> **Note:** Requires a valid `RecaptchaVerifier` on web; on native it typically uses invisible reCAPTCHA or Firebase's silent APNs/Play Services verification.

---

## 3. Auth State Subscription

`LoginContext` is the single source of truth for UI.

```
src/context/LoginContext.tsx
────────────────────────────
const [login, setLogin] = useState(false);
const [user, setUser]   = useState<User | null>(null);

useEffect(() => {
  const unsub = await onAuthState((u) => {
    setUser(u);
    setLogin(!!u);
  });
  return () => unsub?.();
}, []);
```

- `onAuthState` comes from `src/firebase/auth.ts` (`subscribeToAuthState`).
- Components read `LoginContext` to decide authenticated UI vs login screens.
- Calling `setLogin(true/false)` can force immediate UI updates (e.g., after backend registration success).

---

## 4. Backend Integration Pattern

Firebase is used for **identity** (authentication). A separate "transporter" backend handles business data.

```
                ┌─────────────────────┐
                │   Firebase Auth     │
                │ (email, phone, google)│
                └──────────┬──────────┘
                           │  Firebase ID Token
                           ▼
                ┌─────────────────────┐
                │   Transporter API   │
                │ linksengineering.net│
                └──────────┬──────────┘
                           │  App Token (JWT / session)
                           ▼
                ┌─────────────────────┐
                │   apiClient.ts      │
                │ (axios + SecureStore)│
                └─────────────────────┘
```

### Sending Firebase ID Token to Backend

```ts
// src/service/registrationService.ts
import { getFreshIdToken } from "./authService";
import { apiClient, setSessionToken } from "./apiClient";

export async function completeRegistrationAndTransport(email, phone, uid) {
  const idToken = await getFreshIdToken(true);           // force refresh
  const resp = await apiClient.post("/register", { email, phone, firebaseUid: uid }, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (resp.data?.token) await setSessionToken(resp.data.token);
  return resp.data;
}
```

- `getFreshIdToken(forceRefresh)` calls `user.getIdToken(true)` on the current Firebase user.
- Backend validates the Firebase token using Firebase Admin SDK, then returns its own session token.
- That session token is stored in `expo-secure-store` and attached to all subsequent `apiClient` requests.

---

## 5. Key Files Reference

| File | Purpose |
|------|---------|
| `src/config/firebaseConfig.ts` | Firebase project credentials (apiKey, projectId, etc.) |
| `src/firebase/auth.ts` | Low-level init + email/password helpers |
| `src/firebase/emailVerification.ts` | `sendEmailVerificationLink`, `checkEmailVerified` |
| `src/firebase/phoneVerification.ts` | `sendPhoneVerificationCode`, `confirmPhoneCode` |
| `src/service/authService.ts` | Re-exports auth helpers + Google/phone helpers + `getFreshIdToken` |
| `src/service/googleAuthService.ts` | `handleGoogleSignIn` flow |
| `src/service/registrationService.ts` | `completeRegistrationAndTransport` |
| `src/service/apiClient.ts` | Axios instance, stores/attaches session token, handles 401 |
| `src/context/LoginContext.tsx` | Global auth state for UI |
| `src/screens/auth/RegisterScreen.tsx` | Full registration flow example |
| `src/screens/auth/LoginScreen.tsx` | Login flow (custom backend login, Google button) |
| `src/components/GoogleAuthButton.tsx` | Google OAuth button using expo-auth-session |

---

## 6. Security Notes

1. **Never commit new secrets.** `firebaseConfig.ts` already contains API keys — do not add service account credentials.
2. **Token refresh:** Always use `getFreshIdToken(true)` when calling backend endpoints that verify Firebase tokens to avoid expired token errors.
3. **401 handling:** `apiClient` interceptor clears stored token on 401 and can trigger logout logic.
4. **Persistence:** Firebase sessions persist via AsyncStorage; app tokens persist via SecureStore.

---

## 7. Adding a New Auth Method

1. Implement provider logic in `src/firebase/` or `src/service/`.
2. After Firebase sign-in, call `getFreshIdToken()` and POST to transporter.
3. Store returned app token with `setSessionToken()`.
4. Call `setLogin(true)` from `LoginContext` to update UI.

Example skeleton:

```ts
// src/service/appleAuthService.ts
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { getAuthInstance, getFreshIdToken } from "./authService";
import { apiClient, setSessionToken } from "./apiClient";

export async function handleAppleSignIn(appleIdToken: string, nonce: string) {
  const auth = await getAuthInstance();
  const credential = new OAuthProvider("apple.com").credential({ idToken: appleIdToken, rawNonce: nonce });
  const result = await signInWithCredential(auth, credential);

  const firebaseIdToken = await getFreshIdToken(true);
  const resp = await apiClient.post("/auth/apple-login", {
    email: result.user.email,
    firebaseUid: result.user.uid,
  }, { headers: { Authorization: `Bearer ${firebaseIdToken}` } });

  if (resp.data?.token) await setSessionToken(resp.data.token);
  return resp.data;
}
```

---

## 8. Diagram: Full Registration Flow

```
User                      App                        Firebase                 Backend
 │                         │                            │                        │
 │── Enter email/pass ────▶│                            │                        │
 │                         │── createUserWithEmail ────▶│                        │
 │                         │◀─── User object ──────────│                        │
 │                         │── sendEmailVerification ──▶│                        │
 │◀── Verification modal ──│                            │                        │
 │                         │                            │                        │
 │── (clicks email link) ──────────────────────────────▶│                        │
 │                         │                            │                        │
 │── Confirm in modal ────▶│                            │                        │
 │                         │── reload() + check ───────▶│                        │
 │                         │◀── emailVerified: true ───│                        │
 │                         │── getIdToken(true) ───────▶│                        │
 │                         │◀─── Firebase ID Token ────│                        │
 │                         │── POST /register ─────────────────────────────────▶│
 │                         │◀─────────────────────────── { token, userId } ─────│
 │                         │── setSessionToken(token)   │                        │
 │                         │── setLogin(true)           │                        │
 │◀── Navigate to Home ────│                            │                        │
```

---

_Last updated: 2025-12-19_
