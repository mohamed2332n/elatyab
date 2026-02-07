"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { apiService } from "@/services/api";
import { showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  deliveryTime: string;
}

const Orders = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await apiService.getOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        showError("Failed to load orders");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "Delivered":
        return "✅";
      case "Out for delivery":
        return "🚚";
      case "Confirmed":
        return "📦";
      default:
        return "⏳";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500";
      case "Out for delivery":
        return "bg-blue-500";
      case "Confirmed":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-6xl emoji-spin mb-6">📋</div>
            <h1 className="text-2xl font-bold mb-3">Loading your orders...</h1>
            <div className="flex items-center justify-center gap-1">
              <span className="emoji-bounce">🔄</span>
              <span className="text-muted-foreground">Just a moment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-7xl emoji-float mb-6">📦</div>
            <h2 className="text-3xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Looks like you haven't placed any orders yet. Start shopping to get some!
            </p>
            <Button 
              onClick={() => navigate("/")}
              size="lg"
              className="gap-2 hover:scale-105 transition-transform"
            >
              <span>🌱</span> Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 animate-in-slide-up">
          <span className="emoji-bounce">📋</span> My Orders
        </h1>
        <p className="text-muted-foreground mb-6">
          <span className="emoji-wiggle">📦</span> {orders.length} {orders.length === 1 ? "order" : "orders"} placed
        </p>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <div 
              key={order.id} 
              className="bg-card rounded-lg border border-border p-5 card-animate hover:border-primary/50 transition-all shadow-md hover:shadow-lg"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="emoji-bounce">{getStatusEmoji(order.status)}</span>
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="mr-3">📅 {order.date}</span>
                    <span>🕐 {order.deliveryTime}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">₹{order.total.toFixed(2)}</p>
                  <div className="flex items-center mt-2 justify-end gap-2 bg-muted/50 rounded-full px-3 py-1">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/30 pt-3 flex justify-between items-center">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span>📦</span> {order.items} {order.items === 1 ? "item" : "items"}
                </p>
                <div className="space-x-2 flex">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="transition-all hover:translate-x-1"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    👁️ View Details
                  </Button>
                  {order.status === "Delivered" && (
                    <Button 
                      size="sm"
                      className="gap-1 hover:scale-105 transition-transform"
                    >
                      <span>🔄</span> Reorder
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Tracking Timeline */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="emoji-spin">🚚</span> Track Your Order
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8 card-animate">
            <div className="flex justify-between mb-10 relative">
              {/* Connecting Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 opacity-30" style={{ zIndex: 0 }}></div>

              {/* Timeline Steps */}
              {[
                { step: "Order Placed", emoji: "📝" },
                { step: "Confirmed", emoji: "✅" },
                { step: "Packed", emoji: "📦" },
                { step: "Out for Delivery", emoji: "🚚" },
                { step: "Delivered", emoji: "🎉" }
              ].map((item, index) => (
                <div key={index} className="text-center relative" style={{ zIndex: 1 }}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-3 flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform">
                    {item.emoji}
                  </div>
                  <p className="text-xs font-semibold text-foreground">{item.step}</p>
                </div>
              ))}
            </div>

            {/* Current Status Info */}
            <div className="bg-white dark:bg-black/30 rounded-lg p-5 border border-blue-200 dark:border-blue-800 mt-4">
              <p className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="emoji-bounce">🚚</span> Current Status: Out for Delivery
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <span>⏱️</span> Your order is on its way and will be delivered by 6:30 PM
              </p>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm text-muted-foreground">
                  <span className="emoji-wiggle">📍</span> Last update: Today at 2:45 PM - Out for delivery
                </p>
              </div>
            </div>

            {/* Help Message */}
            <div className="mt-4">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-all">
                <span>❓</span> Need help with your order?
              </button>
            </div>
          </div>
        </section>

        {/* Customer Support Section */}
        <section className="mt-10 mb-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
            <p className="text-sm text-center text-muted-foreground">
              <span className="emoji-bounce">💬</span> Have questions about your order? <button className="text-primary hover:underline font-semibold">Contact support</button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Orders;