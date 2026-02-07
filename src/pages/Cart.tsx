"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    toast.success("🚀 Taking you to checkout...");
    // In a real app, this would navigate to checkout
    setTimeout(() => {
      setIsCheckingOut(false);
      navigate("/checkout");
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
          <div className="text-center max-w-md space-y-4">
            <div className="text-7xl emoji-float mb-6">🛒</div>
            <h2 className="text-3xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground text-lg mb-6">
              😢 Looks like you haven't added any items to your cart yet
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">How about these fresh products?</p>
              <Button 
                onClick={() => navigate("/")}
                size="lg"
                className="w-full gap-2 hover:scale-105 transition-transform"
              >
                <span>🌱</span> Start Shopping <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;
  const { lang } = useLang();

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow" role="main">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 animate-in-slide-up">
          <span className="emoji-bounce">🛍️</span> Your Cart
        </h1>
        <p className="text-muted-foreground mb-6">
          <span className="emoji-bounce">{totalItems}</span> {totalItems === 1 ? "item" : "items"} in your cart
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-md">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors list-item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-lg transition-transform hover:scale-110"
                    />
                  ) : (
                    <div className="bg-muted w-16 h-16 rounded-lg flex items-center justify-center text-3xl">
                      🥕
                    </div>
                  )}
                  
                  {/* Product Info */}
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">📦 {item.weight}</p>
                    <p className="font-bold text-green-600 mt-1">{formatPrice(item.price, lang)}</p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-primary/5 rounded-full px-2 py-1 border border-primary/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-primary/20 transition-all"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      title="Decrease quantity"
                    >
                      <span className="text-lg">−</span>
                    </Button>
                    <span className="px-3 font-semibold min-w-[35px] text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-primary/20 transition-all"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      title="Increase quantity"
                    >
                      <span className="text-lg">+</span>
                    </Button>
                  </div>
                  
                  {/* Subtotal and Remove */}
                  <div className="ml-4 text-right min-w-[80px]">
                    <p className="font-bold text-lg">{formatPrice(item.price * item.quantity, lang)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                      onClick={() => {
                        removeItem(item.id);
                        toast.success(`✅ ${item.name} removed from cart`);
                      }}
                      title="Remove from cart"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-4">
              <Button 
                variant="outline"
                className="w-full gap-2 transition-all hover:translate-x-1"
                onClick={() => navigate("/")}
              >
                <span>←</span> Continue Shopping
              </Button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6 sticky top-20 shadow-lg card-animate">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="emoji-bounce">📋</span> Order Summary
              </h2>
              
              <div className="space-y-3 mb-6 text-sm">
                {/* Subtotal */}
                <div className="flex justify-between items-center pb-2 border-b border-border/20">
                  <span className="flex items-center gap-2">
                    <span>🛒</span> Subtotal
                  </span>
                  <span className="font-semibold">{formatPrice(totalPrice, lang)}</span>
                </div>

                {/* Delivery Fee */}
                <div className="flex justify-between items-center pb-2 border-b border-border/20">
                  <span className="flex items-center gap-2">
                    <span>🚚</span> Delivery Fee
                  </span>
                  <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                    {deliveryFee === 0 ? (
                      <span className="emoji-bounce">FREE ✨</span>
                    ) : (
                      formatPrice(deliveryFee, lang)
                    )}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 bg-primary/10 rounded-lg px-3 py-2">
                  <span className="font-bold text-base">Total Amount</span>
                  <span className="font-bold text-xl text-primary">{formatPrice(finalTotal, lang)}</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Button 
                className="w-full font-bold text-base py-6 gap-2 hover:scale-105 transition-transform active:scale-95"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <span className="emoji-spin">⏳</span> Processing...
                  </>
                ) : (
                  <>
                    <span>🎯</span> Proceed to Checkout
                  </>
                )}
              </Button>
              
              {/* Free Delivery Message */}
              <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-black/20 text-center">
                {deliveryFee > 0 ? (
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    <span className="emoji-bounce">🎉</span> Add {formatPrice(500 - totalPrice, lang)} more for FREE delivery!
                  </p>
                ) : (
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                    <span className="emoji-bounce">✨</span> You get FREE delivery!
                  </p>
                )}
              </div>

              {/* Money Back Guarantee */}
              <div className="mt-4 pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground text-center">
                  <span className="emoji-wiggle">💳</span> Secure payment guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;