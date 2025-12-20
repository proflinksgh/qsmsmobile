import {
    PhoneAuthProvider,
    signInWithCredential
} from "firebase/auth";
import { ApplicationVerifier, getAuthInstance } from "../service/authService";

let verificationId: string | null = null;

/**
 * Send phone verification code (OTP).
 *
 * @param phone - Phone number in E.164 format (e.g., "+233201234567")
 * @param appVerifier - A RecaptchaVerifier or other ApplicationVerifier instance.
 *                      On React Native you may use Firebase's silent APNs/Play Services
 *                      verification, but a verifier is still required on web.
 *
 * @example
 * // Web usage:
 * const recaptcha = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
 * await sendPhoneVerificationCode('+233201234567', recaptcha);
 */
export async function sendPhoneVerificationCode(
  phone: string,
  appVerifier: ApplicationVerifier
): Promise<boolean> {
  if (!appVerifier) {
    throw new Error(
      "appVerifier is required. Pass a RecaptchaVerifier or compatible ApplicationVerifier."
    );
  }

  const auth = await getAuthInstance();
  const provider = new PhoneAuthProvider(auth);
  verificationId = await provider.verifyPhoneNumber(phone, appVerifier);

  return true;
}

/**
 * Confirm phone verification code and sign in.
 *
 * @param code - The 6-digit OTP the user received.
 * @returns true on success
 */
export async function confirmPhoneCode(code: string): Promise<boolean> {
  if (!verificationId) {
    throw new Error(
      "Verification session expired or not started. Call sendPhoneVerificationCode first."
    );
  }

  const auth = await getAuthInstance();
  const credential = PhoneAuthProvider.credential(verificationId, code);
  await signInWithCredential(auth, credential);

  verificationId = null;
  return true;
}
