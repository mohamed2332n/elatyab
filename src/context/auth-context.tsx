"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/lib/types";
import { showError, showSuccess } from "@/utils/toast";
import { apiService } from "@/services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiService.getMe();
        if (userData) setUser(userData);
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
    try {
      const success = await apiService.login(email, password);
      if (success) {
        const userData = await apiService.getMe();
        setUser(userData);
        showSuccess("Welcome back!");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err: any) {
      showError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    setLoading(true);
    try {
      const userData: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        phone,
        address: "",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      // In a real app, send to server
      setUser(userData);
      showSuccess("Account created successfully!");
    } catch (err: any) {
      showError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    showSuccess("Logged out successfully");
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
    showSuccess("Profile updated!");
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};