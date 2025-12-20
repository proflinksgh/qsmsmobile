import * as Device from 'expo-device';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

export interface DeviceInfo {
  deviceName: string;
  deviceModel: string;
  brand: string;
  osName: string;
  osVersion: string;
  deviceType: string;
}

export interface NetworkInfo {
  ipAddress: string | null;
  isConnected: boolean;
  networkType: string | null;
}

/**
 * Get device information (brand, model, OS)
 */
export function getDeviceInfo(): DeviceInfo {
  const deviceType = Device.deviceType === Device.DeviceType.PHONE
    ? 'Phone'
    : Device.deviceType === Device.DeviceType.TABLET
      ? 'Tablet'
      : 'Unknown';

  return {
    deviceName: Device.deviceName || 'Unknown Device',
    deviceModel: Device.modelName || 'Unknown Model',
    brand: Device.brand || 'Unknown Brand',
    osName: Device.osName || Platform.OS,
    osVersion: Device.osVersion || 'Unknown',
    deviceType,
  };
}

/**
 * Get formatted device string for API (e.g., "Samsung Galaxy S21")
 */
export function getDeviceString(): string {
  const info = getDeviceInfo();
  
  // Format: "Brand Model" or "Brand DeviceName"
  if (info.brand && info.deviceModel) {
    return `${info.brand} ${info.deviceModel}`;
  }
  
  if (info.deviceName) {
    return info.deviceName;
  }
  
  return `${info.osName} ${info.deviceType}`;
}

/**
 * Get the device's IP address and network info
 */
export async function getNetworkInfo(): Promise<NetworkInfo> {
  try {
    const ipAddress = await Network.getIpAddressAsync();
    const networkState = await Network.getNetworkStateAsync();
    
    return {
      ipAddress: ipAddress || null,
      isConnected: networkState.isConnected ?? false,
      networkType: networkState.type || null,
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return {
      ipAddress: null,
      isConnected: false,
      networkType: null,
    };
  }
}

/**
 * Get IP address string for API
 */
export async function getIpAddress(): Promise<string> {
  try {
    const ip = await Network.getIpAddressAsync();
    return ip || '0.0.0.0';
  } catch (error) {
    console.error('Error getting IP address:', error);
    return '0.0.0.0';
  }
}
