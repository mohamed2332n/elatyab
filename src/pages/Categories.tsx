"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";
import { categoriesService } from "@/services/supabase/categories";
import { productsService } from "@/services/supabase/products";
import { showError } from "@/utils/toast";
import ProductCard from "@/components/product-card";

interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  discount_percentage: number;
  image_url: string;
  in_stock: boolean;
  category_id: string;
}

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  image_url?: string;
}

const Categories = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { lang } = useLang();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchCategoryProducts(selectedCategoryId);
    } else {
      setCategoryProducts([]);
    }
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await categoriesService.getAllCategories();
      if (!error && data) {
        setCategories(data);
      } else {
        showError("Failed to load categories");
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      showError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async (categoryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await productsService.getProductsByCategory(categoryId);
      if (!error && data) {
        setCategoryProducts(data);
      } else {
        setCategoryProducts([]);
      }
    } catch (err) {
      console.error("Error loading category products:", err);
      showError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 animate-in-slide-up">
          <span className="emoji-bounce">🏪</span> Categories
        </h1>
        <p className="text-muted-foreground mb-8">Explore our wide range of fresh products</p>
        
        {selectedCategoryId && (
          <Button
            variant="outline"
            onClick={() => setSelectedCategoryId(null)}
            className="mb-6 gap-2"
          >
            <span>✕</span> Back to All Categories
          </Button>
        )}
        
        {!selectedCategoryId ? (
          <>
            {/* All Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className="cursor-pointer bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md hover:scale-105 transition-all text-center"
                >
                  <div className="text-4xl mb-2 flex items-center justify-center h-20">
                    📦
                  </div>
                  <h3 className="font-semibold text-sm">
                    {lang === "ar" ? category.name_ar : category.name_en}
                  </h3>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Products in Selected Category */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading products...</div>
            ) : categoryProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No products in this category</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: lang === "ar" ? product.name_ar : product.name_en,
                      price: product.price,
                      discount: product.discount_percentage,
                      image: product.image_url,
                      inStock: product.in_stock,
                    }}
                    onAddClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;
