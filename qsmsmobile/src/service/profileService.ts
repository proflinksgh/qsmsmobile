/**
 * Profile Service
 * 
 * Handles user profile operations with sync between Firebase and backend API.
 * 
 * Architecture:
 * - Firebase Auth: Handles email, password, and authentication tokens
 * - Backend API: Stores profile data (name, phone, city, country, etc.)
 * 
 * When updating profile:
 * - Email changes: Update Firebase first, then sync to backend
 * - Password changes: Update Firebase only (backend uses Firebase for auth)
 * - Other profile data: Update backend only
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
    EmailAuthProvider,
    getAuth,
    reauthenticateWithCredential,
    updateEmail,
    updateProfile as updateFirebaseProfile,
    updatePassword,
} from "firebase/auth";
import { env } from "../config/env";
import { apiClient, UserProfileData } from "./apiClient";

/* -------------------- Types -------------------- */

export interface ProfileUpdateData {
  // Basic info (stored in backend)
  phone?: string;
  city?: string;
  country?: string;
  region?: string;
  // Display name (stored in both Firebase and backend)
  displayName?: string;
  // Profile image URL (stored in backend)
  image?: string;
}

export interface EmailUpdateData {
  newEmail: string;
  currentPassword: string; // Required for re-authentication
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUpdateResponse {
  status: "success" | "error";
  message: string;
  data?: UserProfileData;
}

/* -------------------- Helper Functions -------------------- */

/**
 * Get stored user credentials for API calls
 */
async function getStoredCredentials(): Promise<{ userid: string; token: string } | null> {
  try {
    const userid = await AsyncStorage.getItem("systemUserId");
    const token = await SecureStore.getItemAsync("authToken");
    
    if (!userid || !token) {
      return null;
    }
    
    return { userid, token };
  } catch (error) {
    console.error("Error getting stored credentials:", error);
    return null;
  }
}

/**
 * Re-authenticate user with current password (required for sensitive operations)
 */
async function reauthenticateUser(currentPassword: string): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user || !user.email) {
    throw new Error("No authenticated user found");
  }
  
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
}

/* -------------------- Profile Operations -------------------- */

/**
 * Update profile data on the backend API.
 * This updates non-sensitive profile information like phone, city, etc.
 * 
 * @param data - Profile fields to update
 */
export async function updateProfileData(
  data: ProfileUpdateData
): Promise<ProfileUpdateResponse> {
  try {
    const credentials = await getStoredCredentials();
    
    if (!credentials) {
      return {
        status: "error",
        message: "Please login again to update your profile",
      };
    }
    
    // Update display name in Firebase if provided
    if (data.displayName) {
      const auth = getAuth();
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: data.displayName,
        });
      }
    }
    
    // Update profile in backend
    const response = await apiClient.post<ProfileUpdateResponse>(
      env.endpoints.updateProfile,
      null,
      {
        params: {
          userid: credentials.userid,
          token: credentials.token,
          ...data,
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error("Update profile error:", error);
    return {
      status: "error",
      message: error.response?.data?.message || error.message || "Failed to update profile",
    };
  }
}

/**
 * Update user's email address.
 * This requires re-authentication and updates both Firebase and backend.
 * 
 * @param data - New email and current password for verification
 */
export async function updateUserEmail(
  data: EmailUpdateData
): Promise<ProfileUpdateResponse> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return {
        status: "error",
        message: "No authenticated user found",
      };
    }
    
    // Step 1: Re-authenticate user
    await reauthenticateUser(data.currentPassword);
    
    // Step 2: Update email in Firebase
    await updateEmail(user, data.newEmail);
    
    // Step 3: Sync new email to backend
    const credentials = await getStoredCredentials();
    if (credentials) {
      await apiClient.post(env.endpoints.updateProfile, null, {
        params: {
          userid: credentials.userid,
          token: credentials.token,
          email: data.newEmail,
        },
      });
    }
    
    return {
      status: "success",
      message: "Email updated successfully. Please verify your new email.",
    };
  } catch (error: any) {
    console.error("Update email error:", error);
    
    // Handle specific Firebase errors
    if (error.code === "auth/wrong-password") {
      return {
        status: "error",
        message: "Incorrect current password",
      };
    }
    if (error.code === "auth/email-already-in-use") {
      return {
        status: "error",
        message: "This email is already in use by another account",
      };
    }
    if (error.code === "auth/requires-recent-login") {
      return {
        status: "error",
        message: "Please logout and login again before changing your email",
      };
    }
    
    return {
      status: "error",
      message: error.message || "Failed to update email",
    };
  }
}

