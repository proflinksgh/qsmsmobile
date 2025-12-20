declare module "*.png";
declare module "*.jpg"
declare module "*.ico";

// Firebase Auth React Native persistence - Firebase 12.x
// getReactNativePersistence is exported from @firebase/auth (RN build via react-native field)
// but TypeScript doesn't see it from the browser types. This augments the module.
import "@firebase/auth";
declare module "@firebase/auth" {
  interface ReactNativeAsyncStorage {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  }
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): import("@firebase/auth").Persistence;
}