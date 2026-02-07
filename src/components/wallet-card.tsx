"use client";

import { Button } from "@/components/ui/button";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";

interface WalletCardProps {
  amount: number;
  planName: string;
  credit: number;
  onBuyNow: () => void;
  className?: string;
}

const WalletCard = ({
  amount,
  planName,
  credit,
  onBuyNow,
  className
}: WalletCardProps) => {
  const { lang } = useLang();
  return (
    <div className={`bg-card rounded-lg border border-border p-4 shadow-sm ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold">{formatPrice(amount, lang)}</h3>
          <p className="text-muted-foreground">{planName}</p>
        </div>
        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
          Credit: {formatPrice(credit, lang)}
        </span>
      </div>
      
      <ul className="text-sm space-y-1 mb-4">
        <li className="flex items-center">
          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
          Ideal for {planName.includes("Small") ? "2-3 members" : planName.includes("Medium") ? "4-5 members" : "6+ members"}
        </li>
        <li className="flex items-center">
          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
          Bonus credits on recharge
        </li>
        <li className="flex items-center">
          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
          No expiry on credits
        </li>
      </ul>
      
      <Button className="w-full" onClick={onBuyNow}>
        Buy Now
      </Button>
    </div>
  );
};

export default WalletCard;