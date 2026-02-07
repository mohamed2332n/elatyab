"use client";
import { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import ProductCard from "@/components/product-card";
import { isRateLimited } from "@/utils/rate-limiter";
import { validateData, ValidationError } from "@/utils/validation";

const SearchPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock search results - Enhanced with categories
  const mockProducts = [
    { id: "1", name: "Fresh Apple", weight: "500g", originalPrice: 199, discountedPrice: 129, discountPercent: 35, isInStock: true, category: "Fruits" },
    { id: "2", name: "Organic Banana", weight: "1 dozen", originalPrice: 89, discountedPrice: 69, discountPercent: 22, isInStock: true, category: "Fruits" },
    { id: "3", name: "Premium Mango", weight: "1 kg", originalPrice: 299, discountedPrice: 199, discountPercent: 33, isInStock: true, category: "Fruits" },
    { id: "4", name: "Fresh Spinach", weight: "250g", originalPrice: 49, discountedPrice: 39, discountPercent: 20, isInStock: true, category: "Vegetables" },
    { id: "5", name: "Red Grapes", weight: "500g", originalPrice: 149, discountedPrice: 99, discountPercent: 34, isInStock: true, category: "Fruits" },
    { id: "6", name: "Carrots", weight: "1 kg", originalPrice: 59, discountedPrice: 45, discountPercent: 24, isInStock: true, category: "Vegetables" },
    { id: "7", name: "Tomatoes", weight: "1 kg", originalPrice: 79, discountedPrice: 59, discountPercent: 25, isInStock: true, category: "Vegetables" },
    { id: "8", name: "Bell Peppers", weight: "500g", originalPrice: 99, discountedPrice: 75, discountPercent: 24, isInStock: true, category: "Vegetables" },
    { id: "9", name: "Lettuce", weight: "250g", originalPrice: 69, discountedPrice: 49, discountPercent: 29, isInStock: true, category: "Vegetables" },
    { id: "10", name: "Onions", weight: "1 kg", originalPrice: 39, discountedPrice: 29, discountPercent: 26, isInStock: true, category: "Vegetables" },
  ];

  const categories = ["All", "Fruits", "Vegetables", "Snacks", "Combos"];


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

    return { isValid: true };
  };

  const handleSearch = (query: string) => {
    const sanitizedQuery = sanitizeInput(query);
    
    // Validate search query
    const validation = validateSearchQuery(sanitizedQuery);
    if (!validation.isValid) {
      setError(validation.error || "Invalid search query");
      return;
    }
    
    setError(null);
    setSearchQuery(sanitizedQuery);

    // Save to recent searches
    const updatedSearches = [sanitizedQuery, ...recentSearches.filter(item => item !== sanitizedQuery)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    // Filter mock products based on sanitized query, price range, and category
    const results = mockProducts.filter(product => 
      product.name.toLowerCase().includes(sanitizedQuery.toLowerCase()) &&
      product.discountedPrice >= priceRange.min &&
      product.discountedPrice <= priceRange.max &&
      (!selectedCategory || selectedCategory === "All" || product.category === selectedCategory)
    );
    
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
            placeholder="Find Products here!" 
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-muted border border-input focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => clearSearch()}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card rounded-lg border border-border p-4 mb-6 card-animate">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span>🎯</span> Filters
            </h3>
            
            {/* Category Filter */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat === "All" ? null : cat);
                      handleSearch(searchQuery);
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      (cat === "All" && !selectedCategory) || selectedCategory === cat
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Price Range: ₹{priceRange.min} - ₹{priceRange.max}</p>
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
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                    placeholder="Min"
                    className="flex-1 px-2 py-1 border border-input rounded text-sm"
                  />
                  <input
                    type="number"
                    min={priceRange.min}
                    max="500"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
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
                setSelectedCategory(null);
                setShowFilters(false);
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