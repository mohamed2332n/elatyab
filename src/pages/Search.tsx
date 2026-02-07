"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import ProductCard from "@/components/product-card";

const SearchPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Mock search results
  const mockProducts = [
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
    },
    {
      id: "5",
      name: "Red Grapes",
      weight: "500g",
      originalPrice: 149,
      discountedPrice: 99,
      discountPercent: 34,
      isInStock: true
    },
    {
      id: "6",
      name: "Carrots",
      weight: "1 kg",
      originalPrice: 59,
      discountedPrice: 45,
      discountPercent: 24,
      isInStock: true
    }
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    
    // Save to recent searches
    const updatedSearches = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    
    // Filter mock products based on query
    const results = mockProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
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
        
        {/* Search Results */}
        {searchQuery ? (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {searchResults.length} results for "{searchQuery}"
            </h2>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} {...product} />
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