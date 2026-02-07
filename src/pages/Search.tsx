"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";
import ProductCard from "@/components/product-card";
import { isRateLimited } from "@/utils/rate-limiter";
import { productsService } from "@/services/supabase/products";
import { showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  discount_percentage: number;
  image_url: string;
  is_in_stock: boolean;
  category_id: string;
}

const SearchPage = () => {
  const { theme } = useTheme();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Error parsing recent searches from localStorage:", e);
        setRecentSearches([]);
      }
    }
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const { data, error } = await productsService.getAllProducts();
      if (!error && data) {
        setAllProducts(data);
      } else {
        showError("Failed to load products");
      }
    } catch (err) {
      console.error("Error loading products:", err);
      showError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, "")
      .substring(0, 100);
  };

  const validateSearchQuery = (query: string): { isValid: boolean; error?: string } => {
    if (isRateLimited("search", 1000)) {
      return { isValid: false, error: "Please wait before searching again" };
    }
    return { isValid: true };
  };

  const handleSearch = (query: string) => {
    const sanitizedQuery = sanitizeInput(query);
    const validation = validateSearchQuery(sanitizedQuery);
    
    if (!validation.isValid) {
      setError(validation.error || "Invalid search query");
      return;
    }
    
    setError(null);
    setSearchQuery(sanitizedQuery);

    if (sanitizedQuery) {
      const updatedSearches = [sanitizedQuery, ...recentSearches.filter(item => item !== sanitizedQuery)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }

    const productName = lang === "ar" ? "name_ar" : "name_en";
    const results = allProducts.filter(product => {
      const productNameStr = product[productName as keyof Product] as string;
      const discountedPrice = product.price * (1 - product.discount_percentage / 100);
      return (
        productNameStr.toLowerCase().includes(sanitizedQuery.toLowerCase()) &&
        discountedPrice >= priceRange.min &&
        discountedPrice <= priceRange.max &&
        product.is_in_stock
      );
    });
    
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Search Header */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide" : "Show"}
          </Button>
        </div>

        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            {/* Price Range Filter */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">
                Price Range: {formatPrice(priceRange.min, lang)} - {formatPrice(priceRange.max, lang)}
              </p>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange.max}
                  onChange={(e) => {
                    setPriceRange({ ...priceRange, max: parseInt(e.target.value) });
                    handleSearch(searchQuery);
                  }}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={priceRange.max}
                    value={priceRange.min}
                    onChange={(e) => {
                      setPriceRange({ ...priceRange, min: parseInt(e.target.value) });
                      handleSearch(searchQuery);
                    }}
                    placeholder="Min"
                    className="flex-1 px-2 py-1 border border-input rounded text-sm"
                  />
                  <input
                    type="number"
                    min={priceRange.min}
                    max="500"
                    value={priceRange.max}
                    onChange={(e) => {
                      setPriceRange({ ...priceRange, max: parseInt(e.target.value) });
                      handleSearch(searchQuery);
                    }}
                    placeholder="Max"
                    className="flex-1 px-2 py-1 border border-input rounded text-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPriceRange({ min: 0, max: 500 });
                setShowFilters(false);
                handleSearch(searchQuery);
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        )}
        
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-md p-3 mb-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchQuery ? (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {searchResults.length} results for "{searchQuery}"
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: lang === "ar" ? product.name_ar : product.name_en,
                      price: product.price,
                      discount: product.discount_percentage,
                      image: product.image_url,
                      inStock: product.is_in_stock,
                    }}
                    onAddClick={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-muted w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or check out our categories
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Recent Searches */
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Searches</h2>
              {recentSearches.length > 0 && (
                <Button variant="link" onClick={clearRecentSearches}>Clear All</Button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-3 bg-card rounded-lg border border-border cursor-pointer hover:bg-muted"
                    onClick={() => handleSearch(search)}
                  >
                    <Search className="h-4 w-4 text-muted-foreground mr-3" />
                    <span>{search}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-muted w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No recent searches</h3>
                <p className="text-muted-foreground">
                  Search for products to see them here
                </p>
              </div>
            )}
            
            {/* Popular Categories */}
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Popular Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Fruits", "Vegetables", "Snacks", "Combos", "Seasonal", "Organic"].map((category, index) => (
                  <div 
                    key={index} 
                    className="bg-card rounded-lg p-3 border border-border text-center cursor-pointer hover:bg-muted"
                    onClick={() => handleSearch(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;