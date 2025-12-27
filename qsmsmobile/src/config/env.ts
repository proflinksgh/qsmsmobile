export const env = {
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  },

  /** Backend API base URL */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://linksengineering.net/apisms/api",

  /** API endpoints (relative to apiBaseUrl) */
  endpoints: {
    register: "/register",
    googleAuth: "/googleauth",
    login: "/login",
    fetchProfile: "/fetchprofile",
    updateProfile: "/updateprofile",
    changePassword: "/changepassword",
    // OTP verification endpoints
    sendOtp: "/sendotp",
    verifyOtp: "/verifyotp",
    // SMS endpoints
    sendSms: "/sendsms",
    scheduleSms: "/schedulesms",
    getSmsBalance: "/getsmsbalance",
    sendPersonalisedSms: "/sendpersonalisedsms",
  },

  /** Request timeout in milliseconds */
  requestTimeout: 30000,
};
