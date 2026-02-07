"use client";

import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { wishlistService } from "@/services/supabase/wishlist";
import { productsService } from "@/services/supabase/products";
import { showError, showSuccess } from "@/utils/toast";

interface WishlistProduct {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  discount_percentage: number;
  image_url: string;
  in_stock: boolean;
  category_id: string;
  weight?: string; // Added weight for cart compatibility
}

const Wishlist = () => {
  const { theme } = useTheme();
  const { lang } = useLang();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: wishlistItems, error } = await wishlistService.getWishlist(user.id);
      
      if (!error && wishlistItems) {
        // Fetch product details for each wishlist item
        const productsPromises = wishlistItems.map(item =>
          productsService.getProduct(item.product_id).then(res => ({
            ...res.data,
            wishlist_id: item.id
          }))
        );
        
        const products = await Promise.all(productsPromises);
        setWishlistProducts(products.filter(p => p) as WishlistProduct[]);
      } else {
        setWishlistProducts([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      showError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;
    try {
      setRemovingId(productId);
      const { error } = await wishlistService.removeFromWishlist(user.id, productId);
      
      if (!error) {
        setWishlistProducts(prev => prev.filter(p => p.id !== productId));
        showSuccess("Removed from wishlist");
      } else {
        showError("Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      showError("Failed to remove from wishlist");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    if (!user) {
      showError("Please log in to add items to cart");
      return;
    }

    try {
      setAddingToCartId(product.id);
      const discountedPrice = product.price * (1 - product.discount_percentage / 100);
      const productName = lang === "ar" ? product.name_ar : product.name_en;
      
      // addItem returns Promise<void>, so we don't destructure { error }
      await addItem({
        id: product.id,
        name: productName,
        price: discountedPrice,
        image: product.image_url,
        weight: product.weight,
      });

      showSuccess("Added to cart from wishlist");
    } catch (err) {
      console.error("Error adding to cart:", err);
      showError("Failed to add to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl emoji-spin mb-4">❤️</div>
            <p className="text-muted-foreground text-lg">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col items-center justify-center">
          <div className="text-center max-w-md space-y-4">
            <div className="text-7xl emoji-float mb-6">🤍</div>
            <h2 className="text-3xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-lg mb-6">
              {lang === "ar" 
                ? "لم تضف أي منتجات إلى قائمة التمنيات بعد"
                : "You haven't saved any products to your wishlist yet"}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {lang === "ar" 
                  ? "تحقق من منتجاتنا الرائعة!"
                  : "Check out our amazing products!"}
              </p>
              <Button 
                onClick={handleContinueShopping}
                size="lg"
                variant="outline"
                className="w-full gap-2 hover:scale-105 transition-transform"
              >
                <span>🛍️</span> 
                {lang === "ar" ? "تصفح المنتجات" : "Start Shopping"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "ar" ? "رجوع" : "Back"}
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="emoji-bounce">❤️</span>
              {lang === "ar" ? "قائمة التمنيات" : "My Wishlist"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {lang === "ar"
                ? `${wishlistProducts.length} منتج محفوظ`
                : `${wishlistProducts.length} item${wishlistProducts.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => {
            const discountedPrice = product.price * (1 - product.discount_percentage / 100);
            const productName = lang === "ar" ? product.name_ar : product.name_en;

            return (
              <div 
                key={product.id}
                className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all card-animate group"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden bg-muted h-40">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={productName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-5xl emoji-bounce">📦</div>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discount_percentage > 0 && (
                    <div className="absolute top-2 left-2 bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      🎉 {product.discount_percentage}% OFF
                    </div>
                  )}

                  {/* Stock Status */}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-center">
                        {lang === "ar" ? "غير متاح" : "Out of Stock"}
                      </span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    disabled={removingId === product.id}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-destructive"
                  >
                    {removingId === product.id ? (
                      <span className="emoji-spin">⏳</span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Product Details */}
                <div className="p-4 space-y-4">
                  {/* Product Name */}
                  <div>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {productName}
                    </h3>
                  </div>

                  {/* Price Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(discountedPrice, lang)}
                      </span>
                      {product.price > discountedPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.price, lang)}
                        </span>
                      )}
                    </div>

                    {/* Stock Indicator */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className={product.in_stock ? "text-green-600" : "text-destructive"}>
                        {product.in_stock ? "✅" : "❌"}
                      </span>
                      <span className={product.in_stock ? "text-green-600" : "text-destructive"}>
                        {product.in_stock 
                          ? (lang === "ar" ? "متاح" : "In Stock")
                          : (lang === "ar" ? "غير متاح" : "Out of Stock")
                        }
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="w-full"
                    >
                      {lang === "ar" ? "عرض" : "View"}
                    </Button>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.in_stock || addingToCartId === product.id}
                      className="w-full gap-2"
                    >
                      {addingToCartId === product.id ? (
                        <span className="emoji-spin">⏳</span>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {lang === "ar" ? "أضف" : "Add"}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping Button */}
        <div className="mt-12 text-center">
          <Button 
            onClick={handleContinueShopping}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <span>🛍️</span>
            {lang === "ar" ? "تصفح المزيد من المنتجات" : "Continue Shopping"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;