"use client";

import React from "react";
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

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { getTotalItems } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const cartCount = getTotalItems();

  const featuredProducts = [
    { id: "1", name: i18n.language === 'ar' ? 'تفاح طازج' : "Fresh Apple", weight: "500g", originalPrice: 199, discountedPrice: 129, discountPercent: 35 },
    { id: "2", name: i18n.language === 'ar' ? 'موز عضوي' : "Organic Banana", weight: "1 doz", originalPrice: 89, discountedPrice: 69, discountPercent: 22 },
    { id: "3", name: i18n.language === 'ar' ? 'مانجو بريميوم' : "Premium Mango", weight: "1 kg", originalPrice: 299, discountedPrice: 199, discountPercent: 33 },
    { id: "4", name: i18n.language === 'ar' ? 'سبانخ طازجة' : "Fresh Spinach", weight: "250g", originalPrice: 49, discountedPrice: 39, discountPercent: 20 }
  ];

  const categories = [
    { id: 1, name: t('category'), icon: "🍎", itemCount: 45 },
    { id: 2, name: t('category'), icon: "🥬", itemCount: 38 },
    { id: 3, name: t('category'), icon: "🍿", itemCount: 22 },
    { id: 4, name: t('category'), icon: "🎁", itemCount: 16 }
  ];

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
                name={c.name} 
                icon={c.icon} 
                itemCount={c.itemCount}
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
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
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