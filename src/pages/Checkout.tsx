"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { formatPrice } from "@/utils/price";
import { ordersService } from "@/services/supabase/orders";
import { walletService } from "@/services/supabase/wallet";
import { addressService, Address as DBAddress } from "@/services/supabase/addresses";
import { showError, showSuccess } from "@/utils/toast";
import { MapPin, CreditCard, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load addresses from Supabase
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadAddresses = async () => {
      try {
        const dbAddresses = await addressService.getUserAddresses(user.id);
        
        if (dbAddresses.length > 0) {
          // Map Supabase addresses to our interface
          const mappedAddresses: Address[] = dbAddresses.map(addr => ({
            id: addr.id!,
            label: addr.label,
            fullName: addr.recipient_name,
            phone: addr.phone_number,
            address: addr.street_address,
            city: addr.city,
            postalCode: addr.postal_code || "",
            isDefault: addr.is_default
          }));
          
          setAddresses(mappedAddresses);
          
          // Select default address or first one
          const defaultAddr = mappedAddresses.find(a => a.isDefault);
          setSelectedAddressId(defaultAddr?.id || mappedAddresses[0].id);
        } else {
          // No addresses - show form
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error("Error loading addresses:", err);
        showError(lang === "ar" ? "فشل تحميل العناوين" : "Failed to load addresses");
      }
    };

    loadAddresses();
  }, [user, navigate, lang]);

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};

    if (!newAddress.fullName.trim()) errors.fullName = "Full name is required";
    if (!newAddress.phone.trim()) errors.phone = "Phone is required";
    if (!newAddress.address.trim()) errors.address = "Address is required";
    if (!newAddress.city.trim()) errors.city = "City is required";
    if (!newAddress.postalCode.trim()) errors.postalCode = "Postal code is required";

    if (newAddress.phone && newAddress.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Invalid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = async () => {
    if (!validateAddressForm() || !user) return;

    try {
      setIsPlacingOrder(true);
      
      // Create address in Supabase
      const createdAddress = await addressService.createAddress({
        user_id: user.id,
        label: newAddress.label,
        recipient_name: newAddress.fullName,
        phone_number: newAddress.phone,
        street_address: newAddress.address,
        building_number: "",
        apartment: "",
        governorate: "Cairo", // Default
        city: newAddress.city,
        postal_code: newAddress.postalCode,
        is_default: addresses.length === 0 // First address is default
      });

      const address: Address = {
        id: createdAddress.id!,
        label: createdAddress.label,
        fullName: createdAddress.recipient_name,
        phone: createdAddress.phone_number,
        address: createdAddress.street_address,
        city: createdAddress.city,
        postalCode: createdAddress.postal_code || "",
        isDefault: createdAddress.is_default
      };

      const updatedAddresses = [...addresses, address];
      setAddresses(updatedAddresses);
      setSelectedAddressId(address.id);
      setShowAddressForm(false);
      showSuccess(lang === "ar" ? "تم إضافة العنوان" : "Address added successfully!");
    } catch (err) {
      console.error("Error adding address:", err);
      showError(lang === "ar" ? "فشل إضافة العنوان" : "Failed to add address");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 500 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (!user) navigate("/login");
    if (items.length === 0) navigate("/cart");
  }, [user, items, navigate]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!selectedAddressId) {
      showError("Please select a delivery address");
      return;
    }
    if (!user) {
      showError("Please log in to place an order");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Create order items array
      const orderItems = items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        name: item.name,
        image: item.image,
        weight: item.weight,
      }));

      // Get selected address
      const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
      const deliveryAddress = selectedAddress
        ? `${selectedAddress.address}, ${selectedAddress.city} ${selectedAddress.postalCode}`
        : "";
      
      const deliveryPhone = selectedAddress?.phone || user.phone;

      // Create order
      const { data: order, error: orderError } = await ordersService.createOrder({
        userId: user.id,
        items: orderItems,
        total: finalTotal,
        subtotal: totalPrice,
        deliveryFee: deliveryFee,
        deliveryAddress: deliveryAddress,
        deliveryPhone: deliveryPhone,
        paymentMethod: paymentMethod,
      });

      if (!orderError && order) {
        // Debit wallet if payment method is wallet
        if (paymentMethod === "wallet") {
          await walletService.debitWallet(
            user.id,
            finalTotal,
            order.id
          );
        }

        clearCart();
        showSuccess("🎉 Order placed successfully!");
        navigate(`/orders/${order.id}`);
      } else {
        showError("Failed to place order");
      }
    } catch (error: any) {
      showError(error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <span className="emoji-bounce">🎯</span> {t('checkout')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 card-animate">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Delivery Address</span>
              </h2>
              {/* Address Selection */}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <div>
                      <span className="capitalize font-medium">{addr.label}</span>
                      {addr.isDefault && <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Default</span>}
                      <p className="text-sm text-muted-foreground">{addr.address}, {addr.city}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${selectedAddressId === addr.id ? "bg-primary border-primary" : "border-input"}`}></div>
                  </div>
                ))}
              </div>
              <Button variant="link" onClick={() => navigate("/addresses")} className="mt-2 p-0">
                Manage Addresses
              </Button>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 card-animate">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Method</span>
              </h2>
              <div className="space-y-3">
                {[
                  { id: "wallet", name: "Digital Wallet", description: `Balance: ${formatPrice(1500, lang)}`, emoji: "💰" },
                  { id: "upi", name: "UPI", description: "Google Pay, PhonePe, etc.", emoji: "📱" },
                  { id: "card", name: "Debit/Credit Card", description: "Visa, Mastercard, etc.", emoji: "💳" },
                  { id: "cod", name: "Cash on Delivery", description: "Pay when you receive", emoji: "🚚" },
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div>
                      <span className="capitalize font-medium flex items-center gap-2">{method.emoji} {method.name}</span>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === method.id ? "bg-primary border-primary" : "border-input"}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 sticky top-20 shadow-lg card-animate">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="emoji-bounce">📦</span> Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center pb-2 border-b border-border/20 list-item"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity, lang)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <span>🛒</span> Subtotal
                  </span>
                  <span>{formatPrice(totalPrice, lang)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <span>🚚</span> Delivery Fee
                  </span>
                  <span
                    className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}
                  >
                    {deliveryFee === 0 ? (
                      <span className="emoji-bounce">FREE ✨</span>
                    ) : (
                      formatPrice(deliveryFee, lang)
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg text-primary">
                  <span>Total</span>
                  <span className="text-primary text-lg">{formatPrice(finalTotal, lang)}</span>
                </div>
              </div>

              {/* Free Delivery Message */}
              {deliveryFee > 0 && (
                <div className="mb-4 p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-center">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    <span className="emoji-wiggle">🎉</span> Add {formatPrice(500 - totalPrice, lang)} more for FREE delivery!
                  </p>
                </div>
              )}

              {/* Place Order Button */}
              <Button
                className="w-full py-6 text-lg font-bold"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || addresses.length === 0}
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </Button>
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;