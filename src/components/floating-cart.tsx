"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";

const FloatingCart = () => {
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const cartCount = getTotalItems();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        size="lg"
        className="rounded-full w-14 h-14 shadow-lg"
        onClick={() => navigate("/cart")}
      >
        <ShoppingCart className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default FloatingCart;