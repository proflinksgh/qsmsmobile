// src/services/googleAuthService.ts
import { apiClient, setSessionToken } from "./apiClient";
import { getFreshIdToken, signInWithGoogleCredential } from "./authService";

/**
 * You must obtain Google idToken & accessToken from Expo AuthSession or GoogleSignIn.
 * Then use this function to sign into Firebase with those tokens and then notify your backend.
 */
export async function handleGoogleSignIn(googleIdToken: string, googleAccessToken?: string) {
  const firebaseUser = await signInWithGoogleCredential(googleIdToken, googleAccessToken);
  const idToken = await getFreshIdToken(true);

  // send to transporter / backend
  const resp = await apiClient.post(
    "/auth/google-login",
    {
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber ?? "",
      firebaseUid: firebaseUser.uid,
    },
    { headers: { Authorization: `Bearer ${idToken}` } }
  );

  if (resp.data?.token) {
    await setSessionToken(resp.data.token);
  }

  return resp.data;
}
