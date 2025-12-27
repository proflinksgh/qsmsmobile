/**
 * Firebase Cloud Functions for qsmsmobile
 * 
 * This module provides automatic synchronization between Firebase Auth
 * and your backend database when users are deleted.
 * 
 * Setup Instructions:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login to Firebase: firebase login
 * 3. Initialize functions (if not done): firebase init functions
 * 4. Update config.ts with your backend API endpoint
 * 5. Deploy: cd functions && npm install && npm run deploy
 */

import axios from "axios";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { config, validateConfig } from "./config";

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function: onUserDeleted
 * 
 * Triggers automatically when a user is deleted from Firebase Auth.
 * This includes deletions from:
 * - Firebase Console
 * - Admin SDK
 * - Client SDK (user.delete())
 * 
 * The function calls your backend API to sync the deletion,
 * ensuring your database stays in sync with Firebase Auth.
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  // Validate configuration
  if (!validateConfig()) {
    console.error("Function skipped due to missing configuration");
    return { success: false, error: "Configuration not set" };
  }

  const { uid, email, phoneNumber, displayName } = user;
  
  console.log("========================================");
  console.log("🗑️  User Deletion Detected");
  console.log("========================================");
  console.log(`UID: ${uid}`);
  console.log(`Email: ${email || "N/A"}`);
  console.log(`Phone: ${phoneNumber || "N/A"}`);
  console.log(`Display Name: ${displayName || "N/A"}`);
  console.log(`Deleted At: ${new Date().toISOString()}`);
  console.log("----------------------------------------");

  try {
    // Call your backend API to delete/deactivate the user
    const response = await axios({
      method: "POST",
      url: config.deleteUserEndpoint,
      timeout: config.requestTimeout,
      headers: {
        "Content-Type": "application/json",
        // Add admin key for backend authentication
        ...(config.adminKey && { "X-Admin-Key": config.adminKey }),
      },
      data: {
        firebaseUid: uid,
        email: email || null,
        phone: phoneNumber || null,
        displayName: displayName || null,
        deletedAt: new Date().toISOString(),
      },
    });

    console.log("✅ Backend sync successful!");
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Data: ${JSON.stringify(response.data)}`);
    console.log("========================================");

    return { 
      success: true, 
      uid, 
      email,
      backendResponse: response.data 
    };

  } catch (error) {
    // Handle different error types
    if (axios.isAxiosError(error)) {
      console.error("❌ Backend API Error:");
      console.error(`Status: ${error.response?.status || "No response"}`);
      console.error(`Message: ${error.message}`);
      console.error(`Data: ${JSON.stringify(error.response?.data || {})}`);
      
      // Log for debugging but don't throw - we don't want to retry failed deletions
      // The user is already deleted from Firebase
      return {
        success: false,
        uid,
        email,
        error: error.message,
        responseData: error.response?.data,
      };
    }

    console.error("❌ Unexpected Error:", error);
    return {
      success: false,
      uid,
      email,
      error: String(error),
    };
  }
});

/**
 * Cloud Function: onUserCreated (Optional)
 * 
 * You can also sync user creation if needed.
 * Uncomment and configure if you want to notify your backend
 * when new users register via Firebase.
 */
/*
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const { uid, email, phoneNumber, displayName } = user;
  
  console.log("🆕 New User Created:", { uid, email, phoneNumber, displayName });
  
  // Optionally notify your backend about the new user
  // This could be useful for pre-creating user records
  
  return { success: true, uid, email };
});
*/

/**
 * HTTP Function: manualSyncDelete (For testing/admin use)
 * 
 * An HTTP-callable function to manually trigger a user deletion sync.
 * Useful for:
 * - Testing the sync before deploying
 * - Manually syncing users that were deleted before the function was deployed
 * - Admin tools
 * 
 * Usage: POST /manualSyncDelete with body { email: "user@example.com", uid: "..." }
 */
export const manualSyncDelete = functions.https.onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Basic authentication check (you should implement proper auth)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${config.adminKey}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { email, uid, phone } = req.body;

  if (!email && !uid) {
    res.status(400).json({ error: "email or uid is required" });
    return;
  }

  if (!validateConfig()) {
    res.status(500).json({ error: "Backend not configured" });
    return;
  }

  try {
    const response = await axios({
      method: "POST",
      url: config.deleteUserEndpoint,
      timeout: config.requestTimeout,
      headers: {
        "Content-Type": "application/json",
        ...(config.adminKey && { "X-Admin-Key": config.adminKey }),
      },
      data: {
        firebaseUid: uid || null,
        email: email || null,
        phone: phone || null,
        deletedAt: new Date().toISOString(),
        manual: true,
      },
    });

    res.json({
      success: true,
      message: "User deletion synced to backend",
      backendResponse: response.data,
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(500).json({
        success: false,
        error: error.message,
        backendResponse: error.response?.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: String(error),
      });
    }
  }
});
