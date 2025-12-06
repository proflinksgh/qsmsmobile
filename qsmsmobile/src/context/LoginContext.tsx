import React, { createContext, useEffect, useState } from "react";
import { onAuthState } from "../firebase/auth";

type LoginContextShape = {
  login: boolean;
  setLogin: (value: boolean) => void;
  user: any | null;
};

export const LoginContext = createContext<LoginContextShape>({
  login: false,
  setLogin: () => {},
  user: null,
});

export const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [login, setLogin] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Use the async onAuthState helper which initializes the auth instance
    // and returns the unsubscribe function. Guard against race conditions.
    let unsub: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        const result = await onAuthState((u) => {
          setUser(u);
          setLogin(!!u);
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
