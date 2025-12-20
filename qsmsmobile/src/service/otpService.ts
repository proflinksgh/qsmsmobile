/**
 * OTP Verification Service
 * 
 * Handles sending and verifying OTP codes for email and phone verification.
 * Uses the transporter backend API for SMS/email delivery.
 */

import { env } from "../config/env";
import { apiClient } from "./apiClient";

export type OtpType = "email" | "phone";

export interface SendOtpRequest {
  type: OtpType;
  recipient: string; // email address or phone number
}

export interface SendOtpResponse {
  status: "success" | "error";
  message: string;
  otpId?: string; // unique identifier for this OTP session
  expiresIn?: number; // seconds until OTP expires
}

export interface VerifyOtpRequest {
  type: OtpType;
  recipient: string;
  code: string;
  otpId?: string; // optional OTP session ID
}

export interface VerifyOtpResponse {
  status: "success" | "error";
  message: string;
  verified: boolean;
}

/**
 * Send an OTP code to the specified recipient.
 * 
 * For email: Sends a 6-digit code to the email address
 * For phone: Sends a 6-digit code via SMS
 * 
 * @param type - "email" or "phone"
 * @param recipient - The email address or phone number
 * @returns Promise with OTP session info
 */
export async function sendOtp(
  type: OtpType,
  recipient: string
): Promise<SendOtpResponse> {
  try {
    const response = await apiClient.post<SendOtpResponse>(env.endpoints.sendOtp, {
      type,
      recipient,
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Send OTP Error:", error.response?.data || error.message);
    
    // Return a structured error response
    return {
      status: "error",
      message: error.response?.data?.message || "Failed to send verification code. Please try again.",
    };
  }
}

/**
 * Verify an OTP code entered by the user.
 * 
 * @param type - "email" or "phone"
 * @param recipient - The email address or phone number
 * @param code - The 6-digit OTP code entered by user
 * @param otpId - Optional OTP session ID from sendOtp response
 * @returns Promise with verification result
 */
export async function verifyOtp(
  type: OtpType,
  recipient: string,
  code: string,
  otpId?: string
): Promise<VerifyOtpResponse> {
  try {
    const response = await apiClient.post<VerifyOtpResponse>(env.endpoints.verifyOtp, {
      type,
      recipient,
      code,
      otpId,
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Verify OTP Error:", error.response?.data || error.message);
    
    // Return a structured error response
    return {
      status: "error",
      message: error.response?.data?.message || "Verification failed. Please check the code and try again.",
      verified: false,
    };
  }
}

/**
 * Helper to generate a reference ID for tracking OTP requests.
 * This can be used client-side if the backend doesn't provide an otpId.
 */
export function generateOtpReference(): string {
  return `otp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
