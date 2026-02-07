import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { AuthProvider, useAuth } from "@/context/auth-context";
import FloatingCart from "@/components/floating-cart";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Wallet from "./pages/Wallet";
import Offers from "./pages/Offers";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Search from "./pages/Search";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl emoji-spin mb-4">⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/search" element={<Search />} />
    <Route path="/categories" element={<Categories />} />
    <Route path="/offers" element={<Offers />} />
    <Route path="/product/:id" element={<ProductDetails />} />
    
    {/* Protected Routes */}
    <Route 
      path="/cart" 
      element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/checkout" 
      element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/wallet" 
      element={
        <ProtectedRoute>
          <Wallet />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/orders" 
      element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/orders/:orderId" 
      element={
        <ProtectedRoute>
          <OrderDetails />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/profile" 
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } 
    />
    
    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <FloatingCart />
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;