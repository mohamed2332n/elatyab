"use client";

import { useState, useEffect } from "react";
import OfferBanner from "@/components/offer-banner";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { offersService } from "@/services/supabase/offers";
import { showError } from "@/utils/toast";
import { useLang } from "@/context/lang-context";

interface Offer {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  applicable_categories?: string[];
}

const Offers = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { lang } = useLang();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await offersService.getActiveOffers();
      if (!error && data) {
        setOffers(data);
      } else {
        showError("Failed to load offers");
      }
    } catch (error) {
      showError("Failed to load offers");
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Special Offers</h1>
        
        {loading ? (
          <div className="text-center text-muted-foreground">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="text-center text-muted-foreground">No active offers at the moment</div>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => (
              <OfferBanner
                key={offer.id}
                title={lang === "ar" ? offer.title_ar : offer.title_en}
                description={lang === "ar" ? offer.description_ar : offer.description_en}
                validTill={new Date(offer.end_date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                onOrderNow={() => navigate("/search")}
              />
            ))}
          </div>
        )}
        
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