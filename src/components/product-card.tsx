"use client";

import React from "react";
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

const ProductCard = ({ id, name, weight, originalPrice, discountedPrice, discountPercent, image, isInStock = true, className }: ProductCardProps) => {
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

  return (
    <div className={cn("bg-card rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md transition-all group", className)} onClick={() => navigate(`/product/${id}`)}>
      <div className="relative overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={name} className="w-full h-40 object-cover transition-transform group-hover:scale-110" />
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
            {discountPercent}% {t('off')}
          </div>
        )}
        <Button variant="ghost" size="icon" className={cn("absolute top-2 right-2 rtl:right-auto rtl:left-2 rounded-full", isFavorite ? "bg-destructive/20 text-destructive" : "bg-background/80")} onClick={(e) => { e.stopPropagation(); toggleWishlist(id); }}>
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </Button>
      </div>
      <div className="p-3 flex-grow flex flex-col">
        <h4 className="font-semibold text-sm mb-1 line-clamp-2">{name}</h4>
        <p className="text-[10px] text-muted-foreground mb-2">{weight}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-bold text-base text-green-600">{formatPrice(discountedPrice, i18n.language)}</span>
            {originalPrice > discountedPrice && (
              <span className="text-[10px] text-muted-foreground line-through block">{formatPrice(originalPrice, i18n.language)}</span>
            )}
          </div>
          {quantity === 0 ? (
            <Button size="sm" onClick={handleAddToCart} disabled={!isInStock} className="h-8 text-xs font-bold gap-1">
              <ShoppingCart className="h-3 w-3" /> {t('add')}
            </Button>
          ) : (
            <div className="flex items-center border border-primary/30 rounded-full h-8 bg-primary/5 px-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => handleAdjustQuantity(e, -1)}>-</Button>
              <span className="px-2 text-xs font-bold">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => handleAdjustQuantity(e, 1)}>+</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;