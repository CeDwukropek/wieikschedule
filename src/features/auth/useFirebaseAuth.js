import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function useFirebaseAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useFirebaseAuth must be used inside AuthProvider");
  return auth;
}
