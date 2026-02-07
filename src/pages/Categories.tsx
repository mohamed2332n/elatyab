"use client";

import { useState } from "react";
import CategoryCard from "@/components/category-card";
import { useTheme } from "@/components/theme-provider";

const Categories = () => {
  const { theme } = useTheme();
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

  const handleCategoryClick = (categoryId: number) => {
    // In a real app, this would navigate to the category products page
    console.log(`Clicked on category ${categoryId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Categories</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              icon={category.icon}
              itemCount={category.itemCount}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>
        
        {/* Seasonal Categories */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Seasonal Specials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 1, name: "Summer Fruits", icon: "🍉", itemCount: 20 },
              { id: 2, name: "Winter Veggies", icon: "🍠", itemCount: 15 },
              { id: 3, name: "Monsoon Special", icon: "🥒", itemCount: 12 }
            ].map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                icon={category.icon}
                itemCount={category.itemCount}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-row items-center p-6"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Categories;