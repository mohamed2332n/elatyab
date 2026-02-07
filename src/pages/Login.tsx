"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background animate-in-fade p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl emoji-bounce mb-4">🛒</div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Login to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                errors.email
                  ? "border-destructive focus:ring-destructive"
                  : "border-input focus:ring-primary"
              } bg-background focus:outline-none focus:ring-2`}
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="••••••••"
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  errors.password
                    ? "border-destructive focus:ring-destructive"
                    : "border-input focus:ring-primary"
                } bg-background focus:outline-none focus:ring-2`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-base font-medium gap-2 hover:scale-105 transition-transform active:scale-95"
          >
            {isLoading ? (
              <>
                <span className="emoji-spin">⏳</span> Logging in...
              </>
            ) : (
              <>
                <span>🚀</span> Login
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="px-3 text-muted-foreground text-sm">or</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium mb-2">📝 Demo Credentials:</p>
          <p className="text-xs text-muted-foreground">Email: demo@example.com</p>
          <p className="text-xs text-muted-foreground">Password: demo123</p>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </p>

        {/* Back Home */}
        <p className="text-center mt-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
          >
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
