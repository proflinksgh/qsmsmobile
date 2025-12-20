// src/services/registrationService.ts
import { apiClient, setSessionToken } from "./apiClient";
import { getFreshIdToken } from "./authService";

/**
 * completeRegistration:
 * - Assumes user is already created & verified on Firebase (e.g., email verified).
 * - Requests fresh Firebase ID token.
 * - Calls your custom transporter endpoint, sending uid/email/phone in body and the idToken as Authorization header.
 * - Expects transporter to forward payload to legacy backend.
 *
 * Adjust endpoint / payload to match your backend contract.
 */

const TRANSPORTER_URL = "https://linksengineering.net/apisms/api/register"; // your transporter

export async function completeRegistrationAndTransport(email: string, phone: string, firebaseUid?: string) {
  const idToken = await getFreshIdToken(true);

  // We POST JSON body and send the firebase token in Authorization header
  const resp = await apiClient.post(
    "/register", // relative to apiClient.defaults.baseURL (if you prefer absolute use TRANSPORTER_URL)
    {
      email,
      phone,
      firebaseUid: firebaseUid ?? null,
    },
    {
      headers: {
        Authorization: `Bearer ${idToken}`, // backend should verify this firebase token
      },
    }
  );

  // optionally backend returns your app token; if so save it
  const data = resp.data;
  if (data?.token) {
    // store server token in secure store for subsequent API calls
    await setSessionToken(data.token);
  }

  return data;
}

/**
 * If your transporter requires query params style (legacy), use this helper:
 */
export async function transportLegacyQuery(email: string, phone: string, firebaseUid?: string) {
  const idToken = await getFreshIdToken(true);
  const url = `${TRANSPORTER_URL}?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&firebaseUid=${encodeURIComponent(firebaseUid ?? "")}`;
  const resp = await apiClient.get(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return resp.data;
}
