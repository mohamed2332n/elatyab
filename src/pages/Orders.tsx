"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { apiService } from "@/services/api";
import { showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";

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
  const { t, i18n } = useTranslation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const fetchedOrders = await apiService.getOrders();
          setOrders(fetchedOrders);
        } catch (error) {
          showError("Failed to load orders");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated]);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "Delivered": return "✅";
      case "Out for delivery": return "🚚";
      case "Confirmed": return "📦";
      default: return "⏳";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <span>📋</span> {t('myOrder')}
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t('noResults')}</p>
            <Button onClick={() => navigate("/")} className="mt-4">{t('shopNow')}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span>{getStatusEmoji(order.status)}</span>
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.date} • {order.deliveryTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">{formatPrice(order.total, i18n.language)}</p>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{order.status}</span>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {order.items} {t('items')}
                  </p>
                  <div className="space-x-2 rtl:space-x-reverse">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                      {t('viewAll')}
                    </Button>
                    {order.status === "Delivered" && (
                      <Button size="sm">{t('buyNow')}</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{t('offers')}</h2>
          <div className="bg-muted/30 rounded-lg p-8 relative overflow-hidden border border-border">
            <div className="flex justify-between relative z-10">
              {["Placed", "Confirmed", "Packed", "Shipping", "Delivered"].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2">
                    {i < 3 ? "✓" : i + 1}
                  </div>
                  <p className="text-xs font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Orders;