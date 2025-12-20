/**
 * Firebase Error Handling Utilities
 *
 * Provides typed error handling for Firebase Auth errors with user-friendly messages.
 */

import { FirebaseError } from "firebase/app";

/** Common Firebase Auth error codes */
export type FirebaseAuthErrorCode =
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-credential"
  | "auth/email-already-in-use"
  | "auth/weak-password"
  | "auth/invalid-email"
  | "auth/user-disabled"
  | "auth/too-many-requests"
  | "auth/network-request-failed"
  | "auth/popup-closed-by-user"
  | "auth/operation-not-allowed"
  | "auth/requires-recent-login"
  | "auth/credential-already-in-use"
  | "auth/invalid-verification-code"
  | "auth/invalid-verification-id"
  | "auth/code-expired"
  | "auth/missing-verification-code"
  | "auth/quota-exceeded"
  | "auth/captcha-check-failed"
  | "auth/missing-phone-number"
  | "auth/invalid-phone-number"
  | "auth/already-initialized";

/** User-friendly error messages for Firebase Auth errors */
const ERROR_MESSAGES: Record<string, string> = {
  // Login errors
  "auth/user-not-found": "No account found with this email. Please check or sign up.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password. Please check and try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",

  // Registration errors
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters with mixed case, numbers, and symbols.",

  // Rate limiting
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/quota-exceeded": "Service temporarily unavailable. Please try again later.",

  // Network errors
  "auth/network-request-failed": "Network error. Please check your internet connection.",

  // Phone auth errors
  "auth/invalid-verification-code": "Invalid verification code. Please check and try again.",
  "auth/invalid-verification-id": "Verification session expired. Please request a new code.",
  "auth/code-expired": "Verification code expired. Please request a new one.",
  "auth/missing-verification-code": "Please enter the verification code.",
  "auth/captcha-check-failed": "Security check failed. Please try again.",
  "auth/missing-phone-number": "Please enter your phone number.",
  "auth/invalid-phone-number": "Please enter a valid phone number with country code.",

  // OAuth errors
  "auth/popup-closed-by-user": "Sign-in cancelled. Please try again.",
  "auth/credential-already-in-use": "This account is already linked to another user.",

  // Session errors
  "auth/requires-recent-login": "Please sign in again to complete this action.",
  "auth/operation-not-allowed": "This sign-in method is not enabled. Contact support.",
};

/**
 * Check if an error is a Firebase error
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof Error && "code" in error && typeof (error as any).code === "string";
}

/**
 * Get a user-friendly message for a Firebase error
 *
 * @param error - The caught error (can be anything)
 * @param fallbackMessage - Default message if error is not recognized
 * @returns User-friendly error message
 *
 * @example
 * try {
 *   await signIn(email, password);
 * } catch (error) {
 *   Alert.alert("Login Failed", getFirebaseErrorMessage(error));
 * }
 */
export function getFirebaseErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again."
): string {
  if (isFirebaseError(error)) {
    return ERROR_MESSAGES[error.code] ?? error.message ?? fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}

/**
 * Get the Firebase error code if available
 */
export function getFirebaseErrorCode(error: unknown): string | null {
  if (isFirebaseError(error)) {
    return error.code;
  }
  return null;
}

/**
 * Check if error is a specific Firebase auth error
 *
 * @example
 * if (isFirebaseAuthError(error, "auth/user-not-found")) {
 *   // Offer to create account
 * }
 */
export function isFirebaseAuthError(
  error: unknown,
  code: FirebaseAuthErrorCode | FirebaseAuthErrorCode[]
): boolean {
  if (!isFirebaseError(error)) return false;

  const codes = Array.isArray(code) ? code : [code];
  return codes.includes(error.code as FirebaseAuthErrorCode);
}

/**
 * Handle Firebase error with custom handlers for specific codes
 *
 * @example
 * handleFirebaseError(error, {
 *   "auth/user-not-found": () => navigation.navigate("Register"),
 *   "auth/too-many-requests": () => setRateLimited(true),
 *   default: (msg) => Alert.alert("Error", msg),
 * });
 */
export function handleFirebaseError(
  error: unknown,
  handlers: Partial<Record<FirebaseAuthErrorCode | "default", (message: string) => void>>
): void {
  const message = getFirebaseErrorMessage(error);
  const code = getFirebaseErrorCode(error) as FirebaseAuthErrorCode | null;

  if (code && handlers[code]) {
    handlers[code]!(message);
  } else if (handlers.default) {
    handlers.default(message);
  }
}
