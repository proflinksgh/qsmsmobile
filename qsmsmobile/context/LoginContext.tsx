import React, { createContext, useState } from 'react';

type LoginContextShape = {
  login: any;
  setLogin: (user: any) => void;
};

export const LoginContext = createContext<LoginContextShape>({
  login: null,
  setLogin: (_user: any) => {},
});

// Provider to hold login state across the app
export const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [login, setLogin] = useState<any>(null);

  return (
    <LoginContext.Provider value={{ login, setLogin }}>
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContext;
