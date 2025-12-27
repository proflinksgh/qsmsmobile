/**
 * SMS Service
 * Handles all SMS-related API operations including sending, scheduling, and balance checking.
 */

import { env } from '../config/env';
import { apiClient } from './apiClient';

// ----- Types -----
export interface SendSmsRequest {
  senderId: string;
  message: string;
  recipients: string[];  // Array of phone numbers
  type?: 'instant' | 'scheduled';
  scheduleDate?: string; // ISO date string for scheduled SMS
  scheduleTime?: string; // HH:mm format
  repeat?: boolean;
}

export interface SmsResponse {
  success: boolean;
  message: string;
  messageId?: string;
  unitsUsed?: number;
  totalRecipients?: number;
  failedRecipients?: string[];
}

export interface SmsBalance {
  balance: number;
  currency: string;
  unitsRemaining: number;
}

// ----- SMS Calculation Helpers -----

/**
 * Calculate the number of SMS units based on message length
 * Standard SMS: 160 characters (7-bit GSM)
 * Unicode SMS: 70 characters
 * Concatenated SMS: 153 chars per segment (7 chars used for headers)
 */
export const calculateSmsUnits = (message: string): { units: number; charsPerUnit: number; isUnicode: boolean } => {
  const isUnicode = hasUnicodeCharacters(message);
  const messageLength = message.length;
  
  if (isUnicode) {
    // Unicode SMS
    if (messageLength <= 70) {
      return { units: 1, charsPerUnit: 70, isUnicode: true };
    } else {
      // Concatenated unicode: 67 chars per segment
      return { units: Math.ceil(messageLength / 67), charsPerUnit: 67, isUnicode: true };
    }
  } else {
    // GSM 7-bit encoding
    if (messageLength <= 160) {
      return { units: 1, charsPerUnit: 160, isUnicode: false };
    } else {
      // Concatenated: 153 chars per segment
      return { units: Math.ceil(messageLength / 153), charsPerUnit: 153, isUnicode: false };
    }
  }
};

/**
 * Check if message contains unicode (non-GSM) characters
 */
export const hasUnicodeCharacters = (text: string): boolean => {
  // GSM 7-bit character set (basic + extension)
  const gsmChars = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1BÆæßÉ !"#¤%&'()*+,\-.\/0-9:;<=>?¡A-Za-zÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/;
  return !gsmChars.test(text);
};

/**
 * Calculate total SMS cost
 * @param message - The SMS message
 * @param recipientCount - Number of recipients
 * @param costPerUnit - Cost per SMS unit (default 4 Naira)
 */
export const calculateSmsCost = (
  message: string, 
  recipientCount: number, 
  costPerUnit: number = 4
): { totalUnits: number; totalCost: number; unitsPerMessage: number } => {
  const { units } = calculateSmsUnits(message);
  const totalUnits = units * recipientCount;
  const totalCost = totalUnits * costPerUnit;
  
  return { 
    totalUnits, 
    totalCost, 
    unitsPerMessage: units 
  };
};

/**
 * Format phone number to standard format (Nigeria example)
 * Converts 0801... to 234801...
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Nigerian numbers
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  }
  
  // Handle numbers starting with +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Valid if 10-15 digits
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Parse and validate a comma-separated list of phone numbers
 */
export const parsePhoneNumbers = (input: string): { valid: string[]; invalid: string[] } => {
  const numbers = input.split(',').map(n => n.trim()).filter(n => n.length > 0);
  const valid: string[] = [];
  const invalid: string[] = [];
  
  numbers.forEach(num => {
    const formatted = formatPhoneNumber(num);
    if (isValidPhoneNumber(formatted)) {
      valid.push(formatted);
    } else {
      invalid.push(num);
    }
  });
  
  // Remove duplicates
  return {
    valid: [...new Set(valid)],
    invalid
  };
};

// ----- API Functions -----

/**
 * Send instant SMS
 */
export const sendInstantSms = async (data: SendSmsRequest): Promise<SmsResponse> => {
  try {
    const response = await apiClient.post(env.endpoints.sendSms, {
      sender_id: data.senderId,
      message: data.message,
      recipients: data.recipients,
      type: 'instant'
    });
    
    return {
      success: true,
      message: response.data.message || 'SMS sent successfully',
      messageId: response.data.message_id,
      unitsUsed: response.data.units_used,
      totalRecipients: response.data.total_recipients,
      failedRecipients: response.data.failed_recipients
    };
  } catch (error: any) {
    console.error('Send SMS error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to send SMS'
    };
  }
};

/**
 * Schedule SMS for later delivery
 */
export const scheduleSms = async (data: SendSmsRequest): Promise<SmsResponse> => {
  try {
    if (!data.scheduleDate || !data.scheduleTime) {
      return {
        success: false,
        message: 'Schedule date and time are required'
      };
    }
    
    const response = await apiClient.post(env.endpoints.scheduleSms, {
      sender_id: data.senderId,
      message: data.message,
      recipients: data.recipients,
      schedule_date: data.scheduleDate,
      schedule_time: data.scheduleTime,
      repeat: data.repeat || false
    });
    
    return {
      success: true,
      message: response.data.message || 'SMS scheduled successfully',
      messageId: response.data.message_id,
      unitsUsed: response.data.units_used,
      totalRecipients: response.data.total_recipients
    };
  } catch (error: any) {
    console.error('Schedule SMS error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to schedule SMS'
    };
  }
};

/**
 * Get SMS balance/units
 */
export const getSmsBalance = async (): Promise<SmsBalance | null> => {
  try {
    const response = await apiClient.get(env.endpoints.getSmsBalance);
    
    return {
      balance: response.data.balance || 0,
      currency: response.data.currency || 'NGN',
      unitsRemaining: response.data.units || 0
    };
  } catch (error: any) {
    console.error('Get SMS balance error:', error);
    return null;
  }
};

export default {
  sendInstantSms,
  scheduleSms,
  getSmsBalance,
  calculateSmsUnits,
  calculateSmsCost,
  parsePhoneNumbers,
  formatPhoneNumber,
  isValidPhoneNumber,
  hasUnicodeCharacters
};
