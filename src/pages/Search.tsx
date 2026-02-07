"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search as SearchIcon } from "lucide-react";
import SearchBar from "@/components/search-bar";
import ProductCard from "@/components/product-card";
import { apiService, Product } from "@/services/api";

const SearchPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await apiService.getProducts();
        setAllProducts(products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const search = query.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.description.toLowerCase().includes(search) ||
      p.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }, [query, allProducts]);

  const popularSearches = i18n.language === 'ar' 
    ? ['تفاح', 'فراولة', 'خضروات', 'عروض'] 
    : ['Apple', 'Strawberry', 'Organic', 'Offers'];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 py-6">
        <SearchBar onSearch={setQuery} initialValue={query} />
        
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : query ? (
            <div>
              <h2 className="text-xl font-bold mb-4">
                {filteredProducts.length} {t('items')} "{query}"
              </h2>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} {...p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 opacity-60">
                  <SearchIcon className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-bold">{t('noResults')}</h3>
                  <p>{t('tryDifferent')}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">{t('popularSearches')}</h2>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    className="px-4 py-2 bg-muted rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;