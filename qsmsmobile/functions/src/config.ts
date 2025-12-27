/**
 * Configuration for Firebase Cloud Functions
 * 
 * IMPORTANT: Replace the placeholder values before deploying!
 * 
 * For security, use Firebase environment configuration:
 * firebase functions:config:set backend.delete_url="YOUR_URL" backend.admin_key="YOUR_KEY"
 */

// Backend API configuration
export const config = {
  // The backend API endpoint to call when a user is deleted from Firebase
  // Replace with your actual transporter API endpoint for user deletion
  deleteUserEndpoint: process.env.BACKEND_DELETE_URL || "YOUR_DELETE_API_ENDPOINT_HERE",
  
  // Optional: Admin key for authenticating with your backend
  // This should be a secret key that your backend validates
  adminKey: process.env.BACKEND_ADMIN_KEY || "YOUR_ADMIN_KEY_HERE",
  
  // Request timeout in milliseconds
  requestTimeout: 10000,
};

/**
 * Validate that configuration is properly set
 */
export function validateConfig(): boolean {
  if (config.deleteUserEndpoint.includes("YOUR_")) {
    console.error("❌ Backend delete endpoint not configured!");
    console.error("Please set the BACKEND_DELETE_URL environment variable or update config.ts");
    return false;
  }
  return true;
}
