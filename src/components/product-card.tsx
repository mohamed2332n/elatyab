"use client";

import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  weight: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  image?: string;
  isInStock?: boolean;
  className?: string;
}

const ProductCard = ({ 
  id,
  name,
  weight,
  originalPrice,
  discountedPrice,
  discountPercent,
  image,
  isInStock = true,
  className 
}: ProductCardProps) => {
  const { t, i18n } = useTranslation();
  const { addItem, updateQuantity, items } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const isFavorite = isInWishlist(id);
  const cartItem = items.find(i => i.id === id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id, name, price: discountedPrice, image, weight });
    toast.success(t('addedToCart'));
  };

  const handleAdjustQuantity = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    updateQuantity(id, quantity + delta);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <div 
      className={cn("bg-card rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md transition-all card-animate", className)} 
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="relative">
        <img src={image || "/placeholder.svg"} alt={name} className="w-full h-40 object-cover" />
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-destructive text-white text-xs font-bold px-2 py-1 rounded animate-pop-in">
            {discountPercent}% {t('off')}
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "absolute top-2 right-2 rtl:right-auto rtl:left-2 rounded-full transition-all",
            isFavorite ? "bg-destructive/20 hover:bg-destructive/30" : "bg-background/80 hover:bg-background"
          )}
          onClick={handleToggleWishlist}
        >
          <span className={cn("text-lg", isFavorite && "emoji-heartbeat")}>
            {isFavorite ? "❤️" : "🤍"}
          </span>
        </Button>
      </div>

      <div className="p-3 flex-grow flex flex-col">
        <h4 className="font-semibold mb-1 line-clamp-2">{name}</h4>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <span>📦</span> {weight}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-bold text-lg text-green-600">{formatPrice(discountedPrice, i18n.language)}</span>
            {originalPrice > discountedPrice && (
              <span className="text-xs text-muted-foreground line-through block">
                {formatPrice(originalPrice, i18n.language)}
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <Button size="sm" onClick={handleAddToCart} disabled={!isInStock} className="hover:scale-105 transition-transform">
              <ShoppingCart className="h-4 w-4 mr-1 rtl:mr-0 rtl:ml-1" /> {t('add')}
            </Button>
          ) : (
            <div className="flex items-center border border-primary/30 rounded-full bg-primary/5 px-1 h-8">
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => handleAdjustQuantity(e, -1)}>
                <span className="text-lg">−</span>
              </Button>
              <span className="px-2 text-sm font-bold">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => handleAdjustQuantity(e, 1)}>
                <span className="text-lg">+</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;