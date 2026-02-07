"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiService, User } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // SECURE: Check for an opaque token, NOT the full PII object
        const token = localStorage.getItem("session_token");
        if (token) {
          // SECURE: Validate session with server and fetch fresh profile data
          const userData = await apiService.getMe();
          if (userData) {
            setUser(userData);
          } else {
            // Invalid token
            localStorage.removeItem("session_token");
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        localStorage.removeItem("session_token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate authentication request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email === "user@example.com" && password === "password") {
        // SECURE: Store only an opaque session token
        localStorage.setItem("session_token", "mock_secure_jwt_token_12345");
        
        // Fetch fresh profile data to keep in memory
        const userData = await apiService.getMe();
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("session_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}