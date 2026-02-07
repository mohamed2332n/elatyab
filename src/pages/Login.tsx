"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "البريد الإلكتروني مطلوب";
    if (!password) newErrors.password = "كلمة المرور مطلوبة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorType(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      console.error("Login error details:", err);
      if (err.message?.includes("Email not confirmed")) {
        setErrorType("unconfirmed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await apiService.resendConfirmationEmail(email);
      toast.success("تم إرسال رابط تأكيد جديد لبريدك الإلكتروني.");
    } catch (err: any) {
      if (err.message?.includes("rate limit") || err.status === 429) {
        toast.error("تم تجاوز حد الإرسال. يرجى المحاولة لاحقاً.");
      } else {
        toast.error("فشل إرسال الرابط. يرجى المحاولة لاحقاً.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background animate-in-fade p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl emoji-bounce mb-4">🛒</div>
          <h1 className="text-3xl font-bold">مرحباً بعودتك</h1>
          <p className="text-muted-foreground mt-2">قم بتسجيل الدخول لمتابعة التسوق</p>
        </div>

        {errorType === "unconfirmed" && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl animate-in-slide-down">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-800">البريد الإلكتروني لم يتم تأكيده</p>
                <p className="text-xs text-orange-700 mt-1">يرجى الضغط على الرابط المرسل لبريدك الإلكتروني.</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-orange-800 font-bold underline mt-2 text-xs"
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? "جاري الإرسال..." : "إعادة إرسال رابط التأكيد"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">📧 البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">🔐 كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full py-6 text-base font-bold gap-2">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "دخول 🚀"}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link to="/signup" className="text-primary font-bold hover:underline">انضم إلينا ✨</Link>
        </p>

        <p className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← العودة للرئيسية</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;