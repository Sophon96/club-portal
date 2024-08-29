import { createContext, PropsWithChildren, useContext } from "react";
import { AuthInfo } from "~/auth.server";

const AuthContext = createContext(null as AuthInfo | null);

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps extends PropsWithChildren {
  user: AuthInfo | null;
}

export function AuthProvider({ children, user }: AuthProviderProps) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
