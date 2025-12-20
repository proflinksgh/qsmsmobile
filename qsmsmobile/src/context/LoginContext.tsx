import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { subscribeToAuthState as onAuthState } from "../service/authService";

type LoginContextShape = {
  /** Whether user is currently authenticated */
  login: boolean;
  /** Manually set login state (e.g., after backend registration) */
  setLogin: (value: boolean) => void;
  /** Current Firebase user object, or null if not authenticated */
  user: User | null;
};

export const LoginContext = createContext<LoginContextShape>({
  login: false,
  setLogin: () => {},
  user: null,
});

export const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [login, setLogin] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Use the async onAuthState helper which initializes the auth instance
    // and returns the unsubscribe function. Guard against race conditions.
    let unsub: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        const result = await onAuthState(async (u) => {
          setUser(u);
          
          // Only auto-login if:
          // 1. Firebase user exists
          // 2. Email is verified
          // 3. User has completed backend registration (systemUserId exists)
          if (u && u.emailVerified) {
            const systemUserId = await AsyncStorage.getItem("systemUserId");
            if (systemUserId) {
              setLogin(true);
            } else {
              // Firebase user exists but not registered in backend
              setLogin(false);
            }
          } else {
            setLogin(false);
          }
        });

        if (mounted && typeof result === "function") unsub = result;
      } catch (e) {
        // Ignore; auth may not be initialized yet.
        console.warn("onAuthState subscription failed:", e);
      }
    })();

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  return (
    <LoginContext.Provider value={{ login, setLogin, user }}>
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContext;
