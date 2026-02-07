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
import { MapPin, Truck, CreditCard, Lock } from "lucide-react";

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
      }));

      // Get selected address
      const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
      const deliveryAddress = selectedAddress
        ? `${selectedAddress.address}, ${selectedAddress.city} ${selectedAddress.postalCode}`
        : "";

      // Create order
      const { data: order, error: orderError } = await ordersService.createOrder(
        user.id,
        orderItems,
        finalTotal,
        deliveryAddress,
        paymentMethod === "wallet"
      );

      if (!orderError && order) {
        // Debit wallet if payment method is wallet
        if (paymentMethod === "wallet") {
          await walletService.debitWallet(
            user.id,
            finalTotal,
            `Order ${order.order_number}`
          );
        }

        clearCart();
        showSuccess("🎉 Order placed successfully!");
        navigate(`/orders/${order.id}`);
      } else {
        showError("Failed to place order");
      }
    } catch (error) {
      showError("Failed to place order");
      console.error("Error placing order:", error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-in-fade">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-7xl emoji-float mb-6">🛒</div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add items to your cart before checking out</p>
            <Button onClick={() => navigate("/")} className="gap-2">
              <span>🌱</span> Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in-fade">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <span className="emoji-bounce">🎯</span> Checkout
        </h1>
        <p className="text-muted-foreground mb-8">Complete your order</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Delivery & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-card rounded-lg border border-border p-6 card-animate">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>📍 Delivery Address</span>
              </h2>

              {addresses.length > 0 && !showAddressForm && (
                <div className="space-y-3">
                  {addresses.map((addr, idx) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all list-item ${
                        selectedAddressId === addr.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ animationDelay: `${idx * 30}ms` }}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-lg">{addr.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">{addr.fullName}</p>
                          <p className="text-sm text-muted-foreground">{addr.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.city} - {addr.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <span>📱</span> {addr.phone}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            selectedAddressId === addr.id ? "bg-primary border-primary" : "border-input"
                          }`}
                        ></div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full gap-2 mt-4"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <span>➕</span> Add New Address
                  </Button>
                </div>
              )}

              {showAddressForm && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        formErrors.fullName ? "border-destructive" : "border-input"
                      } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="John Doe"
                    />
                    {formErrors.fullName && (
                      <p className="text-destructive text-sm mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          formErrors.phone ? "border-destructive" : "border-input"
                        } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                        placeholder="+91 9876543210"
                      />
                      {formErrors.phone && (
                        <p className="text-destructive text-sm mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Label</label>
                      <input
                        type="text"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Home, Work, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        formErrors.address ? "border-destructive" : "border-input"
                      } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="123 Main Street, Apartment 4B"
                    />
                    {formErrors.address && (
                      <p className="text-destructive text-sm mt-1">{formErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          formErrors.city ? "border-destructive" : "border-input"
                        } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                        placeholder="New Delhi"
                      />
                      {formErrors.city && (
                        <p className="text-destructive text-sm mt-1">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          formErrors.postalCode ? "border-destructive" : "border-input"
                        } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                        placeholder="110001"
                      />
                      {formErrors.postalCode && (
                        <p className="text-destructive text-sm mt-1">{formErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddAddress} className="flex-1 gap-2">
                      <span>✓</span> Save Address
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-lg border border-border p-6 card-animate" style={{ animationDelay: "100ms" }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>💳 Payment Method</span>
              </h2>

              <div className="space-y-3">
                {[
                  { id: "wallet", name: "Digital Wallet", description: `${formatPrice(1500, lang)} available`, emoji: "💰" },
                  { id: "upi", name: "UPI", description: "Google Pay, PhonePe, etc.", emoji: "📱" },
                  { id: "card", name: "Debit/Credit Card", description: "Visa, Mastercard, etc.", emoji: "💳" },
                  { id: "cod", name: "Cash on Delivery", description: "Pay when you receive", emoji: "🚚" },
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.emoji}</span>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        paymentMethod === method.id ? "bg-primary border-primary" : "border-input"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
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
                <div className="border-t border-border/20 pt-2 flex justify-between font-bold">
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
                className="w-full py-6 text-base font-bold gap-2 hover:scale-105 transition-transform active:scale-95"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
              >
                {isPlacingOrder ? (
                  <>
                    <span className="emoji-spin">⏳</span> Placing Order...
                  </>
                ) : (
                  <>
                    <span>🎯</span> Place Order
                  </>
                )}
              </Button>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure & encrypted checkout</span>
              </div>

              {/* Terms */}
              <p className="text-xs text-muted-foreground text-center mt-3">
                By placing your order, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms and Conditions</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;