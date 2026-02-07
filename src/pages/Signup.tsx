"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signup(formData.name, formData.email, formData.phone, formData.password);
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      icon: "👤",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
      icon: "📧",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "+91 9876543210",
      icon: "📱",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background animate-in-fade p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl emoji-bounce mb-4">🌱</div>
          <h1 className="text-3xl font-bold">Join Us</h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name, Email, Phone Fields */}
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-2">
                <span>{field.icon}</span> {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  errors[field.name]
                    ? "border-destructive focus:ring-destructive"
                    : "border-input focus:ring-primary"
                } bg-background focus:outline-none focus:ring-2`}
              />
              {errors[field.name] && (
                <p className="text-destructive text-sm mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-2">🔐 Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium mb-2">✓ Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  errors.confirmPassword
                    ? "border-destructive focus:ring-destructive"
                    : "border-input focus:ring-primary"
                } bg-background focus:outline-none focus:ring-2`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input type="checkbox" id="terms" className="mt-1" required />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the <span className="text-primary hover:underline cursor-pointer">Terms and Conditions</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-base font-medium gap-2 hover:scale-105 transition-transform active:scale-95"
          >
            {isLoading ? (
              <>
                <span className="emoji-spin">⏳</span> Creating Account...
              </>
            ) : (
              <>
                <span>🎉</span> Create Account
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="px-3 text-muted-foreground text-sm">already have an account?</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Login Link */}
        <p className="text-center text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login Here
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

export default Signup;
