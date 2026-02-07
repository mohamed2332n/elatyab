"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { apiService } from "@/services/api";
import { showError, showSuccess } from "@/utils/toast";
import { MapPin, CreditCard, Lock, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";
import { loadStripe } from "@stripe/stripe-js";
import { getStripePublishableKey } from "@/lib/env";
import { supabase } from "@/integrations/supabase/client";

const stripePromise = loadStripe(getStripePublishableKey());

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  
  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    if (items.length === 0) navigate("/cart");
  }, [isAuthenticated, items, navigate]);

  const handleStripePayment = async () => {
    try {
      // 1. Create PaymentIntent via Edge Function
      const { data, error: funcError } = await supabase.functions.invoke('stripe-payment', {
        body: { 
          amount: finalTotal, 
          currency: 'egp',
          metadata: { userId: user?.id, itemCount: items.length }
        },
      });

      if (funcError || !data.clientSecret) {
        throw new Error(funcError?.message || "Failed to initialize Stripe");
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      // 2. Confirm Payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: {
            // Note: In a real app, you'd use Stripe Elements CardElement component here
            // This is a simplified redirect-style or element-style integration point
          },
          billing_details: {
            name: user?.name,
            email: user?.email,
          },
        },
      });

      if (stripeError) throw new Error(stripeError.message);
      
      return paymentIntent.status === 'succeeded';
    } catch (err: any) {
      showError(err.message);
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      if (paymentMethod === "card") {
        // Since we don't have the full Stripe Elements UI here yet, 
        // we'll simulate the successful redirect/intent flow for this prototype.
        // In a production app, you would render the <CardElement /> from @stripe/react-stripe-js.
        const paymentSuccessful = await handleStripePayment();
        if (!paymentSuccessful) {
          setIsPlacingOrder(false);
          return;
        }
      }

      const result = await apiService.placeOrder(
        items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        finalTotal
      );

      if (result.success) {
        clearCart();
        showSuccess("Order placed successfully!");
        navigate(`/orders/${result.orderId}`);
      } else {
        showError("Failed to place order");
      }
    } catch (error: any) {
      showError(error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <span className="emoji-bounce">🎯</span> {t('checkout')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 card-animate">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Delivery Address</span>
              </h2>
              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.address || "123 Main St, New Delhi"}</p>
                <p className="text-sm text-muted-foreground mt-2">📱 {user?.phone}</p>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 card-animate">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Method</span>
              </h2>
              <div className="space-y-3">
                {[
                  { id: "wallet", label: "Wallet Balance", icon: "💰" },
                  { id: "card", label: "Credit / Debit Card (Stripe)", icon: "💳" },
                  { id: "upi", label: "UPI Payment", icon: "📱" },
                  { id: "cod", label: "Cash on Delivery", icon: "🚚" }
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id ? "border-primary bg-primary/5 shadow-inner" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? "border-primary" : "border-input"}`}>
                      {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card rounded-lg border border-border p-6 sticky top-20 shadow-lg card-animate">
              <h2 className="text-2xl font-bold mb-4">Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice, i18n.language)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee, i18n.language)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg text-primary">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal, i18n.language)}</span>
                </div>
              </div>

              <Button
                className="w-full py-6 text-lg font-bold group"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </Button>
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground bg-muted/50 py-2 rounded">
                <Lock className="h-3 w-3" />
                <span>Secure SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;