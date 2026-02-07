"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import ProductCard from "@/components/product-card";
import { isRateLimited } from "@/utils/rate-limiter";
import { validateData } from "@/utils/validation";
import { apiService } from "@/services/api";
import { showError } from "@/utils/toast";

const SearchPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Sanitize input to prevent injection attacks
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potentially dangerous characters
      .substring(0, 100); // Limit length
  };

  const validateSearchQuery = (query: string): { isValid: boolean; error?: string } => {
    // Check for rate limiting
    if (isRateLimited("search", 1000)) {
      return { isValid: false, error: "Please wait before searching again" };
    }

    // Basic validation
    if (query.length < 1) {
      return { isValid: false, error: "Search query is too short" };
    }

    if (query.length > 100) {
      return { isValid: false, error: "Search query is too long" };
    }

    // Additional validation for malicious patterns
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(query)) {
        return { isValid: false, error: "Invalid characters in search query" };
      }
    }

    return { isValid: true };
  };

  const handleSearch = async (query: string) => {
    const sanitizedQuery = sanitizeInput(query);

    // Validate search query
    const validation = validateSearchQuery(sanitizedQuery);
    if (!validation.isValid) {
      setError(validation.error || "Invalid search query");
      return;
    }

    setError(null);
    setSearchQuery(sanitizedQuery);
    setLoading(true);

    try {
      // In a real app, this would call an API endpoint
      // For now, we'll use the mock data but with proper validation
      const products = await apiService.getProducts();
      
      // Filter products based on sanitized query
      const results = products.filter(product =>
        product.name.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(sanitizedQuery.toLowerCase()))
      );

      setSearchResults(results);

      // Save to recent searches
      const updatedSearches = [
        sanitizedQuery,
        ...recentSearches.filter(item => item !== sanitizedQuery)
      ].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    } catch (err) {
      setError("Failed to perform search. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
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
            placeholder="Find Products here!"
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-muted border border-input focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-md p-3 mb-4 text-destructive text-sm">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        {/* Search Results */}
        {searchQuery && !loading ? (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {searchResults.length} results for "{searchQuery}"
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    weight={product.weight}
                    originalPrice={product.originalPrice}
                    discountedPrice={product.discountedPrice}
                    discountPercent={product.discountPercent}
                    image={product.images[0]}
                    isInStock={product.isInStock}
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
                <Button variant="link" onClick={clearRecentSearches}>
                  Clear All
                </Button>
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
                {["Fruits", "Vegetables", "Snacks", "Combos", "Seasonal", "Organic"].map(
                  (category, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-lg p-3 border border-border text-center cursor-pointer hover:bg-muted"
                      onClick={() => handleSearch(category)}
                    >
                      {category}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;