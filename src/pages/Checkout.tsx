"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { apiService } from "@/services/api";
import { showError, showSuccess } from "@/utils/toast";
import { MapPin, CreditCard, Lock, Loader2, ArrowLeft, Smartphone, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePublishableKey } from "@/lib/env";
import StripePaymentForm from "@/components/stripe-payment-form";

const stripePromise = loadStripe(getStripePublishableKey());

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isInitializingStripe, setIsInitializingStripe] = useState(false);
  
  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;

  // Supabase Project ID for the hardcoded URL
  const PROJECT_ID = "dtuagfxysqmdprriyxzs";
  const EDGE_FUNCTION_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/stripe-payment`;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    if (items.length === 0) navigate("/cart");
  }, [isAuthenticated, items, navigate]);

  const handleInitStripe = async () => {
    if (paymentMethod !== "card" || clientSecret) return;
    
    setIsInitializingStripe(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const session = await supabase.auth.getSession();
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ 
          amount: finalTotal, 
          currency: 'egp',
          metadata: { userId: user?.id, itemCount: items.length }
        }),
      });

      const data = await response.json();

      if (data.error || !data.clientSecret) {
        throw new Error(data.error || "Could not connect to payment server.");
      }
      
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error("Stripe Error:", err);
      showError("خطأ في الاتصال بخادم الدفع. تأكد من إعداد المفاتيح السرية.");
      setPaymentMethod("wallet"); 
    } finally {
      setIsInitializingStripe(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === "card") {
      handleInitStripe();
    }
  }, [paymentMethod]);

  const handleOrderSuccess = async () => {
    setIsPlacingOrder(true);
    try {
      const result = await apiService.placeOrder(
        items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        finalTotal,
        paymentMethod,
        user?.address || "Maadi, Cairo"
      );

      if (result.success) {
        clearCart();
        showSuccess("تم الدفع وطلبك قيد التنفيذ! 🎉");
        navigate(`/orders/${result.orderId}`);
      }
    } catch (error: any) {
      showError("حدث خطأ أثناء تسجيل الطلب. يرجى التأكد من وجود جداول الطلبات في قاعدة البيانات.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleStandardOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const result = await apiService.placeOrder(
        items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        finalTotal,
        paymentMethod,
        user?.address || "Maadi, Cairo"
      );

      if (result.success) {
        clearCart();
        showSuccess("تم تسجيل طلبك بنجاح!");
        navigate(`/orders/${result.orderId}`);
      }
    } catch (error: any) {
      showError("فشل في إتمام الطلب. يرجى التأكد من إعداد جداول قاعدة البيانات.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade pb-20">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">{t('checkout')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Details */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>عنوان التوصيل</span>
              </h2>
              <div className="p-5 rounded-xl border-2 border-primary/20 bg-primary/5">
                <p className="font-bold text-lg">{user?.name}</p>
                <p className="text-muted-foreground">{user?.address || "المعادي، القاهرة، مصر"}</p>
                <p className="text-sm font-medium mt-2">📞 {user?.phone}</p>
              </div>
            </div>

            {/* Payment Selection */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>اختر طريقة الدفع</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "card", label: "بطاقة ائتمان", icon: <CreditCard className="h-6 w-6" /> },
                  { id: "vodafone", label: "فودافون كاش", icon: <Smartphone className="h-6 w-6 text-red-600" /> },
                  { id: "fawry", label: "فوري", icon: <Hash className="h-6 w-6 text-yellow-500" /> },
                  { id: "wallet", label: "محفظة التطبيق", icon: "💰" },
                  { id: "cod", label: "كاش عند الاستلام", icon: "🚚" }
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-semibold">{method.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stripe Payment Section */}
              {paymentMethod === "card" && (
                <div className="mt-8 p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-primary/30 animate-in-slide-up">
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm 
                        amount={finalTotal} 
                        clientSecret={clientSecret} 
                        onSuccess={handleOrderSuccess} 
                      />
                    </Elements>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-muted-foreground animate-pulse">جاري تجهيز بوابة الدفع الآمنة...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Vodafone Cash Instructions */}
              {paymentMethod === "vodafone" && (
                <div className="mt-8 p-6 bg-red-50 rounded-2xl border-2 border-red-200 animate-in-slide-up">
                  <h3 className="font-bold text-red-700 mb-2">تعليمات فودافون كاش:</h3>
                  <p className="text-sm text-red-600 mb-4">
                    يرجى تحويل مبلغ <strong>{finalTotal} ج.م</strong> إلى الرقم التالي:
                  </p>
                  <div className="bg-white p-4 rounded-lg text-center font-bold text-2xl tracking-widest text-red-600 mb-4 border border-red-100">
                    01012345678
                  </div>
                  <p className="text-xs text-red-500 italic">
                    * بعد التحويل، قم بالضغط على "تأكيد الطلب" وسنقوم بمراجعة العملية خلال دقائق.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div>
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع</span>
                  <span className="font-medium">{formatPrice(totalPrice, i18n.language)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>التوصيل</span>
                  <span className="font-medium text-green-600">{deliveryFee === 0 ? "مجاني" : formatPrice(deliveryFee, i18n.language)}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-2xl text-primary">
                  <span>الإجمالي</span>
                  <span>{formatPrice(finalTotal, i18n.language)}</span>
                </div>
              </div>

              {paymentMethod !== "card" && (
                <Button
                  className="w-full py-7 text-xl font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  onClick={handleStandardOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "تأكيد الطلب"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;