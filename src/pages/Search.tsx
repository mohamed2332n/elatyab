"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import SearchBar from "@/components/search-bar";
import ProductCard from "@/components/product-card";
import { apiService, Product } from "@/services/api";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
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
    let results = allProducts;
    if (query.trim()) {
      const s = query.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(s) || 
        p.description.toLowerCase().includes(s) ||
        p.tags.some(tag => tag.toLowerCase().includes(s))
      );
    }
    return results.filter(p => p.discountedPrice >= priceRange.min && p.discountedPrice <= priceRange.max);
  }, [query, allProducts, priceRange]);

  const popularSearches = i18n.language === 'ar' 
    ? ['تفاح', 'موز', 'خضروات', 'عروض'] 
    : ['Apple', 'Banana', 'Organic', 'Offers'];

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex gap-2 items-center mb-6">
          <div className="flex-grow">
            <SearchBar onSearch={(q) => { setQuery(q); setSearchParams({ q }); }} initialValue={query} />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="bg-card border border-border p-4 rounded-xl mb-6 shadow-sm animate-in-slide-down">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Price Range: ₹{priceRange.min} - ₹{priceRange.max}</p>
                <input 
                  type="range" min="0" max="1000" step="10"
                  value={priceRange.max} 
                  onChange={e => setPriceRange(p => ({ ...p, max: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-20 animate-spin text-3xl">⏳</div>
          ) : query ? (
            <div>
              <h2 className="text-xl font-bold mb-4">
                {filteredProducts.length} {t('items')} "{query}"
              </h2>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} {...p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 opacity-60">
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
                    onClick={() => { setQuery(term); setSearchParams({ q: term }); }}
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