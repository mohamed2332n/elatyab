"use client";
import { useState, useEffect } from "react";
import { Moon, Sun, Search, Home, Wallet, FolderOpen, ClipboardList, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import ProductCard from "@/components/product-card";
import OfferBanner from "@/components/offer-banner";
import CategoryCard from "@/components/category-card";
import { toast } from "sonner";
import { productsService } from "@/services/supabase/products";
import { categoriesService } from "@/services/supabase/categories";
import { offersService } from "@/services/supabase/offers";

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  icon: string;
}

interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  old_price: number | null;
  discount_percent: number;
  weight: string;
  is_in_stock: boolean;
  images?: string[];
}

interface Offer {
  id: string;
  title_en: string;
  title_ar: string;
  image_url: string;
}

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const cartCount = getTotalItems();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes, offersRes] = await Promise.all([
        categoriesService.getAllCategories(),
        productsService.getFeaturedProducts(),
        offersService.getActiveOffers(),
      ]);

      if (!categoriesRes.error && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (!productsRes.error && productsRes.data) {
        setFeaturedProducts(productsRes.data);
      }

      if (!offersRes.error && offersRes.data) {
        setOffers(offersRes.data);
      }
    } catch (error) {
      console.error("Error loading page data:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Search Bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="🔍 Find Fresh Products here!" 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-input focus:outline-none focus:ring-2 focus:ring-primary transition-all animate-in-zoom"
              onClick={() => navigate("/search")} 
            />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6" role="main">
        <div className="mb-6 animate-in-slide-up">
          <h2 className="text-3xl font-bold mb-2">
            <span className="emoji-bounce">👋</span> Welcome to FreshCart!
          </h2>
          <p className="text-muted-foreground text-lg">
            <span className="emoji-float">🌱</span> Fresh fruits and vegetables delivered to your doorstep
          </p>
        </div>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl p-8 mb-8 text-white shadow-lg card-animate grid-animate">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <span className="emoji-spin">🎯</span> Fresh Produce Daily
              </h3>
              <p className="mb-4 text-white/90">Get the freshest fruits and vegetables delivered to your home</p>
              <Button 
                variant="secondary" 
                onClick={() => navigate("/categories")}
                className="font-bold text-base hover:scale-105 transition-transform"
              >
                🛍️ Shop Now
              </Button>
            </div>
            <div className="text-6xl emoji-float hidden md:block">🥗</div>
          </div>
        </div>
        
        {/* Categories */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold flex items-center gap-2 animate-in-slide-left">
              <span className="emoji-wiggle">📂</span> Categories
            </h3>
            <Button variant="link" onClick={() => navigate("/categories")} className="transition-all hover:translate-x-2">
              View All →
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 grid-animate">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                name={category.name} 
                icon={category.icon} 
                itemCount={category.itemCount} 
                onClick={() => navigate("/categories")} 
              />
            ))}
          </div>
        </section>
        
        {/* Offers */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold flex items-center gap-2 animate-in-slide-left">
              <span className="emoji-heartbeat">🎁</span> Special Offers
            </h3>
            <Button variant="link" onClick={() => navigate("/offers")} className="transition-all hover:translate-x-2">
              View All →
            </Button>
          </div>
          <OfferBanner 
            title="🌟 Deal of the Day" 
            description="🥔 Potato-15 🥕 Carrot-29 🌿 Palak-29 🍄 Mushroom-35" 
            validTill="06-02-2026" 
            onOrderNow={() => {
              toast.success("🚀 Speed up to grab the best deals!");
              navigate("/offers");
            }} 
          />
        </section>
        
        {/* Products */}
        <section className="animate-in-fade">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="emoji-spin">✨</span> Featured Products
            </h3>
            <Button variant="link" onClick={() => navigate("/categories")} className="transition-all hover:translate-x-2">
              View All →
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 grid-animate">
            {featuredProducts.map((product) => (
              <div key={product.id} className="list-item">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </section>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            {[
              { icon: Home, label: "🏠 Home", path: "/" },
              { icon: Wallet, label: "💰 Wallet", path: "/wallet" },
              { icon: FolderOpen, label: "📁 Category", path: "/categories" },
              { icon: ClipboardList, label: "📋 Orders", path: "/orders" },
              { icon: Gift, label: "🎉 Offers", path: "/offers" }
            ].map((item, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                className="flex flex-col items-center justify-center h-16 px-2 py-1 transition-all hover:scale-110 active:scale-95"
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                {typeof item.label === 'string' && item.label.includes('🏠') ? (
                  <span className="text-xl emoji-bounce">🏠</span>
                ) : typeof item.label === 'string' && item.label.includes('💰') ? (
                  <span className="text-xl emoji-wiggle">💰</span>
                ) : typeof item.label === 'string' && item.label.includes('📁') ? (
                  <span className="text-xl">📁</span>
                ) : typeof item.label === 'string' && item.label.includes('📋') ? (
                  <span className="text-xl">📋</span>
                ) : (
                  <span className="text-xl emoji-heartbeat">🎉</span>
                )}
                <span className="text-xs mt-1">{item.label.split(' ')[1]}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>
      <MadeWithDyad />
    </div>
  );
};

export default Index;