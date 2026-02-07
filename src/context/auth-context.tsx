"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { showError, showSuccess } from "@/utils/toast";
import { authService } from "@/services/supabase/auth";
import { supabase } from "@/config/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  // Check if user is logged in and get profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
<<<<<<< HEAD
        const { data: { user: authUser } } = await supabase.auth.getUser();
=======
        // Check if Supabase is properly configured
        if (!supabase || !supabase.auth) {
          console.warn("⚠️ Supabase not configured. Running in demo mode.");
          setLoading(false);
          return;
        }

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.warn("⚠️ Auth check failed:", authError.message);
          setLoading(false);
          return;
        }
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
        
        if (authUser) {
          // Get full profile from database
          const { data: profile, error: profileError } = await authService.getUserProfile(authUser.id);
          
          if (!profileError && profile) {
            setUser({
              id: profile.id,
              name: profile.name || authUser.user_metadata?.name || '',
              email: profile.email || authUser.email || '',
              phone: profile.phone || '',
              avatar: profile.avatar_url,
<<<<<<< HEAD
              address: profile.address || '',
=======
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
            });
          } else {
            // Fallback to auth user info
            setUser({
              id: authUser.id,
              name: authUser.user_metadata?.name || '',
              email: authUser.email || '',
              phone: authUser.user_metadata?.phone || '',
            });
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

<<<<<<< HEAD
    // Listen for auth changes
=======
    // Listen for auth changes only if Supabase is configured
    if (!supabase || !supabase.auth) {
      return;
    }

>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await authService.getUserProfile(session.user.id);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name || session.user.user_metadata?.name || '',
            email: profile.email || session.user.email || '',
            phone: profile.phone || '',
            avatar: profile.avatar_url,
<<<<<<< HEAD
            address: profile.address || '',
=======
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }

      // Sign in with Supabase
      const { data, error: signInError } = await authService.signIn(email, password);
      
      if (signInError) throw signInError;
      if (!data.user) throw new Error("Sign in failed");

      // Get profile
      const { data: profile, error: profileError } = await authService.getUserProfile(data.user.id);
      
      if (!profileError && profile) {
        setUser({
          id: profile.id,
          name: profile.name || data.user.user_metadata?.name || '',
          email: profile.email || data.user.email || '',
          phone: profile.phone || '',
          avatar: profile.avatar_url,
<<<<<<< HEAD
          address: profile.address || '',
=======
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
        });
      }

      showSuccess(`Welcome back, ${data.user.email.split("@")[0]}!`);
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
      // Validate inputs
      if (!name || !email || !phone || !password) {
        throw new Error("All fields are required");
      }

      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }

      if (phone.replace(/\D/g, '').length < 10) {
        throw new Error("Phone number must be at least 10 digits");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Sign up with Supabase
      const { data, error: signUpError } = await authService.signUp(email, password, name, phone);
      
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Sign up failed");

      // Set user state with name and phone
      setUser({
        id: data.user.id,
        name,
        email,
        phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      });

      showSuccess("Account created successfully! 🎉");
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
      await authService.signOut();
      setUser(null);
      setError(null);
      showSuccess("Logged out successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      showError(message);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      // Update profile in Supabase
      const { data, error: updateError } = await authService.updateProfile(user.id, {
        name: updates.name,
        phone: updates.phone,
        avatar_url: updates.avatar,
<<<<<<< HEAD
        address: updates.address,
=======
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
      });

      if (updateError) throw updateError;

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