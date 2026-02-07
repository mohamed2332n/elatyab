"use client";

import { useState, useEffect } from "react";
import WalletCard from "@/components/wallet-card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { apiService } from "@/services/api";
import { showError, showSuccess } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";

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
  const { t, i18n } = useTranslation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
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
        showSuccess(`${planName} recharge successful!`);
      }
    } catch (error) {
      showError("Failed to recharge wallet");
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center animate-spin text-3xl">⏳</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background p-4 animate-in-fade">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <span>💰</span> {t('wallet')}
        </h1>
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-8 mb-10 text-white shadow-xl flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80 uppercase tracking-widest font-bold">Total Balance</p>
            <h2 className="text-5xl font-extrabold mt-2">{formatPrice(walletBalance, i18n.language)}</h2>
          </div>
          <Button variant="secondary" className="font-bold px-6 h-12 shadow-lg">Add Money</Button>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Recharge Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WalletCard amount={2000} planName="Small Family" credit={2000} onBuyNow={() => handleBuyPlan("Small Family", 2000)} />
            <WalletCard amount={3000} planName="Medium Family" credit={3000} onBuyNow={() => handleBuyPlan("Medium Family", 3000)} />
            <WalletCard amount={5000} planName="Large Family" credit={5000} onBuyNow={() => handleBuyPlan("Large Family", 5000)} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            {transactions.map((t, i) => (
              <div key={i} className="flex justify-between p-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
                <div className={`font-bold ${t.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                  {t.type === "credit" ? "+" : "-"}{formatPrice(t.amount, i18n.language)}
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