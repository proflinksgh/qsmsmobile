// src/services/apiClient.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { env } from "../config/env";

const DEFAULT_BASE = env.apiBaseUrl;

export const apiClient = axios.create({
  baseURL: DEFAULT_BASE,
  timeout: env.requestTimeout,
});

let cachedToken: string | null = null;
const SECURE_TOKEN_KEY = "authToken"; // stored as JSON { token, issuedAt }

/** load token from secure storage (cached in memory) */
async function loadToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  const raw = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    cachedToken = parsed?.token ?? raw;
  } catch {
    cachedToken = raw;
  }
  return cachedToken;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await loadToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      cachedToken = null;
      await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      // Optionally broadcast logout event (app-level)
    }
    return Promise.reject(error);
  }
);

export async function setSessionToken(token: string) {
  cachedToken = token;
  await SecureStore.setItemAsync(SECURE_TOKEN_KEY, JSON.stringify({ token, issuedAt: Date.now() }));
}

export async function clearSession() {
  cachedToken = null;
  await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
}

/* --------------------------- API Functions --------------------------- */

export interface SystemRegistrationResponse {
  success?: boolean;
  status?: string; // API may return "success" or "error" as string
  message?: string;
  userId?: string;
  userid?: string | number; // Alternative field name from backend
  token?: string;
}

export interface LoginResponse {
  status: string; // "success" or "error"
  message?: string;
  token?: string;
  userId?: string;
  userid?: string | number; // API returns number
  user?: Record<string, unknown>;
}

export interface LoginParams {
  email: string;
  password: string;
  ipaddress: string;
  device: string;
  location: string; // Format: "latitude,longitude"
}

/**
 * Register a user in the transporter backend system after Firebase authentication.
 * Uses POST method with query parameters as required by the transporter API:
 * https://linksengineering.net/apisms/api/register?email=...&password=...&phone=...
 *
 * @param email - User's email address
 * @param password - User's password
 * @param phone - User's phone number
 */
export async function registerUserInSystem(
  email: string,
  password: string,
  phone: string
): Promise<SystemRegistrationResponse> {
  const response = await apiClient.post<SystemRegistrationResponse>(env.endpoints.register, null, {
    params: {
      email,
      password,
      phone,
    },
  });
  return response.data;
}

/**
 * Login via the transporter backend API with device and location info.
 * Uses POST method with form data/body as required by the API.
 *
 * @param params - Login parameters including email, password, IP, device, and location
 */
export async function customLogin(params: LoginParams): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(env.endpoints.login, null, {
    params: {
      email: params.email,
      password: params.password,
      ipaddress: params.ipaddress,
      device: params.device,
      location: params.location,
    },
  });
  return response.data;
}

/* -------------------- User Profile API -------------------- */

export interface UserProfileData {
  id: number;
  account_type: string;
  reference: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  region: string;
  image: string;
  created_at: string;
}

export interface FetchProfileResponse {
  status: string;
  data: UserProfileData;
}

/**
 * Fetch user profile from the transporter backend API.
 * API: GET /fetchprofile?userid=...&token=...
 *
 * @param userid - User ID from login response
 * @param token - Auth token
 */
export async function fetchUserProfile(
  userid: string | number,
  token: string
): Promise<FetchProfileResponse> {
  const response = await apiClient.get<FetchProfileResponse>(env.endpoints.fetchProfile, {
    params: {
      userid,
      token,
    },
  });
  return response.data;
}
