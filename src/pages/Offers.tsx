"use client";

import { useState } from "react";
import OfferBanner from "@/components/offer-banner";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const Offers = () => {
  const { theme } = useTheme();
  const [offers] = useState([
    {
      id: 1,
      title: "Weekend Special",
      description: "Potato-15 Carrot-29 Palak-29 Mushroom-35",
      validTill: "12-05-2023",
      products: ["Potato", "Carrot", "Palak", "Mushroom"]
    },
    {
      id: 2,
      title: "Combo Deal",
      description: "Capsicum-59 Orange-89",
      validTill: "15-05-2023",
      products: ["Capsicum", "Orange"]
    },
    {
      id: 3,
      title: "Fresh Stock Arrived",
      description: "Seasonal fruits at discounted prices",
      validTill: "20-05-2023",
      products: ["Mango", "Watermelon", "Pineapple"]
    }
  ]);

  const handleOrderNow = (offerId: number) => {
    // In a real app, this would navigate to the offer details or products
    console.log(`Ordering now for offer ${offerId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Special Offers</h1>
        
        <div className="space-y-6">
          {offers.map((offer) => (
            <OfferBanner
              key={offer.id}
              title={offer.title}
              description={offer.description}
              validTill={offer.validTill}
              onOrderNow={() => handleOrderNow(offer.id)}
            />
          ))}
        </div>
        
        {/* Additional Offer Categories */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Offer Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Daily Deals", "Weekend Specials", "Festival Offers", "First Order"].map((category, index) => (
              <div 
                key={index} 
                className="bg-card rounded-lg p-4 border border-border shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="bg-muted h-16 w-16 rounded-full mb-2 mx-auto flex items-center justify-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                </div>
                <h3 className="font-medium">{category}</h3>
              </div>
            ))}
          </div>
        </section>
        
        {/* Flash Sale Section */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Flash Sale</h2>
            <div className="bg-destructive text-white text-sm font-bold px-3 py-1 rounded-full">
              Ends in 02:15:30
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-destructive to-orange-500 rounded-xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">Limited Time Offer!</h3>
            <p className="mb-4">Up to 60% off on selected items. Hurry, offer ends soon!</p>
            <Button variant="secondary">Shop Now</Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Offers;