/**
 * Update user's password.
 * This only updates Firebase as the backend uses Firebase for authentication.
 * 
 * @param data - Current and new password
 */
export async function updateUserPassword(
  data: PasswordUpdateData
): Promise<ProfileUpdateResponse> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return {
        status: "error",
        message: "No authenticated user found",
      };
    }
    
    // Step 1: Re-authenticate user
    await reauthenticateUser(data.currentPassword);
    
    // Step 2: Update password in Firebase
    await updatePassword(user, data.newPassword);
    
    // Optionally notify backend about password change (for logging/security)
    const credentials = await getStoredCredentials();
    if (credentials) {
      try {
        await apiClient.post(env.endpoints.changePassword, null, {
          params: {
            userid: credentials.userid,
            token: credentials.token,
          },
        });
      } catch {
        // Ignore backend notification failure - password is already updated in Firebase
      }
    }
    
    return {
      status: "success",
      message: "Password updated successfully",
    };
  } catch (error: any) {
    console.error("Update password error:", error);
    
    if (error.code === "auth/wrong-password") {
      return {
        status: "error",
        message: "Incorrect current password",
      };
    }
    if (error.code === "auth/weak-password") {
      return {
        status: "error",
        message: "New password is too weak. Please use a stronger password.",
      };
    }
    if (error.code === "auth/requires-recent-login") {
      return {
        status: "error",
        message: "Please logout and login again before changing your password",
      };
    }
    
    return {
      status: "error",
      message: error.message || "Failed to update password",
    };
  }
}

/**
 * Update profile image.
 * Uploads image to backend and updates the image URL.
 * 
 * Note: This is a placeholder - actual implementation depends on your
 * backend's image upload endpoint (might need multipart/form-data).
 * 
 * @param imageUri - Local URI of the image to upload
 */
export async function updateProfileImage(
  imageUri: string
): Promise<ProfileUpdateResponse> {
  try {
    const credentials = await getStoredCredentials();
    
    if (!credentials) {
      return {
        status: "error",
        message: "Please login again to update your profile",
      };
    }
    
    // Create form data for image upload
    const formData = new FormData();
    formData.append("userid", credentials.userid);
    formData.append("token", credentials.token);
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);
    
    const response = await apiClient.post<ProfileUpdateResponse>(
      env.endpoints.updateProfile,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    // Update Firebase profile photo URL if backend returns the new URL
    if (response.data.status === "success" && response.data.data?.image) {
      const auth = getAuth();
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          photoURL: response.data.data.image,
        });
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Update profile image error:", error);
    return {
      status: "error",
      message: error.response?.data?.message || error.message || "Failed to update profile image",
    };
  }
}

/**
 * Sync profile data between Firebase and backend.
 * Call this after login to ensure both systems have consistent data.
 */
export async function syncProfileData(): Promise<void> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    const credentials = await getStoredCredentials();
    
    if (!user || !credentials) return;
    
    // If Firebase has a display name, sync it to backend
    if (user.displayName) {
      await apiClient.post(env.endpoints.updateProfile, null, {
        params: {
          userid: credentials.userid,
          token: credentials.token,
          displayName: user.displayName,
        },
      }).catch(() => {
        // Ignore sync errors
      });
    }
  } catch (error) {
    console.error("Profile sync error:", error);
  }
}
