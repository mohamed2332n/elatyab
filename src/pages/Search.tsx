"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { isRateLimited } from "@/utils/rate-limiter";
import { apiService } from "@/services/api";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = async (query: string) => {
    // SECURE: Simple trim and length limit. React handles XSS by default during rendering.
    const trimmedQuery = query.trim().substring(0, 100);

    if (trimmedQuery.length < 1) {
      setError("Please enter a search term");
      return;
    }

    if (isRateLimited("search", 800)) {
      setError("Searching too fast! Please slow down.");
      return;
    }

    setError(null);
    setSearchQuery(trimmedQuery);
    setLoading(true);

    try {
      const products = await apiService.getProducts();
      
      const results = products.filter(product =>
        product.name.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(trimmedQuery.toLowerCase()))
      );

      setSearchResults(results);

      const updatedSearches = [
        trimmedQuery,
        ...recentSearches.filter(item => item !== trimmedQuery)
      ].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    } catch (err) {
      setError("Search failed. Please try again.");
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
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No results found</h3>
              </div>
            )}
          </div>
        ) : (
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
              <p className="text-muted-foreground text-center py-10">No recent searches</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;