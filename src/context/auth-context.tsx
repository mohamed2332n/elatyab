"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/lib/types";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/lib/supabase";
import { apiService } from "@/services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const userData = await apiService.getMe();
      setUser(userData);
    } catch (err) {
      console.error("Profile fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    fetchProfile();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      showError(error.message);
      setLoading(false);
    } else {
      showSuccess("Welcome back!");
    }
  };

  const signup = async (name: string, email: string, phone: string, pass: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name, phone } }
    });

    if (error) {
      showError(error.message);
      setLoading(false);
    } else if (data.user) {
      // Profile trigger 'handle_new_user' handles DB insertion
      showSuccess("Check your email for confirmation!");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    showSuccess("Logged out");
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: updates.name, phone: updates.phone, avatar_url: updates.avatar })
      .eq('id', user.id);
    
    if (error) showError(error.message);
    else {
      setUser({ ...user, ...updates });
      showSuccess("Profile updated");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error: null, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};