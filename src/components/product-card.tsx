"use client";

import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
    // In a real app, this would dispatch an action to add to cart
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => Math.max(0, prev - 1));
    // In a real app, this would dispatch an action to remove from cart
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // In a real app, this would dispatch an action to update wishlist
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div 
      className={cn("bg-card rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full cursor-pointer", className)}
      onClick={handleCardClick}
    >
      <div className="relative">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="bg-muted w-full h-32 flex items-center justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          </div>
        )}
        
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercent}% OFF
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full"
          onClick={toggleWishlist}
        >
          <Heart 
            className={cn("h-4 w-4", isWishlisted ? "fill-destructive text-destructive" : "text-foreground")} 
          />
        </Button>
        
        {!isInStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-destructive font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-3 flex-grow flex flex-col">
        <h4 className="font-medium mb-1 line-clamp-2">{name}</h4>
        <p className="text-sm text-muted-foreground mb-2">{weight}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-bold text-lg">₹{discountedPrice}</span>
            {originalPrice > discountedPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">₹{originalPrice}</span>
            )}
          </div>
          
          {quantity === 0 ? (
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center border border-input rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleRemoveFromCart}
              >
                -
              </Button>
              <span className="px-2">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleAddToCart}
              >
                +
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;