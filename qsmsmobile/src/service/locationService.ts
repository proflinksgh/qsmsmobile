// src/services/locationService.ts
import * as Device from "expo-device";
import * as Location from "expo-location";

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      maximumAge: 10000,
      timeout: 10000,
    });

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };
  } catch (err) {
    console.warn("getUserLocation error", err);
    return null;
  }
}

export function getDeviceInfo() {
  return {
    model: Device.modelName ?? "unknown",
    brand: Device.brand ?? "unknown",
    osName: Device.osName ?? "unknown",
    osVersion: Device.osVersion ?? "unknown",
  };
}
