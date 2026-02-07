"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Bell, Shield, CreditCard, Heart, LogOut, Edit, Eye, EyeOff, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Profile = () => {
  const { user, logout, updateProfile, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLang();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showSensitive, setShowSensitive] = useState({ phone: false, address: false });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
    if (user) setEditedName(user.name);
  }, [isAuthenticated, loading, navigate, user]);

  const handleUpdateName = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    await updateProfile({ name: editedName });
    setIsEditingName(false);
    setIsSaving(false);
  };

  const maskValue = (val?: string) => val ? val.replace(/^.{3}/, '***') : '***';

  const menuItems = [
    { icon: MapPin, label: "Addresses", path: "/addresses", emoji: "📍" },
    { icon: FileText, label: "My Orders", path: "/orders", emoji: "📋" },
    { icon: Heart, label: "Wishlist", path: "/wishlist", emoji: "❤️" },
    { icon: Bell, label: "Notifications", path: "/notifications", emoji: "🔔" },
    { icon: Shield, label: "Security", path: "/security", emoji: "🛡️" },
    { icon: CreditCard, label: "Wallet & Payments", path: "/wallet", emoji: "💳" },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-spin">⏳</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden mt-8">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-white flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl border-4 border-white/50 shadow-lg">
              👤
            </div>
            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          {isEditingName ? (
            <div className="flex gap-2">
              <input 
                value={editedName} 
                onChange={e => setEditedName(e.target.value)} 
                className="text-foreground px-2 py-1 rounded" 
                disabled={isSaving}
              />
              <Button size="sm" variant="secondary" onClick={handleUpdateName} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {user.name} <Edit className="h-4 w-4 cursor-pointer opacity-70" onClick={() => setIsEditingName(true)} />
            </h2>
          )}
          <p className="opacity-80 text-sm mt-1">{user.email}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <div className="bg-muted/30 rounded-xl border border-border p-4 text-center card-animate">
            <p className="text-3xl font-bold text-primary mb-1">📦</p>
            <p className="text-sm text-muted-foreground">Orders</p>
            <p className="text-2xl font-bold">5</p>
          </div>
          <div className="bg-muted/30 rounded-xl border border-border p-4 text-center card-animate" style={{ animationDelay: "50ms" }}>
            <p className="text-3xl font-bold text-primary mb-1">❤️</p>
            <p className="text-sm text-muted-foreground">Wishlist Items</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-muted/30 rounded-xl border border-border p-4 text-center card-animate" style={{ animationDelay: "100ms" }}>
            <p className="text-3xl font-bold text-primary mb-1">💰</p>
            <p className="text-sm text-muted-foreground">Wallet Balance</p>
            <p className="text-2xl font-bold">{formatPrice(1500, lang)}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 space-y-4 border-t border-border">
          <h3 className="font-bold text-lg mb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="font-mono text-sm">{showSensitive.phone ? user.phone : maskValue(user.phone)}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowSensitive(p => ({ ...p, phone: !p.phone }))}>
                {showSensitive.phone ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm truncate max-w-[150px]">{showSensitive.address ? user.address : maskValue(user.address)}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowSensitive(p => ({ ...p, address: !p.address }))}>
                {showSensitive.address ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-2 border-t border-border">
          <h3 className="font-bold text-lg mb-2">Account Settings</h3>
          {menuItems.map((item, i) => (
            <div 
              key={i} 
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-muted/20 px-2 rounded transition-colors list-item"
              style={{ animationDelay: `${i * 30}ms` }}
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.emoji}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-border">
          <Button variant="destructive" className="w-full gap-2 py-6 text-lg" onClick={logout}>
            <LogOut className="h-5 w-5" /> Logout
          </Button>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Profile;