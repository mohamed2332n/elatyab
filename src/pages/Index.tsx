"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Home, Wallet, FolderOpen, ClipboardList, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiService } from "@/services/api";
import SearchBar from "@/components/search-bar";
import CartPreview from "@/components/cart-preview";
import LanguageToggle from "@/components/language-toggle";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import OfferBanner from "@/components/offer-banner";
import { Header } from "@/components/header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Product } from "@/lib/types";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([
          apiService.getProducts(i18n.language),
          apiService.getCategories()
        ]);
        setFeaturedProducts(prods.filter(p => p.isInStock).slice(0, 4));
        setCategories(cats.slice(0, 4));
      } catch (err) {
        console.error("Home data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [i18n.language]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-in-fade">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t('welcome')}</h2>
            <p className="text-muted-foreground text-sm">{t('heroSub')}</p>
          </div>
          <div className="flex gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:scale-110 transition-transform">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <SearchBar onSearch={(q) => q && navigate(`/search?q=${q}`)} />
        </div>

        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 mb-8 text-white shadow-lg card-animate">
          <h3 className="text-3xl font-bold mb-2 animate-in-slide-up">{t('heroTitle')}</h3>
          <p className="mb-4 text-primary-foreground/90">{t('heroSub')}</p>
          <Button variant="secondary" className="font-bold hover:scale-105 transition-transform" onClick={() => navigate("/categories")}>
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
                name={i18n.language === 'ar' ? c.name_ar : c.name_en} 
                icon={c.icon} 
                onClick={() => navigate("/categories")} 
                className="card-animate"
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('specialOffers')}</h3>
            <Button variant="link" size="sm" onClick={() => navigate("/offers")}>{t('viewAll')}</Button>
          </div>
          <OfferBanner
            title={t('specialOffers')}
            description="Potato-15 Carrot-29 Palak-29"
            validTill="06-02-2026"
            onOrderNow={() => navigate("/offers")}
          />
        </section>

        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('featured')}</h3>
            <Button variant="link" size="sm" onClick={() => navigate("/categories")}>{t('viewAll')}</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-64 skeleton rounded-lg" />)
            ) : (
              featuredProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))
            )}
          </div>
        </section>
      </main>

      <nav className="sticky bottom-0 bg-background border-t border-border shadow-lg z-50">
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
                className="flex flex-col items-center justify-center h-14 w-full px-1 hover:bg-muted transition-all"
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