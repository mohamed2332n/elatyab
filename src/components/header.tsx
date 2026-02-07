import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ShoppingBag } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <span className="text-3xl emoji-bounce">🛒</span>
          <h1 className="text-2xl font-bold hidden sm:block">Elatyab</h1>
        </div>

        {/* Right Side - Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Shopping Bag Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/cart")}
                className="hover:scale-110 transition-transform"
                title="Go to cart"
              >
                <span className="text-xl">🛍️</span>
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMenu(!showMenu)}
                  className="hover:scale-110 transition-transform"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                </Button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-in-slide-down">
                    <div className="p-3 border-b border-border bg-muted/50">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/orders");
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Orders
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="gap-2"
              >
                <span>🔑</span> Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="gap-2"
              >
                <span>🎉</span> Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
