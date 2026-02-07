"use client";
import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Bell, Shield, CreditCard, Heart, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    // In a real app, this would fetch user data from an authenticated API
    const checkAuth = () => {
      // For demo purposes, we'll use localStorage
      const authenticated = localStorage.getItem("authenticated");
      
      if (!authenticated) {
        navigate("/");
        return;
      }
      
      // Mock user data (in a real app, this would come from an API)
      setUser({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 9876543210",
        address: "123 Main Street, Apartment 4B, New Delhi, 110001"
      });
      
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    // In a real app, this would call an API to invalidate the session
    localStorage.removeItem("authenticated");
    toast.success("You have been logged out");
    navigate("/");
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You must be logged in to view this page</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

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
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          {/* Privacy Notice */}
          <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
            <p className="text-sm text-primary">
              Your personal information is protected and only visible to you.
            </p>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-muted-foreground mr-2" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-muted-foreground mr-2" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <span>{user.address}</span>
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
        
        {/* Security Notice */}
        <div className="mt-6 p-4 bg-card rounded-lg border border-border">
          <h3 className="font-bold mb-2">Security Information</h3>
          <p className="text-sm text-muted-foreground">
            Your account is protected with industry-standard security measures. 
            Always log out when using shared devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;