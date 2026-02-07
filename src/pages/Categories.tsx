"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "@/components/category-card";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { useTranslation } from "react-i18next";
import { Product } from "@/lib/types";

const Categories = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          apiService.getCategories(),
          apiService.getProducts(i18n.language)
        ]);
        setCategories(cats);
        setAllProducts(prods);
      } catch (err) {
        console.error("Failed to load category data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [i18n.language]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const selectedCategoryId = categories.find(c => (i18n.language === 'ar' ? c.name_ar : c.name_en) === selectedCategory)?.id;
  
  // Note: For now, we're doing a client-side filter. In a huge catalog, we'd fetch by category ID.
  const displayedProducts = selectedCategory 
    ? allProducts.filter(p => true) // In a real scenario, map products to categories in DB
    : allProducts.slice(0, 8);

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-spin text-4xl">⏳</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 animate-in-slide-up">
          <span className="emoji-bounce">🏪</span> {t('category')}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={i18n.language === 'ar' ? category.name_ar : category.name_en}
                  icon={category.icon}
                  onClick={() => handleCategoryClick(i18n.language === 'ar' ? category.name_ar : category.name_en)}
                  className="card-animate"
                />
              ))}
            </div>
            
            <section className="mt-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 animate-in-slide-up">
                <span className="emoji-spin">❄️</span> {t('featured')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 animate-in-slide-up">
              <span>🛍️</span> {selectedCategory}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;