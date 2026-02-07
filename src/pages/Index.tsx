"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Search, ShoppingCart, Home, Wallet, FolderOpen, ClipboardList, Gift, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import ProductCard from "@/components/product-card";
import OfferBanner from "@/components/offer-banner";
import CategoryCard from "@/components/category-card";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { getTotalItems } = useCart();
  const { isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = getTotalItems();

  const handleLogin = async () => {
    // In a real app, this would open a login modal or redirect to login page
    // For demo purposes, we'll use mock credentials
    const success = await login("user@example.com", "password");
    if (success) {
      toast.success("You are now logged in");
    } else {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("You have been logged out");
  };

  const featuredProducts = [
    {
      id: "1",
      name: "Fresh Apple",
      weight: "500g",
      originalPrice: 199,
      discountedPrice: 129,
      discountPercent: 35,
      isInStock: true
    },
    {
      id: "2",
      name: "Organic Banana",
      weight: "1 dozen",
      originalPrice: 89,
      discountedPrice: 69,
      discountPercent: 22,
      isInStock: true
    },
    {
      id: "3",
      name: "Premium Mango",
      weight: "1 kg",
      originalPrice: 299,
      discountedPrice: 199,
      discountPercent: 33,
      isInStock: true
    },
    {
      id: "4",
      name: "Fresh Spinach",
      weight: "250g",
      originalPrice: 49,
      discountedPrice: 39,
      discountPercent: 20,
      isInStock: true
    }
  ];

  const categories = [
    { id: 1, name: "Fruits", icon: "🍎", itemCount: 45 },
    { id: 2, name: "Vegetables", icon: "🥬", itemCount: 38 },
    { id: 3, name: "Snacks", icon: "🍿", itemCount: 22 },
    { id: 4, name: "Combos", icon: "🎁", itemCount: 16 }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary w-8 h-8 rounded-full"></div>
              <h1 className="text-xl font-bold">FreshCart</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              {isAuthenticated ? (
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <User className="h-5 w-5" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleLogin}>
                  Login
                </Button>
              )}
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => navigate("/cart")}>
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Find Products here!"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-input focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => navigate("/search")}
            />
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to FreshCart</h2>
          <p className="text-muted-foreground">Fresh fruits and vegetables delivered to your doorstep</p>
        </div>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 mb-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Fresh Produce Daily</h3>
          <p className="mb-4">Get the freshest fruits and vegetables delivered to your home</p>
          <Button variant="secondary">Shop Now</Button>
        </div>
        {/* Categories */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Categories</h3>
            <Button variant="link" onClick={() => navigate("/categories")}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <h3 className="text-xl font-bold">Special Offers</h3>
            <Button variant="link" onClick={() => navigate("/offers")}>
              View All
            </Button>
          </div>
          <OfferBanner
            title="Deal of the Day"
            description="Potato-15 Carrot-29 Palak-29 Mushroom-35"
            validTill="06-02-2026"
            onOrderNow={() => navigate("/offers")}
          />
        </section>
        {/* Products */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Featured Products</h3>
            <Button variant="link" onClick={() => navigate("/categories")}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      </main>
      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            {[
              { icon: Home, label: "Home", path: "/" },
              { icon: Wallet, label: "Wallet", path: "/wallet" },
              { icon: FolderOpen, label: "Category", path: "/categories" },
              { icon: ClipboardList, label: "My Order", path: "/orders" },
              { icon: Gift, label: "Offers", path: "/offers" }
            ].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex flex-col items-center justify-center h-16 px-2 py-1"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
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