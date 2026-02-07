"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCart();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsCheckingOut(true);
    toast.success("🚀 Taking you to checkout...");
    setTimeout(() => {
      setIsCheckingOut(false);
      navigate("/checkout");
    }, 1000);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
          <div className="text-center max-w-md space-y-4">
            <div className="text-7xl emoji-float mb-6">🛒</div>
            <h2 className="text-3xl font-bold mb-2">{t('yourCartIsEmpty')}</h2>
            <Button 
              onClick={() => navigate("/")}
              size="lg"
              className="w-full gap-2 hover:scale-105 transition-transform"
            >
              <span>🌱</span> {t('startShopping')} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 animate-in-slide-up">
          <span className="emoji-bounce">🛍️</span> {t('yourCart')}
        </h1>
        <p className="text-muted-foreground mb-6">
          {totalItems} {t('items')}
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-md">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors list-item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">📦 {item.weight}</p>
                    <p className="font-bold text-green-600 mt-1">{formatPrice(item.price, i18n.language)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-primary/5 rounded-full px-2 py-1 border border-primary/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <span className="text-lg">−</span>
                    </Button>
                    <span className="px-3 font-semibold min-w-[35px] text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <span className="text-lg">+</span>
                    </Button>
                  </div>
                  
                  <div className="ml-4 text-right min-w-[80px]">
                    <p className="font-bold text-lg">{formatPrice(item.price * item.quantity, i18n.language)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline"
              className="w-full gap-2 mt-4"
              onClick={() => navigate("/")}
            >
              <span>←</span> Continue Shopping
            </Button>
          </div>
          
          <div>
            <div className="bg-card rounded-lg border border-border p-6 sticky top-20 shadow-lg card-animate">
              <h2 className="text-2xl font-bold mb-4">{t('total')}</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice, i18n.language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee, i18n.language)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-xl text-primary">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal, i18n.language)}</span>
                </div>
              </div>
              <Button 
                className="w-full py-6 text-lg font-bold"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : t('proceedToCheckout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;