"use client";

import { useState, useEffect } from "react";
import WalletCard from "@/components/wallet-card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { showError, showSuccess } from "@/utils/toast";
import { walletService } from "@/services/supabase/wallet";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";

interface WalletTransaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

const Wallet = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();

  useEffect(() => {
    if (user) {
      fetchWalletData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        walletService.getWallet(user.id),
        walletService.getTransactions(user.id),
      ]);

      if (!walletRes.error && walletRes.data) {
        setWalletBalance(walletRes.data.balance);
      }

      if (!transactionsRes.error && transactionsRes.data) {
        setTransactions(transactionsRes.data);
      }
    } catch (error) {
      showError("Failed to load wallet data");
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPlan = async (planName: string, amount: number) => {
    if (!user) {
      showError("Please log in to recharge wallet");
      return;
    }
    try {
      const { data, error } = await walletService.rechargeWallet(user.id, amount, `Top-up: ${planName}`);
      if (!error && data) {
        setWalletBalance(data.wallet.balance);
        showSuccess(`✨ ${formatPrice(amount, lang)} added to your wallet!`);
        // Refresh transactions
        await fetchWalletData();
      } else {
        showError("Failed to recharge wallet");
      }
    } catch (error) {
      showError("Failed to recharge wallet");
      console.error("Error recharging wallet:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-6xl emoji-spin mb-6">💰</div>
            <h1 className="text-2xl font-bold mb-3">Loading your wallet...</h1>
            <div className="flex items-center justify-center gap-1">
              <span className="emoji-bounce">🔄</span>
              <span className="text-muted-foreground">Just a moment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 animate-in-slide-up">
          <span className="emoji-bounce">💰</span> My Wallet
        </h1>
        <p className="text-muted-foreground mb-8">Manage your wallet balance and transactions</p>
        
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-2xl p-8 mb-10 text-white shadow-2xl card-animate">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg opacity-90 flex items-center gap-2">
                <span>💳</span> Wallet Balance
              </p>
                <h2 className="text-5xl font-bold mt-3 flex items-center gap-3">
                <span className="emoji-bounce">✨</span>
                {formatPrice(walletBalance, lang)}
              </h2>
              <p className="text-base mt-4 opacity-95">
                <span className="emoji-wiggle">📅</span> Last recharge: {transactions.length > 0 ? transactions[0].date : "N/A"}
              </p>
            </div>
            <Button 
              variant="secondary"
              size="lg"
              className="gap-2 hover:scale-105 transition-transform shadow-lg"
            >
              <span>➕</span> Add Money
            </Button>
          </div>

          {/* Wallet Status */}
          <div className="mt-6 pt-6 border-t border-white/20 opacity-90 text-sm">
            <p className="flex items-center gap-2">
              <span className="emoji-float">🎯</span> Your wallet is active and ready to use!
            </p>
          </div>
        </div>
        
        {/* Wallet Plans */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="emoji-spin">💎</span> Recharge Plans
          </h2>
          <p className="text-muted-foreground mb-6 flex items-center gap-2">
            <span>🎁</span> Choose a plan that suits your needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="transform hover:scale-105 transition-transform">
              <WalletCard 
                amount={2000} 
                planName="Small Family" 
                credit={2000} 
                onBuyNow={() => handleBuyPlan("Small Family", 2000)} 
              />
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <WalletCard 
                amount={3000} 
                planName="Medium Family" 
                credit={3000} 
                onBuyNow={() => handleBuyPlan("Medium Family", 3000)} 
              />
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <WalletCard 
                amount={5000} 
                planName="Large Family" 
                credit={5000} 
                onBuyNow={() => handleBuyPlan("Large Family", 5000)} 
              />
            </div>
          </div>
        </section>
        
        {/* Transaction History */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="emoji-bounce">📊</span> Recent Transactions
          </h2>
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-md">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              transactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors list-item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-grow">
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-xl">
                        {transaction.type === "credit" ? "💸" : "🔄"}
                      </span>
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <span>📅</span> {transaction.date}
                    </p>
                  </div>
                  <div className={`text-right font-bold text-lg px-4 py-2 rounded-lg flex items-center gap-2 ${
                    transaction.type === "credit" 
                      ? "text-green-600 bg-green-100 dark:bg-green-900/30" 
                      : "text-destructive bg-destructive/10"
                  }`}>
                    <span className="text-xl">
                      {transaction.type === "credit" ? "✅" : "❌"}
                    </span>
                    {transaction.type === "credit" ? "+" : "-"}{formatPrice(transaction.amount, lang)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Wallet Perks */}
        <section className="mt-12">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="emoji-wiggle">⭐</span> Wallet Perks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-semibold">Fast Checkout</p>
                  <p className="text-sm text-muted-foreground">Instant payments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="font-semibold">Secure</p>
                  <p className="text-sm text-muted-foreground">Protected transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="font-semibold">Rewards</p>
                  <p className="text-sm text-muted-foreground">Earn cashback</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Wallet;