"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/components/theme-provider";
import { apiService } from "@/services/api";
import { showError, showSuccess } from "@/utils/toast";
import { useAuth } from "@/context/auth-context";

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    } else if (!authLoading && isAuthenticated && items.length === 0) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, items, navigate]);

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsPlacingOrder(true);
    try {
      // Validate and place order with server
      const result = await apiService.placeOrder(
        items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        finalTotal
      );
      if (result.success) {
        clearCart();
        showSuccess("Order placed successfully!");
        navigate(`/orders/${result.orderId}`);
      } else {
        showError("Failed to place order");
      }
    } catch (error) {
      showError("Failed to place order");
      console.error("Error placing order:", error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You must be logged in to checkout</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-muted w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add items to your cart before checking out</p>
            <Button onClick={() => navigate("/")}>Start Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <div className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Home</p>
                    <p className="text-muted-foreground mt-1">
                      123 Main Street, Apartment 4B<br />
                      New Delhi, 110001
                    </p>
                  </div>
                  <Button variant="link">Change</Button>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: "wallet", name: "Wallet", description: "₹1,500 available" },
                  { id: "upi", name: "UPI", description: "Google Pay, PhonePe, etc." },
                  { id: "card", name: "Credit/Debit Card", description: "Visa, Mastercard, etc." },
                  { id: "cod", name: "Cash on Delivery", description: "" }
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted ${
                      paymentMethod === method.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div>
                      <p className="font-medium">{method.name}</p>
                      {method.description && (
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border border-input ${
                        paymentMethod === method.id ? "bg-primary" : ""
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Order Summary */}
          <div>
            <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p>₹{item.price * item.quantity}</p>
                  </div>
                ))}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </Button>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  By placing your order, you agree to our Terms and Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;