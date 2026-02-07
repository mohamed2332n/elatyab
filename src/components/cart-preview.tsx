"use client";

import React from 'react';
import { useCart } from '@/context/cart-context';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/price';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLang } from '@/context/lang-context';

const CartPreview = () => {
  const { items, getTotalPrice, removeItem } = useCart();
  const { t } = useTranslation();
  const { lang } = useLang();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">
          {t('yourCart')} ({items.length} {t('items')})
        </h3>
        <Button variant="link" size="sm" onClick={() => navigate('/cart')}>
          {t('viewAll')}
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex-shrink-0 w-48 bg-muted/50 rounded-lg p-3 relative group">
            <button 
              onClick={() => removeItem(item.id)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-white rounded-full p-1"
            >
              <X size={12} />
            </button>
            <div className="flex items-center gap-3">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.price, lang)} × {item.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{t('total')}:</span>
          <span className="font-bold text-xl">{formatPrice(getTotalPrice(), lang)}</span>
        </div>
        <Button onClick={() => navigate('/checkout')}>{t('proceedToCheckout')}</Button>
      </div>
    </div>
  );
};

export default CartPreview;