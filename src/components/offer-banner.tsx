"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfferBannerProps {
  title: string;
  description: string;
  validTill: string;
  onOrderNow: () => void;
  className?: string;
}

const OfferBanner = ({
  title,
  description,
  validTill,
  onOrderNow,
  className
}: OfferBannerProps) => {
  return (
    <div className={`bg-gradient-to-r from-primary to-secondary rounded-lg p-4 text-white ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded">
          <Clock className="h-4 w-4 mr-1" />
          Valid Till: {validTill}
        </div>
      </div>
      
      <p className="mb-3 text-sm">{description}</p>
      
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={onOrderNow}
        className="font-medium"
      >
        Order Now
      </Button>
    </div>
  );
};

export default OfferBanner;