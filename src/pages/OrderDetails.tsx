"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { showError } from "@/utils/toast";

interface OrderDetailItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: string;
}

interface OrderDetail {
  id: string;
  date: string;
  status: "Confirmed" | "Packed" | "Out for delivery" | "Delivered";
  total: number;
  items: OrderDetailItem[];
  deliveryTime: string;
  deliveryAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: "wallet" | "upi" | "card" | "cod";
  estimatedDelivery: string;
  orderNotes?: string;
}

// Mock order details data
const mockOrderDetails: Record<string, OrderDetail> = {
  "ORD-001": {
    id: "ORD-001",
    date: "2023-05-15",
    status: "Delivered",
    total: 450,
    deliveryTime: "06:30 PM",
    items: [
      { id: "1", name: "Fresh Organic Apples", price: 129, quantity: 1, weight: "1 kg", image: "/placeholder.svg" },
      { id: "2", name: "Organic Banana", price: 69, quantity: 2, weight: "1 dozen", image: "/placeholder.svg" },
      { id: "5", name: "Red Grapes", price: 99, quantity: 2, weight: "500g", image: "/placeholder.svg" }
    ],
    deliveryAddress: {
      name: "Ahmed Hassan",
      phone: "+966-12-345-6789",
      email: "ahmed@example.com",
      address: "123 Main Street, Building A",
      city: "Riyadh",
      postalCode: "12345"
    },
    paymentMethod: "wallet",
    estimatedDelivery: "2023-05-15",
    orderNotes: "Please ring the bell twice"
  },
  "ORD-002": {
    id: "ORD-002",
    date: "2023-05-10",
    status: "Out for delivery",
    total: 320,
    deliveryTime: "05:45 PM",
    items: [
      { id: "3", name: "Premium Mango", price: 199, quantity: 1, weight: "1 kg", image: "/placeholder.svg" },
      { id: "4", name: "Fresh Spinach", price: 39, quantity: 1, weight: "250g", image: "/placeholder.svg" },
      { id: "6", name: "Carrots", price: 45, quantity: 1, weight: "1 kg", image: "/placeholder.svg" }
    ],
    deliveryAddress: {
      name: "Ahmed Hassan",
      phone: "+966-12-345-6789",
      email: "ahmed@example.com",
      address: "123 Main Street, Building A",
      city: "Riyadh",
      postalCode: "12345"
    },
    paymentMethod: "upi",
    estimatedDelivery: "2023-05-10"
  },
  "ORD-003": {
    id: "ORD-003",
    date: "2023-05-05",
    status: "Confirmed",
    total: 780,
    deliveryTime: "07:00 PM",
    items: [
      { id: "7", name: "Orange Juice", price: 120, quantity: 2, image: "/placeholder.svg" },
      { id: "8", name: "Watermelon", price: 199, quantity: 1, weight: "5 kg", image: "/placeholder.svg" },
      { id: "5", name: "Red Grapes", price: 99, quantity: 2, weight: "500g", image: "/placeholder.svg" },
      { id: "1", name: "Fresh Organic Apples", price: 129, quantity: 1, weight: "1 kg", image: "/placeholder.svg" }
    ],
    deliveryAddress: {
      name: "Ahmed Hassan",
      phone: "+966-12-345-6789",
      email: "ahmed@example.com",
      address: "123 Main Street, Building A",
      city: "Riyadh",
      postalCode: "12345"
    },
    paymentMethod: "card",
    estimatedDelivery: "2023-05-08"
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "Confirmed":
      return { emoji: "✅", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", icon: "📦" };
    case "Packed":
      return { emoji: "📦", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", icon: "📦" };
    case "Out for delivery":
      return { emoji: "🚚", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20", icon: "🚚" };
    case "Delivered":
      return { emoji: "🎉", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20", icon: "✨" };
    default:
      return { emoji: "⏳", color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-900/20", icon: "⏳" };
  }
};

const getPaymentMethodInfo = (method: string) => {
  switch (method) {
    case "wallet":
      return { emoji: "💰", label: "Wallet" };
    case "upi":
      return { emoji: "📱", label: "UPI" };
    case "card":
      return { emoji: "💳", label: "Credit/Debit Card" };
    case "cod":
      return { emoji: "🚚", label: "Cash on Delivery" };
    default:
      return { emoji: "💳", label: "Payment" };
  }
};

const OrderDetails = () => {
  const { theme } = useTheme();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch order details
    const fetchOrderDetails = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!orderId || !mockOrderDetails[orderId]) {
          showError("Order not found");
          navigate("/orders");
          return;
        }

        setOrder(mockOrderDetails[orderId]);
      } catch (error) {
        showError("Failed to load order details");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-6xl emoji-spin mb-6">📦</div>
            <h1 className="text-2xl font-bold mb-3">Loading order details...</h1>
            <div className="flex items-center justify-center gap-1">
              <span className="emoji-bounce">🔄</span>
              <span className="text-muted-foreground">Just a moment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-7xl emoji-float mb-6">😢</div>
            <h2 className="text-3xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Sorry, we couldn't find the order you're looking for.
            </p>
            <Button 
              onClick={() => navigate("/orders")}
              size="lg"
              className="gap-2 hover:scale-105 transition-transform"
            >
              <span>📋</span> Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentMethodInfo(order.paymentMethod);

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orders")}
            className="hover:scale-110 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-grow">
            <h1 className="text-3xl font-bold flex items-center gap-2 animate-in-slide-up">
              <span>{statusInfo.emoji}</span> Order {order.id}
            </h1>
            <p className="text-muted-foreground mt-1">
              <span className="emoji-wiggle">📅</span> {order.date}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className={`rounded-lg border border-border p-6 card-animate ${statusInfo.bgColor}`}>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className={statusInfo.color}>{statusInfo.emoji}</span> Order Status
              </h2>
              <p className={`text-lg font-bold ${statusInfo.color} mb-2`}>
                {order.status}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span>⏱️</span> Estimated delivery: {order.estimatedDelivery}
              </p>
            </div>

            {/* Order Items */}
            <div className="card-animate" style={{ animationDelay: "50ms" }}>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>📦</span> Order Items ({order.items.length})
              </h2>
              <div className="space-y-3 bg-card rounded-lg border border-border p-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start gap-4 flex-grow">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.weight && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span>📦</span> {item.weight}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{item.price}</p>
                      <p className="text-xs text-muted-foreground">
                        × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card-animate" style={{ animationDelay: "100ms" }}>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>📍</span> Delivery Address
              </h2>
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-grow">
                      <p className="font-medium">{order.deliveryAddress.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <Phone className="h-5 w-5 text-primary" />
                    <p className="text-sm">{order.deliveryAddress.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="text-sm">{order.deliveryAddress.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="card-animate" style={{ animationDelay: "150ms" }}>
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="bg-card rounded-lg border border-border p-5 space-y-4">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">₹{Math.round(order.total * 0.85)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Taxes</p>
                  <p className="font-medium">₹{Math.round(order.total * 0.15)}</p>
                </div>
                {order.total < 500 && (
                  <div className="flex justify-between text-orange-600">
                    <p className="text-sm">Delivery Charge</p>
                    <p className="font-medium">₹40</p>
                  </div>
                )}
                <div className="border-t border-border pt-4 flex justify-between">
                  <p className="font-bold">Total Price</p>
                  <p className="font-bold text-green-600 text-lg">₹{order.total}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card-animate" style={{ animationDelay: "200ms" }}>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment Method
              </h2>
              <div className="bg-card rounded-lg border border-border p-5">
                <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
                  <span className="text-2xl">{paymentInfo.emoji}</span>
                  <div>
                    <p className="font-medium">{paymentInfo.label}</p>
                    <p className="text-xs text-muted-foreground">Order paid successfully</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="card-animate" style={{ animationDelay: "250ms" }}>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" /> Delivery Time
              </h2>
              <div className="bg-card rounded-lg border border-border p-5">
                <p className="font-bold text-lg flex items-center gap-2">
                  <span className="emoji-bounce">🕐</span> {order.deliveryTime}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Estimated delivery window</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 card-animate" style={{ animationDelay: "300ms" }}>
              {order.status === "Delivered" && (
                <Button className="w-full gap-2 hover:scale-105 transition-transform">
                  <span>🔄</span> Reorder
                </Button>
              )}
              <Button variant="outline" className="w-full gap-2 hover:scale-105 transition-transform">
                <span>💬</span> Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.orderNotes && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 card-animate" style={{ animationDelay: "350ms" }}>
            <p className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
              <span>📝</span> Delivery Notes
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">{order.orderNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
