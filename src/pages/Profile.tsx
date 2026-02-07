"use client";
import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Bell, Shield, CreditCard, Heart, LogOut, Edit, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";

const Profile = () => {
  const { user, logout, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully! 👋");
    navigate("/");
  };

  const handleUpdateProfile = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ name: editedName });
      setIsEditingName(false);
      toast.success("Profile updated! ✨");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { icon: User, label: "Personal Information", path: "/profile/personal", emoji: "👤" },
    { icon: MapPin, label: "Addresses", path: "/profile/addresses", emoji: "📍" },
    { icon: FileText, label: "My Orders", path: "/orders", emoji: "📋" },
    { icon: Heart, label: "Wishlist", path: "/wishlist", emoji: "❤️" },
    { icon: Bell, label: "Notifications", path: "/profile/notifications", emoji: "🔔" },
    { icon: Shield, label: "Security", path: "/profile/security", emoji: "🛡️" },
    { icon: CreditCard, label: "Payment Methods", path: "/profile/payment", emoji: "💳" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl emoji-bounce mb-4">🚪</div>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Please log in to view your profile</p>
            <Button onClick={() => navigate("/login")} className="gap-2">
              <span>🔑</span> Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <span className="emoji-bounce">👤</span> My Profile
        </h1>
        <p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 mb-8 card-animate">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-primary shadow-lg"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 shadow-lg hover:scale-110 transition-transform"
                  onClick={() => toast.info("Avatar upload coming soon!")}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div>
                {isEditingName ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-3 py-1 border rounded-lg bg-background"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                      className="gap-1"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(user.name);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {user.name}
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-lg hover:scale-110 transition-transform"
                    >
                      ✏️
                    </button>
                  </h2>
                )}
                <p className="text-muted-foreground flex items-center gap-1">
                  <span>✨</span> Verified Member
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300">
            <p className="flex items-center gap-2">
              <span>✅</span> Your account is active and verified
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-4 text-center card-animate">
            <p className="text-3xl font-bold text-primary mb-1">📦</p>
            <p className="text-sm text-muted-foreground">Orders</p>
            <p className="text-2xl font-bold">5</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 text-center card-animate" style={{ animationDelay: "50ms" }}>
            <p className="text-3xl font-bold text-primary mb-1">❤️</p>
            <p className="text-sm text-muted-foreground">Wishlist Items</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 text-center card-animate" style={{ animationDelay: "100ms" }}>
            <p className="text-3xl font-bold text-primary mb-1">💰</p>
            <p className="text-sm text-muted-foreground">Wallet Balance</p>
            <p className="text-2xl font-bold">{formatPrice(1500, lang)}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-md mb-8">
          <h3 className="font-bold p-4 border-b border-border">Account Settings</h3>
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/30 transition-colors group list-item"
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => item.path && navigate(item.path)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-medium group-hover:translate-x-1 transition-transform">{item.label}</span>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
          <h3 className="font-bold text-destructive mb-4 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h3>
          <Button
            variant="destructive"
            className="gap-2 w-full md:w-auto hover:scale-105 transition-transform"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            You will be logged out from all devices.
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
          <p className="mb-2">🔒 Your personal information is encrypted and secure</p>
          <p>Need help? <button className="text-primary hover:underline">Contact Support</button></p>
        </div>
      </div>
    </div>
  );
};

export default Profile;