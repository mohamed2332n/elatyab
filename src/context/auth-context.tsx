"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { showError, showSuccess } from "@/utils/toast";
import { apiService, User } from "@/services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiService.getMe();
        if (userData) {
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const success = await apiService.login(email, password);
      if (success) {
        const userData = await apiService.getMe();
        setUser(userData);
        showSuccess(`Welcome back!`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.signup(name, email, phone, password);
      showSuccess("Account created successfully! 🎉 Please log in.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setError(null);
      showSuccess("Logged out successfully");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("No user logged in");
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      showSuccess("Profile updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Profile update failed";
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};