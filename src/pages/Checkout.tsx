"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { apiService } from "@/services/api";
import { showError, showSuccess } from "@/utils/toast";
import { MapPin, CreditCard, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [selectedAddressId, setSelectedAddressId] = useState("default");
  
  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    if (items.length === 0) navigate("/cart");
  }, [isAuthenticated, items, navigate]);

  const handlePlaceOrder = async () => {
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
                {["wallet", "upi", "card", "cod"].map((method) => (
                  <div
                    key={method}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === method ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <span className="capitalize font-medium">{method}</span>
                    <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === method ? "bg-primary border-primary" : "border-input"}`}></div>
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
                className="w-full py-6 text-lg font-bold"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </Button>
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;