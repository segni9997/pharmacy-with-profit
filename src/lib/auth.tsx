import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ import decoder
import type { User } from "./types";
import { Provider } from "react-redux";
import { store } from "@/store/store";

interface AuthContextType {
  user: User | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        // 👇 decode JWT
        const decoded: any = jwtDecode(token);
        // Example: your backend must include `id`, `username`, `role`
        const mappedUser: User = {
          id: decoded.user_id || decoded.id,
          username: decoded.username,
          role: decoded.role,
        };

        setUser(mappedUser);
      } catch (e) {
        localStorage.removeItem("access_token");
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// This wrapper combines both Redux and Auth context
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
