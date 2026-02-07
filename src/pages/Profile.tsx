"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Bell, Shield, CreditCard, Heart, LogOut, Edit, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

const Profile = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [showSensitiveData, setShowSensitiveData] = useState({
    phone: false,
    address: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    toast.success("You have been logged out");
    navigate("/");
  };

  const toggleSensitiveData = (field: 'phone' | 'address') => {
    setShowSensitiveData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/(\+\d{2}\s)\d{7}(\d{3})/, "$1*******$2");
  };

  const maskAddress = (address?: string) => {
    if (!address) return "";
    const parts = address.split(",");
    if (parts.length < 2) return "*******";
    return `*******, ${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
  };

  const menuItems = [
    { icon: User, label: "Personal Information", path: "/profile/personal" },
    { icon: MapPin, label: "Addresses", path: "/profile/addresses" },
    { icon: Bell, label: "Notifications", path: "/profile/notifications" },
    { icon: Shield, label: "Security", path: "/profile/security" },
    { icon: CreditCard, label: "Payment Methods", path: "/profile/payment" },
    { icon: Heart, label: "Wishlist", path: "/wishlist" },
    { icon: LogOut, label: "Logout", action: handleLogout }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        {/* Profile Header */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center">
            <div className="relative">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <Button variant="secondary" size="icon" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
            <p className="text-sm text-primary">
              Your personal information is protected and masked by default. Click the icons to reveal.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="font-mono">
                  {showSensitiveData.phone ? user?.phone : maskPhone(user?.phone)}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleSensitiveData('phone')}
              >
                {showSensitiveData.phone ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-muted-foreground mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <span>
                  {showSensitiveData.address ? user?.address : maskAddress(user?.address)}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleSensitiveData('address')}
              >
                {showSensitiveData.address ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted"
              onClick={item.action ? item.action : () => item.path && navigate(item.path)}
            >
              <item.icon className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Security Information */}
        <div className="mt-6 p-4 bg-card rounded-lg border border-border">
          <h3 className="font-bold mb-2">Security Information</h3>
          <p className="text-sm text-muted-foreground">
            Session tokens are managed securely via in-memory state. For your safety, sensitive data is masked during viewing. Always log out when using shared devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;