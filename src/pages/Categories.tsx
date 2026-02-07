"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "@/components/category-card";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface Product {
  id: string;
  name: string;
  weight: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  isInStock: boolean;
}

const Categories = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories] = useState([
    { id: 1, name: "Deal of the Day", icon: "🔥", itemCount: 12 },
    { id: 2, name: "Fruits", icon: "🍎", itemCount: 45 },
    { id: 3, name: "Fresh Vegetables", icon: "🥬", itemCount: 38 },
    { id: 4, name: "Snacks", icon: "🍿", itemCount: 22 },
    { id: 5, name: "Dates", icon: "🪵", itemCount: 15 },
    { id: 6, name: "Grapes", icon: "🍇", itemCount: 8 },
    { id: 7, name: "Winter Special", icon: "❄️", itemCount: 18 },
    { id: 8, name: "Nuts & Seeds", icon: "🥜", itemCount: 25 },
    { id: 9, name: "Breakfast Products", icon: "🥣", itemCount: 30 },
    { id: 10, name: "Combo Products", icon: "🎁", itemCount: 16 },
    { id: 11, name: "Kiwi", icon: "🥝", itemCount: 5 },
    { id: 12, name: "Orange", icon: "🍊", itemCount: 7 },
  ]);

  // Mock products by category
  const productsByCategory: Record<string, Product[]> = {
    "Fruits": [
      { id: "1", name: "Fresh Apple", weight: "500g", originalPrice: 199, discountedPrice: 129, discountPercent: 35, isInStock: true },
      { id: "2", name: "Organic Banana", weight: "1 dozen", originalPrice: 89, discountedPrice: 69, discountPercent: 22, isInStock: true },
      { id: "3", name: "Premium Mango", weight: "1 kg", originalPrice: 299, discountedPrice: 199, discountPercent: 33, isInStock: true },
      { id: "5", name: "Red Grapes", weight: "500g", originalPrice: 149, discountedPrice: 99, discountPercent: 34, isInStock: true },
      { id: "12", name: "Orange", weight: "1 kg", originalPrice: 129, discountedPrice: 89, discountPercent: 31, isInStock: true },
    ],
    "Fresh Vegetables": [
      { id: "4", name: "Fresh Spinach", weight: "250g", originalPrice: 49, discountedPrice: 39, discountPercent: 20, isInStock: true },
      { id: "6", name: "Carrots", weight: "1 kg", originalPrice: 59, discountedPrice: 45, discountPercent: 24, isInStock: true },
      { id: "7", name: "Tomatoes", weight: "1 kg", originalPrice: 79, discountedPrice: 59, discountPercent: 25, isInStock: true },
      { id: "8", name: "Bell Peppers", weight: "500g", originalPrice: 99, discountedPrice: 75, discountPercent: 24, isInStock: true },
      { id: "9", name: "Lettuce", weight: "250g", originalPrice: 69, discountedPrice: 49, discountPercent: 29, isInStock: true },
    ],
    "Snacks": [
      { id: "13", name: "Almonds", weight: "500g", originalPrice: 399, discountedPrice: 299, discountPercent: 25, isInStock: true },
      { id: "14", name: "Cashews", weight: "250g", originalPrice: 329, discountedPrice: 249, discountPercent: 24, isInStock: true },
      { id: "15", name: "Peanuts", weight: "500g", originalPrice: 149, discountedPrice: 99, discountPercent: 34, isInStock: true },
    ],
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const selectedCategoryProducts = selectedCategory ? productsByCategory[selectedCategory] || [] : [];

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 animate-in-slide-up">
          <span className="emoji-bounce">🏪</span> Categories
        </h1>
        <p className="text-muted-foreground mb-8">Explore our wide range of fresh products</p>
        
        {selectedCategory && (
          <Button
            variant="outline"
            onClick={() => setSelectedCategory(null)}
            className="mb-6 gap-2"
          >
            <span>✕</span> Back to All Categories
          </Button>
        )}
        
        {!selectedCategory ? (
          <>
            {/* All Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className="cursor-pointer card-animate hover:scale-105 transition-transform"
                >
                  <CategoryCard
                    name={category.name}
                    icon={category.icon}
                    itemCount={category.itemCount}
                  />
                </div>
              ))}
            </div>
            
            {/* Seasonal Categories */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 animate-in-slide-up">
                <span className="emoji-spin">❄️</span> Seasonal Specials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 1, name: "Summer Fruits", icon: "🍉", itemCount: 20 },
                  { id: 2, name: "Winter Veggies", icon: "🍠", itemCount: 15 },
                  { id: 3, name: "Monsoon Special", icon: "🥒", itemCount: 12 }
                ].map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    className="cursor-pointer card-animate hover:scale-105 transition-transform"
                  >
                    <CategoryCard
                      name={category.name}
                      icon={category.icon}
                      itemCount={category.itemCount}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Best Sellers Section */}
            <section className="mt-10 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 animate-in-slide-up">
                <span className="emoji-bounce">⭐</span> Best Sellers
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { id: "1", name: "Fresh Apple", weight: "500g", originalPrice: 199, discountedPrice: 129, discountPercent: 35, isInStock: true },
                  { id: "2", name: "Organic Banana", weight: "1 dozen", originalPrice: 89, discountedPrice: 69, discountPercent: 22, isInStock: true },
                  { id: "3", name: "Premium Mango", weight: "1 kg", originalPrice: 299, discountedPrice: 199, discountPercent: 33, isInStock: true },
                  { id: "4", name: "Fresh Spinach", weight: "250g", originalPrice: 49, discountedPrice: 39, discountPercent: 20, isInStock: true },
                ].map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Category Products View */}
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 animate-in-slide-up">
              <span>🛍️</span> {selectedCategory}
            </h2>
            {selectedCategoryProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedCategoryProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-6xl emoji-float mb-4">📭</div>
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">This category doesn't have products yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;