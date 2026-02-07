"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Share2, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";
import { useCart } from "@/context/cart-context";
import { useNavigate, useParams } from "react-router-dom";
import { productsService } from "@/services/supabase/products";
import { wishlistService } from "@/services/supabase/wishlist";
import { useAuth } from "@/context/auth-context";
import { showError } from "@/utils/toast";
import ProductReviews from "@/components/product-reviews";

interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  discount_percentage: number;
  in_stock: boolean;
  category_id: string;
  image_url: string;
}

const ProductDetails = () => {
  const { theme } = useTheme();
  const { lang } = useLang();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        showError("Product ID is missing");
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const { data: fetchedProduct, error } = await productsService.getProduct(id);
        if (!error && fetchedProduct) {
          setProduct(fetchedProduct);
          // Check if wishlisted
          if (user) {
            const { data: wishlisted } = await wishlistService.isInWishlist(user.id, id);
            setIsWishlisted(wishlisted || false);
          }
        } else {
          showError("Product not found");
          navigate("/");
        }
      } catch (error) {
        showError("Failed to load product");
        console.error("Error fetching product:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, user]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.discountedPrice,
        image: product.images[0],
        weight: product.weight
      });
      navigate("/cart");
    } catch (error) {
      showError("Failed to add to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      showError("Please log in to use wishlist");
      return;
    }
    if (!product) return;

    try {
      if (isWishlisted) {
        const { error } = await wishlistService.removeFromWishlist(user.id, product.id);
        if (!error) {
          setIsWishlisted(false);
        } else {
          showError("Failed to remove from wishlist");
        }
      } else {
        const { error } = await wishlistService.addToWishlist(user.id, product.id);
        if (!error) {
          setIsWishlisted(true);
        } else {
          showError("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showError("Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl emoji-spin mb-4">📦</div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl emoji-float mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/")} className="gap-2">
              <span>🏠</span> Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border animate-in-slide-down">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 hover:scale-110 transition-transform">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleWishlist}
                className="hover:scale-110 transition-transform"
              >
                <Heart className={`${isWishlisted ? "fill-destructive text-destructive emoji-heartbeat" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Share2 />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Product Images Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background card-animate">
        <img 
          src={product.images[selectedImage]} 
          alt={product.name} 
          className="w-full h-80 object-cover transition-transform hover:scale-105" 
        />
        <div className="absolute top-4 right-4 bg-destructive text-white text-sm font-bold px-3 py-1 rounded-full animate-bounce">
          <span className="emoji-spin">🔥</span> {product.discountPercent}% OFF
        </div>
      </div>
      
      {/* Image Thumbnails */}
      <div className="flex justify-center gap-2 px-4 py-4 bg-card border-b border-border overflow-x-auto">
        {product.images.map((image, index) => (
          <img 
            key={index} 
            src={image} 
            alt={`Product ${index + 1}`} 
            className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all hover:scale-110 ${
              selectedImage === index ? "border-primary ring-2 ring-primary" : "border-border"
            }`} 
            onClick={() => setSelectedImage(index)} 
          />
        ))}
      </div>
      
      {/* Product Details Section */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Title & Rating */}
            <div className="card-animate">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <p className="text-muted-foreground mb-3 flex items-center gap-1">
                    <span>📦</span> {product.weight}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-xs">({product.reviewsCount})</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 card-animate" style={{ animationDelay: "50ms" }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-green-600">{formatPrice(product.discountedPrice, lang)}</span>
                {product.originalPrice > product.discountedPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice, lang)}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Product Tags */}
            <div className="flex flex-wrap gap-2 card-animate" style={{ animationDelay: "100ms" }}>
              {product.tags.map((tag, index) => (
                <span key={index} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">
                  <span className="emoji-bounce">#</span> {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="card-animate" style={{ animationDelay: "150ms" }}>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span>📝</span> Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-4 card-animate" style={{ animationDelay: "200ms" }}>
              <div className="bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-all">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span>🌍</span> Origin
                </p>
                <p className="font-medium mt-1">{product.origin}</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-all">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span>📅</span> Harvest
                </p>
                <p className="font-medium mt-1">{product.harvestDate}</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-all">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span>✨</span> Freshness
                </p>
                <p className="font-medium text-green-600 mt-1">{product.freshness}</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-all">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span>📦</span> Status
                </p>
                <p className={`font-medium mt-1 ${product.isInStock ? "text-green-600" : "text-destructive"}`}>
                  {product.isInStock ? "✅ In Stock" : "❌ Out of Stock"}
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-card rounded-lg p-4 border border-border card-animate" style={{ animationDelay: "250ms" }}>
              <span className="font-medium flex items-center gap-2">
                <span>📊</span> Quantity
              </span>
              <div className="flex items-center border border-input rounded-lg overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="px-3 hover:bg-muted" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </Button>
                <span className="px-4 font-semibold minimum-w-[40px] text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="px-3 hover:bg-muted" 
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Action Buttons */}
          <div className="space-y-4 card-animate" style={{ animationDelay: "300ms" }}>
            {/* Wishlist & Share */}
            <Button 
              variant={isWishlisted ? "default" : "outline"}
              className="w-full gap-2 py-6 text-base font-bold hover:scale-105 transition-transform"
              onClick={toggleWishlist}
            >
              <span className={isWishlisted ? "emoji-heartbeat" : "emoji-wiggle"}>
                {isWishlisted ? "❤️" : "🤍"}
              </span>
              {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            </Button>

            {/* Add to Cart */}
            <Button 
              className="w-full gap-2 py-6 text-base font-bold hover:scale-105 transition-transform active:scale-95"
              onClick={handleAddToCart} 
              disabled={!product.isInStock}
            >
              <span className="emoji-bounce">🛒</span> Add to Cart
            </Button>

            {/* Out of Stock Message */}
            {!product.isInStock && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-destructive flex items-center justify-center gap-1">
                  <span>😢</span> Currently Out of Stock
                </p>
              </div>
            )}

            {/* Info Cards */}
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                  <span>🚚</span> Free Delivery
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">Orders above {formatPrice(500, lang)}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <span>✨</span> 100% Fresh
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Farm to table guarantee</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <span>💚</span> Easy Returns
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">7-day return policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        {product && (
          <div className="mt-12 border-t border-border pt-12">
            <ProductReviews
              productId={product.id}
              productName={product[`name_${lang}`]}
              productPrice={product.price}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;