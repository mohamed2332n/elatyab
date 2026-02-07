"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { showError } from "@/utils/toast";

interface ProductCardProps {
  id: string;
  name?: string;
  weight?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;
  image?: string;
  isInStock?: boolean;
  className?: string;
}

const ProductCard = ({ 
  id,
  name: initialName,
  weight: initialWeight,
  originalPrice: initialOriginalPrice,
  discountedPrice: initialDiscountedPrice,
  discountPercent: initialDiscountPercent,
  image: initialImage,
  isInStock: initialIsInStock = true,
  className 
}: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [productData, setProductData] = useState({
    name: initialName || "",
    weight: initialWeight || "",
    originalPrice: initialOriginalPrice || 0,
    discountedPrice: initialDiscountedPrice || 0,
    discountPercent: initialDiscountPercent || 0,
    isInStock: initialIsInStock,
    image: initialImage
  });
  const [loading, setLoading] = useState(!initialName);
  
  const navigate = useNavigate();

  // Fetch product data from server if not provided
  useEffect(() => {
    if (!initialName) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const product = await apiService.getProduct(id);
          if (product) {
            setProductData({
              name: product.name,
              weight: product.weight,
              originalPrice: product.originalPrice,
              discountedPrice: product.discountedPrice,
              discountPercent: product.discountPercent,
              isInStock: product.isInStock,
              image: product.images[0]
            });
          }
        } catch (error) {
          showError("Failed to load product data");
          console.error("Error fetching product:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, initialName]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return;
    
    try {
      // Validate with server before adding
      const result = await apiService.addToCart({
        id: id,
        name: productData.name,
        price: productData.discountedPrice,
        image: productData.image,
        weight: productData.weight
      });
      
      if (result.success) {
        setQuantity(prev => prev + 1);
      } else {
        showError("Failed to add item to cart");
      }
    } catch (error) {
      showError("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const handleRemoveFromCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return;
    
    try {
      // Validate with server before removing
      const result = await apiService.removeFromCart(id);
      
      if (result.success) {
        setQuantity(prev => Math.max(0, prev - 1));
      } else {
        showError("Failed to remove item from cart");
      }
    } catch (error) {
      showError("Failed to remove item from cart");
      console.error("Error removing from cart:", error);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // In a real app, this would dispatch an action to update wishlist
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <div className={cn("bg-card rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full", className)}>
        <div className="bg-muted w-full h-32 animate-pulse"></div>
        <div className="p-3 flex-grow flex flex-col">
          <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-3 bg-muted rounded w-1/2 mb-3 animate-pulse"></div>
          <div className="flex items-center justify-between mt-auto">
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
            <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("bg-card rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full cursor-pointer", className)} 
      onClick={handleCardClick}
    >
      <div className="relative">
        {productData.image ? (
          <img src={productData.image} alt={productData.name} className="w-full h-32 object-cover" />
        ) : (
          <div className="bg-muted w-full h-32 flex items-center justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          </div>
        )}
        {productData.discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
            {productData.discountPercent}% OFF
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full"
          onClick={toggleWishlist}
        >
          <Heart className={cn("h-4 w-4", isWishlisted ? "fill-destructive text-destructive" : "text-foreground")} />
        </Button>
        {!productData.isInStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-destructive font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3 flex-grow flex flex-col">
        <h4 className="font-medium mb-1 line-clamp-2">{productData.name}</h4>
        <p className="text-sm text-muted-foreground mb-2">{productData.weight}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-bold text-lg">₹{productData.discountedPrice}</span>
            {productData.originalPrice > productData.discountedPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">₹{productData.originalPrice}</span>
            )}
          </div>
          {quantity === 0 ? (
            <Button 
              size="sm" 
              onClick={handleAddToCart} 
              disabled={!productData.isInStock}
            >
              <ShoppingCart className="h-4 w-4 mr-1" /> Add
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