"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Share2, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useCart } from "@/context/cart-context";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/services/api";
import { showError } from "@/utils/toast";
import { Product } from "@/services/api";

const ProductDetails = () => {
  const { theme } = useTheme();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        showError("Product ID is missing");
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const fetchedProduct = await apiService.getProduct(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          showError("Product not found");
          navigate("/");
        }
      } catch (error) {
        showError("Failed to load product");
        console.error("Error fetching product:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.discountedPrice,
        image: product.images[0],
        weight: product.weight
      });
      navigate("/cart");
    } catch (error) {
      showError("Failed to add to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-6 flex-grow">
          <div className="bg-muted h-64 w-full rounded-lg animate-pulse mb-4"></div>
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-12 bg-muted rounded animate-pulse"></div>
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
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
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
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
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
        />
        <div className="absolute top-4 right-4 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
          {product.discountPercent}% OFF
        </div>
      </div>
      
      {/* Image Thumbnails */}
      <div className="flex justify-center space-x-2 mt-2 px-4">
        {product.images.map((image, index) => (
          <img 
            key={index} 
            src={image} 
            alt={`Product ${index + 1}`} 
            className={`w-16 h-16 object-cover border-2 ${
              selectedImage === index ? "border-primary" : "border-border"
            } rounded cursor-pointer`} 
            onClick={() => setSelectedImage(index)} 
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
          {product.tags.map((tag, index) => (
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
              onClick={() => setQuantity(quantity + 1)}
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
            <ShoppingCart className="mr-2" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;