"use client";

import { useState, useEffect } from "react";
import WalletCard from "@/components/wallet-card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { showError, showSuccess } from "@/utils/toast";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/price-formatter";
=======
import { walletService } from "@/services/supabase/wallet";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";
>>>>>>> 2811c28a30579485cf3ae75f0af75c3bf0b92703

interface WalletTransaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

const Wallet = () => {
  const { theme } = useTheme();
<<<<<<< HEAD
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, loading: authLoading } = useAuth();
=======
  const { user } = useAuth();
>>>>>>> 2811c28a30579485cf3ae75f0af75c3bf0b92703
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();

  useEffect(() => {
<<<<<<< HEAD
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
=======
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
>>>>>>> 2811c28a30579485cf3ae75f0af75c3bf0b92703

  const handleBuyPlan = async (planName: string, amount: number) => {
    if (!user) {
      showError("Please log in to recharge wallet");
      return;
    }
    try {
<<<<<<< HEAD
      const result = await apiService.rechargeWallet(amount);
      if (result.success) {
        setWalletBalance(result.newBalance);
        showSuccess(`${planName} recharge successful!`);
=======
      const { data, error } = await walletService.rechargeWallet(user.id, amount, `Top-up: ${planName}`);
      if (!error && data) {
        setWalletBalance(data.wallet.balance);
        showSuccess(`✨ ${formatPrice(amount, lang)} added to your wallet!`);
        // Refresh transactions
        await fetchWalletData();
      } else {
        showError("Failed to recharge wallet");
>>>>>>> 2811c28a30579485cf3ae75f0af75c3bf0b92703
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
        
<<<<<<< HEAD
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-8 mb-10 text-white shadow-xl flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80 uppercase tracking-widest font-bold">Total Balance</p>
            <h2 className="text-5xl font-extrabold mt-2">{formatPrice(walletBalance, i18n.language)}</h2>
=======
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
>>>>>>> 2811c28a30579485cf3ae75f0af75c3bf0b92703
          </div>
          <Button variant="secondary" className="font-bold px-6 h-12 shadow-lg">Add Money</Button>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Recharge Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<<<<<<< HEAD
            <WalletCard amount={2000} planName="Small Family" credit={2000} onBuyNow={() => handleBuyPlan("Small Family", 2000)} />
            <WalletCard amount={3000} planName="Medium Family" credit={3000} onBuyNow={() => handleBuyPlan("Medium Family", 3000)} />
            <WalletCard amount={5000} planName="Large Family" credit={5000} onBuyNow={() => handleBuyPlan("Large Family", 5000)} />
=======
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
>>>>>>> 2811c28a30579485cf3ae75f0af75c3bf0b92703
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