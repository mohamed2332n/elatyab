"use client";
import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useCart } from "@/context/cart-context";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ProductDetails = () => {
  const { theme } = useTheme();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock product data with validation
  const mockProducts: Record<string, any> = {
    "1": {
      id: "1",
      name: "Fresh Organic Apples",
      description: "Crisp and juicy organic apples sourced directly from local farms. Perfect for snacking or adding to your favorite recipes.",
      weight: "1 kg",
      originalPrice: 199,
      discountedPrice: 129,
      discountPercent: 35,
      isInStock: true,
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      tags: ["Organic", "Local", "Fresh"],
      rating: 4.5,
      reviewsCount: 128,
      origin: "Himalayan Farms, India",
      harvestDate: "2023-05-15",
      freshness: "Very Fresh"
    },
    "2": {
      id: "2",
      name: "Organic Banana",
      description: "Fresh organic bananas from sustainable farms.",
      weight: "1 dozen",
      originalPrice: 89,
      discountedPrice: 69,
      discountPercent: 22,
      isInStock: true,
      images: ["/placeholder.svg", "/placeholder.svg"],
      tags: ["Organic", "Fresh"],
      rating: 4.3,
      reviewsCount: 95,
      origin: "Kerala Farms, India",
      harvestDate: "2023-05-18",
      freshness: "Very Fresh"
    }
  };

  useEffect(() => {
    // Validate product ID
    if (!id || typeof id !== 'string') {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }

    // In a real app, this would be an API call with authentication
    // For now, we check against mock data
    const foundProduct = mockProducts[id];
    
    if (!foundProduct) {
      setError("Product not found");
      setLoading(false);
      return;
    }

    // Simulate API delay
    setTimeout(() => {
      setProduct(foundProduct);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Validate product before adding to cart
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountedPrice,
      image: product.images[0],
      weight: product.weight
    });
    
    toast.success("Added to cart");
    navigate("/cart");
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-muted w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Product Not Available</h2>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              ← Back
            </Button>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleWishlist}>
                <Heart className={isWishlisted ? "fill-destructive text-destructive" : ""} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Product Images */}
      <div className="relative">
        <img 
          src={product.images[selectedImage]} 
          alt={product.name} 
          className="w-full h-64 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-4 right-4 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
          {product.discountPercent}% OFF
        </div>
      </div>
      
      {/* Image Thumbnails */}
      <div className="flex justify-center space-x-2 mt-2 px-4">
        {product.images.map((image: string, index: number) => (
          <img 
            key={index} 
            src={image} 
            alt={`Product ${index + 1}`} 
            className={`w-16 h-16 object-cover border-2 ${selectedImage === index ? "border-primary" : "border-border"} rounded cursor-pointer`}
            onClick={() => setSelectedImage(index)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        ))}
      </div>
      
      {/* Product Info */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 font-bold">{product.rating}</span>
              <span className="text-xs ml-1">({product.reviewsCount})</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">{product.weight}</p>
        </div>
        
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold">₹{product.discountedPrice}</span>
            {product.originalPrice > product.discountedPrice && (
              <span className="text-lg text-muted-foreground line-through ml-2">₹{product.originalPrice}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Inclusive of all taxes</p>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.tags.map((tag: string, index: number) => (
            <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Description */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Description</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </div>
        
        {/* Product Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-sm text-muted-foreground">Origin</p>
            <p className="font-medium">{product.origin}</p>
          </div>
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-sm text-muted-foreground">Harvest Date</p>
            <p className="font-medium">{product.harvestDate}</p>
          </div>
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-sm text-muted-foreground">Freshness</p>
            <p className="font-medium text-green-500">{product.freshness}</p>
          </div>
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-sm text-muted-foreground">Availability</p>
            <p className={product.isInStock ? "font-medium text-green-500" : "font-medium text-destructive"}>
              {product.isInStock ? "In Stock" : "Out of Stock"}
            </p>
          </div>
        </div>
        
        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-medium">Quantity</span>
          <div className="flex items-center border border-input rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <span className="px-4">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={() => setQuantity(Math.min(20, quantity + 1))}
            >
              +
            </Button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={toggleWishlist}
          >
            <Heart className={`mr-2 ${isWishlisted ? "fill-destructive text-destructive" : ""}`} />
            Wishlist
          </Button>
          <Button 
            className="flex-1" 
            size="lg" 
            onClick={handleAddToCart} 
            disabled={!product.isInStock}
          >
            <ShoppingCart className="mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;