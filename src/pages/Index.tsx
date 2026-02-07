"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, ShoppingCart, Home, Wallet, FolderOpen, ClipboardList, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import SearchBar from "@/components/search-bar";
import CartPreview from "@/components/cart-preview";
import LanguageToggle from "@/components/language-toggle";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import OfferBanner from "@/components/offer-banner";
import { Header } from "@/components/header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "sonner";
import { productsService } from "@/services/supabase/products";
import { categoriesService } from "@/services/supabase/categories";
import { offersService } from "@/services/supabase/offers";
<<<<<<< HEAD
import { useLang } from "@/context/lang-context";
=======
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  icon: string;
<<<<<<< HEAD
  item_count: number;
=======
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
}

interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
<<<<<<< HEAD
  discount_percentage: number;
  image_url: string;
  is_in_stock: boolean;
  weight: string;
=======
  old_price: number | null;
  discount_percent: number;
  weight: string;
  is_in_stock: boolean;
  images?: string[];
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
}

interface Offer {
  id: string;
  title_en: string;
  title_ar: string;
<<<<<<< HEAD
  description_en: string;
  description_ar: string;
  valid_till: string;
=======
  image_url: string;
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
}

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { getTotalItems } = useCart();
  const { t } = useTranslation();
  const { lang } = useLang();
  const navigate = useNavigate();
  const cartCount = getTotalItems();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageData();
<<<<<<< HEAD
  }, [lang]);
=======
  }, []);
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425

  const loadPageData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes, offersRes] = await Promise.all([
        categoriesService.getAllCategories(),
        productsService.getFeaturedProducts(),
        offersService.getActiveOffers(),
      ]);

      if (!categoriesRes.error && categoriesRes.data) {
<<<<<<< HEAD
        // Map categories to include item_count (mocked for now as DB doesn't return it directly)
        const mappedCategories: Category[] = categoriesRes.data.map(c => ({
          ...c,
          icon: c.icon || '📦',
          item_count: 50, // Mock item count
        }));
        setCategories(mappedCategories);
      }

      if (!productsRes.error && productsRes.data) {
        // Map products to match the Product interface used locally
        const mappedProducts: Product[] = productsRes.data.map(p => ({
          id: p.id,
          name_en: p.name_en,
          name_ar: p.name_ar,
          price: p.price,
          discount_percentage: p.discount_percentage,
          image_url: p.image_url,
          is_in_stock: p.is_in_stock,
          weight: p.weight || '1 kg',
        }));
        setFeaturedProducts(mappedProducts);
=======
        setCategories(categoriesRes.data);
      }

      if (!productsRes.error && productsRes.data) {
        setFeaturedProducts(productsRes.data);
>>>>>>> 2814234658f732cf7780fa39b40cbd1e5251c425
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
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t('welcome')}</h2>
            <p className="text-muted-foreground text-sm">{t('heroSub')}</p>
          </div>
          <div className="flex gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <SearchBar onSearch={(q) => q && navigate(`/search?q=${q}`)} />
        </div>

        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 mb-8 text-white shadow-lg">
          <h3 className="text-3xl font-bold mb-2">{t('heroTitle')}</h3>
          <p className="mb-4 text-primary-foreground/90">{t('heroSub')}</p>
          <Button variant="secondary" className="font-bold" onClick={() => navigate("/categories")}>
            {t('shopNow')}
          </Button>
        </div>

        <CartPreview />

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('category')}</h3>
            <Button variant="link" size="sm" onClick={() => navigate("/categories")}>{t('viewAll')}</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <CategoryCard 
                key={c.id} 
                name={lang === 'ar' ? c.name_ar : c.name_en} 
                icon={c.icon} 
                itemCount={c.item_count}
                onClick={() => navigate("/categories")} 
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('specialOffers')}</h3>
            <Button variant="link" size="sm" onClick={() => navigate("/offers")}>{t('viewAll')}</Button>
          </div>
          {offers.length > 0 && (
            <OfferBanner
              title={lang === 'ar' ? offers[0].title_ar : offers[0].title_en}
              description={lang === 'ar' ? offers[0].description_ar : offers[0].description_en}
              validTill={new Date(offers[0].valid_till).toLocaleDateString(lang)}
              onOrderNow={() => navigate("/offers")}
            />
          )}
        </section>

        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('featured')}</h3>
            <Button variant="link" size="sm" onClick={() => navigate("/categories")}>{t('viewAll')}</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={{
                  id: p.id,
                  name: lang === 'ar' ? p.name_ar : p.name_en,
                  price: p.price,
                  discount: p.discount_percentage,
                  image: p.image_url,
                  inStock: p.is_in_stock,
                }}
              />
            ))}
          </div>
        </section>
      </main>

      <nav className="sticky bottom-0 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto px-2">
          <div className="flex justify-around py-1">
            {[
              { icon: Home, label: t('home'), path: "/" },
              { icon: Wallet, label: t('wallet'), path: "/wallet" },
              { icon: FolderOpen, label: t('category'), path: "/categories" },
              { icon: ClipboardList, label: t('myOrder'), path: "/orders" },
              { icon: Gift, label: t('offers'), path: "/offers" }
            ].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex flex-col items-center justify-center h-14 w-full px-1 hover:bg-muted"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
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