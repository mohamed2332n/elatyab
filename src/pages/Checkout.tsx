"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { apiService } from "@/services/api";
import { showError, showSuccess } from "@/utils/toast";
import { MapPin, CreditCard, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePublishableKey } from "@/lib/env";
import { supabase } from "@/integrations/supabase/client";
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
  
  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    if (items.length === 0) navigate("/cart");
  }, [isAuthenticated, items, navigate]);

  const handleInitStripe = async () => {
    if (paymentMethod !== "card" || clientSecret) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: { 
          amount: finalTotal, 
          currency: 'egp',
          metadata: { userId: user?.id, itemCount: items.length }
        },
      });

      if (error || !data.clientSecret) throw new Error(error?.message || "Failed to initialize Stripe");
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      showError("Stripe initialization failed. Please try another method.");
      setPaymentMethod("wallet");
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
        finalTotal
      );

      if (result.success) {
        clearCart();
        showSuccess("Order placed successfully! 🎉");
        navigate(`/orders/${result.orderId}`);
      }
    } catch (error: any) {
      showError(error.message || "Order tracking failed, but payment was successful. Please contact support.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleNonStripeOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const result = await apiService.placeOrder(
        items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        finalTotal
      );

      if (result.success) {
        clearCart();
        showSuccess("Order placed successfully!");
        navigate(`/orders/${result.orderId}`);
      }
    } catch (error: any) {
      showError(error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade pb-20">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="emoji-bounce">🎯</span> {t('checkout')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Address */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Delivery Address</span>
              </h2>
              <div className="p-4 rounded-xl border-2 border-primary bg-primary/5">
                <p className="font-bold text-lg">{user?.name}</p>
                <p className="text-muted-foreground">{user?.address || "123 Nile Street, Maadi, Cairo"}</p>
                <p className="text-sm font-medium mt-2">📱 {user?.phone}</p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Payment Method</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "wallet", label: "Wallet Balance", icon: "💰" },
                  { id: "card", label: "Credit Card", icon: "💳" },
                  { id: "upi", label: "UPI Transfer", icon: "📱" },
                  { id: "cod", label: "Cash on Delivery", icon: "🚚" }
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"
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

              {/* Stripe Payment UI */}
              {paymentMethod === "card" && (
                <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-dashed border-primary/50 animate-in-slide-up">
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm 
                        amount={finalTotal} 
                        clientSecret={clientSecret} 
                        onSuccess={handleOrderSuccess} 
                      />
                    </Elements>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="font-medium">Initializing secure checkout...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div>
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice, i18n.language)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-green-600">{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee, i18n.language)}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-2xl text-primary">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal, i18n.language)}</span>
                </div>
              </div>

              {paymentMethod !== "card" && (
                <Button
                  className="w-full py-7 text-xl font-extrabold group rounded-xl shadow-lg"
                  onClick={handleNonStripeOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>Confirm Order</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </Button>
              )}

              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                  <Lock className="h-3.5 w-3.5" />
                  <span>256-bit SSL Secure Payment</span>
                </div>
                <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;