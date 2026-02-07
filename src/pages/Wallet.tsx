"use client";

import { useState, useEffect } from "react";
import WalletCard from "@/components/wallet-card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { apiService } from "@/services/api";
import { showError, showSuccess } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface WalletTransaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

const Wallet = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchWalletData = async () => {
        try {
          setLoading(true);
          const data = await apiService.getWalletData();
          setWalletBalance(data.balance);
          setTransactions(data.transactions);
        } catch (error) {
          showError("Failed to load wallet data");
          console.error("Error fetching wallet data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchWalletData();
    }
  }, [isAuthenticated]);

  const handleBuyPlan = async (planName: string, amount: number) => {
    try {
      const result = await apiService.rechargeWallet(amount);
      if (result.success) {
        setWalletBalance(result.newBalance);
        showSuccess(`₹${amount} added to your wallet!`);
      } else {
        showError("Failed to recharge wallet");
      }
    } catch (error) {
      showError("Failed to recharge wallet");
      console.error("Error recharging wallet:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-6 flex-grow">
          <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
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
        <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Wallet Balance</p>
              <h2 className="text-3xl font-bold mt-1">₹{walletBalance.toFixed(2)}</h2>
              <p className="text-sm mt-2 opacity-90">
                Last recharge: {transactions.length > 0 ? transactions[0].date : "N/A"}
              </p>
            </div>
            <Button variant="secondary">Add Money</Button>
          </div>
        </div>
        {/* Wallet Plans */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recharge Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <WalletCard
              amount={2000}
              planName="Small Family"
              credit={2000}
              onBuyNow={() => handleBuyPlan("Small Family", 2000)}
            />
            <WalletCard
              amount={3000}
              planName="Medium Family"
              credit={3000}
              onBuyNow={() => handleBuyPlan("Medium Family", 3000)}
            />
            <WalletCard
              amount={5000}
              planName="Large Family"
              credit={5000}
              onBuyNow={() => handleBuyPlan("Large Family", 5000)}
            />
          </div>
        </section>
        {/* Transaction History */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border-b border-border last:border-b-0"
              >
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <div
                  className={`text-right font-bold ${
                    transaction.type === "credit" ? "text-green-500" : "text-destructive"
                  }`}
                >
                  {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Wallet;