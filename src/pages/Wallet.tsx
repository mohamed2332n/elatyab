"use client";

import { useState } from "react";
import WalletCard from "@/components/wallet-card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const Wallet = () => {
  const { theme } = useTheme();
  const [walletBalance, setWalletBalance] = useState(1500);
  const [transactions] = useState([
    { id: 1, type: "credit", amount: 2000, description: "Wallet recharge", date: "2023-05-15" },
    { id: 2, type: "debit", amount: 450, description: "Order payment", date: "2023-05-10" },
    { id: 3, type: "credit", amount: 500, description: "Referral bonus", date: "2023-05-05" },
  ]);

  const handleBuyPlan = (planName: string, amount: number) => {
    // In a real app, this would open a payment gateway
    console.log(`Buying ${planName} plan for ₹${amount}`);
    setWalletBalance(prev => prev + amount);
  };

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
              <p className="text-sm mt-2 opacity-90">Last recharge: 15 May 2023</p>
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
                <div className={`text-right font-bold ${transaction.type === "credit" ? "text-green-500" : "text-destructive"}`}>
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