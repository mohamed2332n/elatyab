import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { showError, showSuccess } from "@/utils/toast";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

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

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (storedUser && token) {
          // Validate token is still valid (in a real app, check with backend)
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
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
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }

      // Mock authentication (in a real app, call backend API)
      // For demo: any email/password combination works, but we store it
      const userData: User = {
        id: `user_${Date.now()}`,
        name: email.split("@")[0],
        email,
        phone: "+91 9876543210",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      // Generate mock token
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("authToken", token);

      setUser(userData);
      showSuccess(`Welcome back, ${userData.name}!`);
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

      if (phone.length < 10) {
        throw new Error("Phone number must be at least 10 digits");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Check if user already exists (in localStorage for demo)
      const existingUsers = JSON.parse(localStorage.getItem("registeredEmails") || "[]");
      if (existingUsers.includes(email)) {
        throw new Error("Email already registered");
      }

      // Mock signup (in a real app, call backend API)
      const userData: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      // Generate mock token
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store email in registered list
      existingUsers.push(email);
      localStorage.setItem("registeredEmails", JSON.stringify(existingUsers));

      // Store user data and token
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("authToken", token);

      setUser(userData);
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

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setError(null);
    showSuccess("Logged out successfully");
  };

  const updateProfile = async (updates: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      const updatedUser = { ...user, ...updates };

      // Store updated user data
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
