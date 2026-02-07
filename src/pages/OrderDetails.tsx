"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { ordersService } from "@/services/supabase/orders";
import { useAuth } from "@/context/auth-context";
import { showError } from "@/utils/toast";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";

interface OrderItem {
  id: string;
  product_name_en: string;
  product_name_ar: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  items: OrderItem[];
  delivery_address: string;
}

const getStatusInfo = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return { emoji: "⏳", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20" };
    case "confirmed":
      return { emoji: "✅", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" };
    case "shipped":
      return { emoji: "🚚", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" };
    case "delivered":
      return { emoji: "🎉", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" };
    case "cancelled":
      return { emoji: "❌", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" };
    default:
      return { emoji: "📦", color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-900/20" };
  }
};

const OrderDetails = () => {
  const { theme } = useTheme();
  const { lang } = useLang();
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) {
      showError("Order not found");
      navigate("/orders");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await ordersService.getOrder(orderId);
        
        if (!error && data) {
          setOrder(data);
        } else {
          showError("Order not found");
          navigate("/orders");
        }
      } catch (error) {
        showError("Failed to load order details");
        console.error("Error fetching order details:", error);
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, navigate]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/orders")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
            <p className="text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString(lang)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0">
                    <div>
                      <h3 className="font-semibold">
                        {lang === "ar" ? item.product_name_ar : item.product_name_en}
                      </h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.unit_price, lang)}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.total_price, lang)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-bold mb-4">Order Status</h2>
              <div className={`${statusInfo.bgColor} rounded-lg p-4 ${statusInfo.color}`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{statusInfo.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg capitalize">{order.status}</h3>
                    <p className="text-sm">Your order is {order.status.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.total, lang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Address</span>
                </div>
                <p className="text-sm text-foreground">{order.delivery_address}</p>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-600">{formatPrice(order.total, lang)}</span>
              </div>
              <Button 
                onClick={() => navigate("/orders")} 
                className="w-full mt-4"
                variant="outline"
              >
                View All Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
