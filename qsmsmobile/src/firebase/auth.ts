import { getApps, initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    type User,
} from "firebase/auth";
import firebaseConfig from "./firebaseConfig";

let app: any;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// auth may be initialized with RN persistence or fallback to getAuth
let auth: any = null;

async function initAuthInstance() {
  if (auth) return auth;

  // Try to initialize React Native persistence dynamically.
  try {
    // dynamic import to avoid bundler issues when module isn't available
    // TypeScript may not have types for this entry — ignore if missing.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rnAuth = await import("firebase/auth/react-native");
    const AsyncStorageModule = await import("@react-native-async-storage/async-storage");
    const AsyncStorage = AsyncStorageModule.default || AsyncStorageModule;
    auth = rnAuth.initializeAuth(app, {
      persistence: rnAuth.getReactNativePersistence(AsyncStorage),
    });
    return auth;
  } catch (e) {
    // If react-native entry isn't available, fallback to standard getAuth
    auth = getAuth(app);
    return auth;
  }
}

export async function signIn(email: string, password: string) {
  const a = await initAuthInstance();
  const res = await signInWithEmailAndPassword(a, email, password);
  return res.user as User;
}

export async function register(email: string, password: string) {
  const a = await initAuthInstance();
  const res = await createUserWithEmailAndPassword(a, email, password);
  return res.user as User;
}

export async function signOut() {
  const a = await initAuthInstance();
  return firebaseSignOut(a);
}

export async function onAuthState(cb: (user: User | null) => void) {
  const a = await initAuthInstance();
  return onAuthStateChanged(a, cb);
}

export async function getAuthInstance() {
  return await initAuthInstance();
}

// Note: some existing call sites import { auth } directly; provide a getter
export { auth };

