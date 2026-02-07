"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { apiService } from "@/services/api";
import { showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
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
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-6 flex-grow">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
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
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-lg border border-border p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold">Order #{order.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.date} at {order.deliveryTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.total}</p>
                  <div className="flex items-center mt-1">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)} mr-2`}></span>
                    <span className="text-sm">{order.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{order.items} items</p>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {order.status === "Delivered" && <Button size="sm">Reorder</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Order Tracking */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Track Your Order</h2>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-between mb-8">
              {["Order Placed", "Confirmed", "Packed", "Out for Delivery", "Delivered"].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-8 h-8 rounded-full bg-primary mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-xs">{step}</p>
                </div>
              ))}
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="font-medium">Current Status: Out for Delivery</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your order is on its way and will be delivered by 6:30 PM
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Orders;