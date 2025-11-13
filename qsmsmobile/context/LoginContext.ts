import { createContext } from "react";

type LoginContextShape = {
  login: any;
  setLogin: (user: any) => void;
};

export const LoginContext = createContext<LoginContextShape>({
  login: null,
  setLogin: (_user: any) => {},
});
