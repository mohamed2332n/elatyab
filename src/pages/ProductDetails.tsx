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
import { useTranslation } from "react-i18next";

interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  discount_percentage: number;
  is_in_stock: boolean;
  category_id: string;
  image_url: string;
  weight: string;
  origin: string;
  freshness: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  tags: string[];
  discountedPrice: number;
  originalPrice: number;
  name: string;
  description: string;
}

const ProductDetails = () => {
  const { theme } = useTheme();
  const { lang } = useLang();
  const { addItem } = useCart();
  const { t } = useTranslation();
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
      if (!id) return;
      try {
        setLoading(true);
        const { data: fetchedProduct, error } = await productsService.getProduct(id);
        if (!error && fetchedProduct) {
          // Calculate derived properties and map to local Product interface
          const discountedPrice = fetchedProduct.price * (1 - fetchedProduct.discount_percentage / 100);
          const mappedProduct: Product = {
            ...fetchedProduct,
            name: lang === 'ar' ? fetchedProduct.name_ar : fetchedProduct.name_en,
            description: lang === 'ar' ? fetchedProduct.description_ar : fetchedProduct.description_en,
            images: fetchedProduct.images || [fetchedProduct.image_url || "/placeholder.svg"],
            rating: fetchedProduct.reviews?.length ? fetchedProduct.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / fetchedProduct.reviews.length : 4.5,
            reviewsCount: fetchedProduct.reviews?.length || 0,
            tags: fetchedProduct.tags || [],
            discountedPrice: discountedPrice,
            originalPrice: fetchedProduct.price,
            weight: fetchedProduct.weight || '1 kg',
            origin: fetchedProduct.origin || 'Local',
            freshness: fetchedProduct.freshness || 'Daily',
          };
          setProduct(mappedProduct);
          
          // Check if wishlisted
          if (user) {
            const { isInWishlist } = await wishlistService.isInWishlist(user.id, id);
            setIsWishlisted(isInWishlist);
          }
        } else {
          showError("Product not found");
          navigate("/");
        }
      } catch (error) {
        showError("Failed to load product");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, user, lang]);

  const handleAddToCart = async () => {
    if (!product || !user) return;
    
    await addItem({
      id: product.id,
      name: product.name,
      price: product.discountedPrice,
      image: product.images[0],
      weight: product.weight
    });
    navigate("/cart");
  };

  const toggleWishlist = async () => {
    if (!user || !product) {
      showError("Please log in to use wishlist");
      navigate("/login");
      return;
    }

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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {t('home')}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={toggleWishlist}>
            <Heart className={isWishlisted ? "fill-destructive text-destructive" : ""} />
          </Button>
          <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="relative rounded-xl overflow-hidden aspect-square border border-border">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount_percentage}% {t('off')}
              </div>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={product.name}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(idx)}
                />
              ))}
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
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{lang === 'ar' ? product.name_ar : product.name_en}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded text-sm font-bold">
                <Star className="h-3 w-3 fill-current mr-1" /> {product.rating.toFixed(1)}
              </div>
              <span className="text-muted-foreground text-sm">({product.reviewsCount} reviews)</span>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                  <span>🚚</span> Free Delivery
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">Orders above {formatPrice(500, lang)}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes • {product.weight}</p>
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed">{lang === 'ar' ? product.description_ar : product.description_en}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-muted/30 p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Origin</p>
                <p className="font-medium text-sm">{product.origin}</p>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Freshness</p>
                <p className="font-medium text-sm text-green-600">{product.freshness}</p>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center border border-input rounded-lg overflow-hidden">
                  <button className="px-4 py-2 hover:bg-muted" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span className="px-6 font-bold">{quantity}</span>
                  <button className="px-4 py-2 hover:bg-muted" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
              <Button className="w-full py-6 text-lg font-bold gap-2" onClick={handleAddToCart} disabled={!product.is_in_stock}>
                <ShoppingCart className="h-5 w-5" /> {t('addToCart')}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        {product && (
          <div className="mt-12 border-t border-border pt-12">
            <ProductReviews
              productId={product.id}
              productName={lang === 'ar' ? product.name_ar : product.name_en}
              productPrice={product.price}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetails;