"use client";

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
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
          <span className="text-3xl">🛒</span>
          <h1 className="text-2xl font-bold hidden sm:block">FreshCart</h1>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="hover:scale-110 transition-transform">
                <span className="text-xl">🛍️</span>
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} className="hover:scale-110 transition-transform">
                  <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.name} className="w-8 h-8 rounded-full" />
                </Button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-in-slide-down">
                    <div className="p-3 border-b border-border bg-muted/50">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <button onClick={() => { navigate("/profile"); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm transition-colors">
                      <User className="h-4 w-4" /> Profile
                    </button>
                    <button onClick={() => { logout(); setShowMenu(false); navigate("/"); }} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive text-sm transition-colors">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};