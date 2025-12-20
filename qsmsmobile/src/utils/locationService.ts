import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  address?: string;
  timestamp: number;
}

const LOCATION_STORAGE_KEY = 'user_location';
const LOCATION_UPDATE_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Request permission and get user's current location
 */
export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Optionally reverse geocode to get city/country (requires additional setup)
    // For now, just return coordinates
    const userLocation: UserLocation = {
      latitude,
      longitude,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(userLocation));
    return userLocation;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

/**
 * Get the last stored location
 */
export async function getStoredLocation(): Promise<UserLocation | null> {
  try {
    const data = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving location:', error);
    return null;
  }
}

/**
 * Check if location needs to be updated (30-60 days passed)
 */
export async function shouldUpdateLocation(): Promise<boolean> {
  try {
    const stored = await getStoredLocation();
    if (!stored) return true;

    const daysSinceLastUpdate = (Date.now() - stored.timestamp) / (24 * 60 * 60 * 1000);
    return daysSinceLastUpdate >= 30;
  } catch (error) {
    console.error('Error checking location update status:', error);
    return true;
  }
}

/**
 * Update location and store it
 */
export async function updateUserLocation(): Promise<UserLocation | null> {
  try {
    const shouldUpdate = await shouldUpdateLocation();
    if (!shouldUpdate) {
      return await getStoredLocation();
    }

    return await getUserLocation();
  } catch (error) {
    console.error('Error updating location:', error);
    return null;
  }
}

/**
 * Clear stored location
 */
export async function clearStoredLocation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing location:', error);
  }
}
