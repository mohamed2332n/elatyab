"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { productsService } from "@/services/supabase/products";
import { wishlistService } from "@/services/supabase/wishlist";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";
import { showError } from "@/utils/toast";

interface ProductCardProps {
  product?: {
    id: string;
    name: string;
    price: number;
    discount: number;
    image: string;
    inStock: boolean;
  };
  id?: string;
  name?: string;
  weight?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;
  image?: string;
  isInStock?: boolean;
  className?: string;
  onAddClick?: () => void;
}

const ProductCard = ({ 
  product,
  id: propId,
  name: initialName,
  weight: initialWeight,
  originalPrice: initialOriginalPrice,
  discountedPrice: initialDiscountedPrice,
  discountPercent: initialDiscountPercent,
  image: initialImage,
  isInStock: initialIsInStock = true,
  className,
  onAddClick
}: ProductCardProps) => {
  const id = product?.id || propId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { lang } = useLang();

  const [quantity, setQuantity] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [productData, setProductData] = useState({
    name: product?.name || initialName || "",
    weight: initialWeight || "",
    originalPrice: initialOriginalPrice || (product?.price || 0),
    discountedPrice: product?.price || initialDiscountedPrice || 0,
    discountPercent: product?.discount || initialDiscountPercent || 0,
    isInStock: product?.inStock ?? initialIsInStock,
    image: product?.image || initialImage
  });
  const [loading, setLoading] = useState(!initialName && !product);
  const [showAddAnimation, setShowAddAnimation] = useState(false);

  // Fetch product data from server if not provided
  useEffect(() => {
    if (!initialName && !product && id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const { data, error } = await productsService.getProduct(id);
          if (!error && data) {
            setProductData({
              name: lang === "ar" ? data.name_ar : data.name_en,
              weight: "",
              originalPrice: data.price,
              discountedPrice: data.price * (1 - data.discount_percentage / 100),
              discountPercent: data.discount_percentage,
              isInStock: data.in_stock,
              image: data.image_url
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
  }, [id, initialName, product, lang]);

  // Check if wishlisted
  useEffect(() => {
    if (user && id) {
      const checkWishlist = async () => {
        const { data } = await wishlistService.isInWishlist(user.id, id);
        setIsWishlisted(data || false);
      };
      checkWishlist();
    }
  }, [user, id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return;
    if (!id) return;
    
    try {
      setShowAddAnimation(true);
      setTimeout(() => setShowAddAnimation(false), 600);

      if (!user) {
        showError("Please log in to add items to cart");
        navigate("/login");
        return;
      }

      const { error } = await addItem({
        product_id: id,
        quantity: 1,
        unit_price: productData.discountedPrice
      });

      if (!error) {
        setQuantity(prev => prev + 1);
        if (onAddClick) onAddClick();
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
    
    if (loading || !id || !user) return;
    
    try {
      // For now, remove from cart by updating quantity to 0
      setQuantity(prev => Math.max(0, prev - 1));
    } catch (error) {
      showError("Failed to remove item from cart");
      console.error("Error removing from cart:", error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user || !id) {
      showError("Please log in to use wishlist");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        const { error } = await wishlistService.removeFromWishlist(user.id, id);
        if (!error) {
          setIsWishlisted(false);
        }
      } else {
        const { error } = await wishlistService.addToWishlist(user.id, id);
        if (!error) {
          setIsWishlisted(true);
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleCardClick = () => {
    if (id) {
      navigate(`/product/${id}`);
    }
  };

  if (loading) {
    return (
      <div className={cn("bg-card rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full animate-in-slide-up", className)}>
        <div className="bg-muted w-full h-32 skeleton"></div>
        <div className="p-3 flex-grow flex flex-col space-y-3">
          <div className="h-4 bg-muted rounded skeleton w-3/4"></div>
          <div className="h-3 bg-muted rounded skeleton w-1/2"></div>
          <div className="flex items-center justify-between mt-auto">
            <div className="h-6 bg-muted rounded skeleton w-1/3"></div>
            <div className="h-8 bg-muted rounded skeleton w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "bg-card rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full cursor-pointer card-animate group",
        "transition-all duration-300 hover:shadow-lg hover:border-primary/50",
        className
      )} 
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden bg-muted">
        {productData.image ? (
          <img 
            src={productData.image} 
            alt={productData.name} 
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110" 
          />
        ) : (
          <div className="bg-muted w-full h-32 flex items-center justify-center group-hover:bg-muted/80 transition-colors">
            <div className="text-4xl emoji-bounce">🥕</div>
          </div>
        )}
        
        {/* Discount Badge */}
        {productData.discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pop-in">
            🎉 {productData.discountPercent}% OFF
          </div>
        )}
        
        {/* Wishlist Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "absolute top-2 right-2 rounded-full transition-all",
            isWishlisted 
              ? "bg-destructive/20 hover:bg-destructive/30" 
              : "bg-background/80 hover:bg-background"
          )}
          onClick={handleToggleWishlist}
        >
          <span className={cn("text-lg", isWishlisted && "emoji-heartbeat")}>
            {isWishlisted ? "❤️" : "🤍"}
          </span>
        </Button>
        
        {/* Out of Stock Overlay */}
        {!productData.isInStock && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center backdrop-blur-sm">
            <span className="text-destructive font-bold text-center">
              😢 Out of Stock
            </span>
          </div>
        )}

        {/* Add to cart animation */}
        {showAddAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-4xl animate-Pop-up emoji-spin">🛒</div>
          </div>
        )}
      </div>

      <div className="p-3 flex-grow flex flex-col">
        {/* Product Name */}
        <h4 className="font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {productData.name}
        </h4>

        {/* Weight/Size */}
        {productData.weight && (
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <span>📦</span> {productData.weight}
          </p>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-green-600">{formatPrice(productData.discountedPrice, lang)}</span>
            {productData.originalPrice > productData.discountedPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(productData.originalPrice, lang)}</span>
            )}
          </div>

          {/* Add to Cart / Quantity Controls */}
          {quantity === 0 ? (
            <Button 
              size="sm" 
              onClick={handleAddToCart} 
              disabled={!productData.isInStock}
              className={cn(
                "transition-all",
                productData.isInStock && "hover:scale-105 active:scale-95"
              )}
              title="Add to cart"
            >
              <ShoppingCart className="h-4 w-4 mr-1" /> 
              <span className="hidden sm:inline">Add</span>
            </Button>
          ) : (
            <div className="flex items-center border border-primary/30 rounded-full bg-primary/5 hover:bg-primary/10 transition-all">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary/20" 
                onClick={handleRemoveFromCart}
                title="Decrease quantity"
              >
                <span className="text-lg">−</span>
              </Button>
              <span className="px-2 font-semibold min-w-[30px] text-center">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary/20" 
                onClick={handleAddToCart}
                title="Increase quantity"
              >
                <span className="text-lg">+</span>
              </Button>
            </div>
          )}
        </div>

        {/* In Stock Indicator */}
        {productData.isInStock && quantity === 0 && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <span className="emoji-bounce">✅</span> In Stock
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
