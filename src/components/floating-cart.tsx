"use client";

import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

const FloatingCart = () => {
  const { getTotalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cartCount = getTotalItems();

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3">
      {/* Wishlist Button */}
      {user && (
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          onClick={() => navigate("/wishlist")}
          title="Wishlist"
        >
          <Heart className="h-6 w-6" />
        </Button>
      )}
      
      {/* Cart Button */}
      {cartCount > 0 && (
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          onClick={() => navigate("/cart")}
          title="Shopping Cart"
        >
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export default FloatingCart;