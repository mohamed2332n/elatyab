"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit2, MapPin, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/context/lang-context";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { addressService, Address } from "@/services/supabase/addresses";
import { showError, showSuccess } from "@/utils/toast";

const GOVERNORATES = [
  { en: "Cairo", ar: "القاهرة" },
  { en: "Alexandria", ar: "الإسكندرية" },
  { en: "Giza", ar: "الجيزة" },
  { en: "Qalyubiya", ar: "القليوبية" },
  { en: "Sharqia", ar: "الشرقية" },
  { en: "Suez", ar: "السويس" },
  { en: "Ismailia", ar: "الإسماعيلية" },
  { en: "Port Said", ar: "بورسعيد" },
  { en: "Dakahlia", ar: "الدقهلية" },
  { en: "Damietta", ar: "دمياط" },
  { en: "Kafr El-Sheikh", ar: "كفر الشيخ" },
  { en: "Beheira", ar: "البحيرة" },
  { en: "Gharbiya", ar: "الغربية" },
  { en: "Monufia", ar: "المنوفية" },
  { en: "Menoufia", ar: "المنيا" },
  { en: "Assiut", ar: "أسيوط" },
  { en: "Sohag", ar: "سوهاج" },
  { en: "Qena", ar: "قنا" },
  { en: "Luxor", ar: "الأقصر" },
  { en: "Aswan", ar: "أسوان" },
  { en: "Red Sea", ar: "البحر الأحمر" },
  { en: "Matruh", ar: "مطروح" },
  { en: "New Valley", ar: "الوادي الجديد" }
];

const ADDRESS_LABELS = [
  { en: "Home", ar: "المنزل" },
  { en: "Work", ar: "العمل" },
  { en: "Other", ar: "أخرى" }
];

const Addresses = () => {
  const { theme } = useTheme();
  const { lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "Home",
    recipient_name: "",
    phone_number: "",
    street_address: "",
    building_number: "",
    apartment: "",
    governorate: "Cairo",
    city: "",
    postal_code: "",
    is_default: false
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await addressService.getUserAddresses(user.id);
      setAddresses(data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      showError(lang === "ar" ? "فشل تحميل العناوين" : "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showError(lang === "ar" ? "يرجى تسجيل الدخول" : "Please log in");
      return;
    }

    if (!formData.recipient_name.trim() || !formData.phone_number.trim() || !formData.street_address.trim()) {
      showError(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        // Update existing address
        await addressService.updateAddress(editingId, {
          label: formData.label,
          recipient_name: formData.recipient_name,
          phone_number: formData.phone_number,
          street_address: formData.street_address,
          building_number: formData.building_number,
          apartment: formData.apartment,
          governorate: formData.governorate,
          city: formData.city,
          postal_code: formData.postal_code,
          is_default: formData.is_default
        });

        showSuccess(lang === "ar" ? "تم تحديث العنوان" : "Address updated successfully");
      } else {
        // Create new address
        await addressService.createAddress({
          user_id: user.id,
          label: formData.label,
          recipient_name: formData.recipient_name,
          phone_number: formData.phone_number,
          street_address: formData.street_address,
          building_number: formData.building_number,
          apartment: formData.apartment,
          governorate: formData.governorate,
          city: formData.city,
          postal_code: formData.postal_code,
          is_default: formData.is_default
        });

        showSuccess(lang === "ar" ? "تم إضافة العنوان بنجاح" : "Address added successfully");
      }

      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error("Error saving address:", err);
      showError(lang === "ar" ? "فشل حفظ العنوان" : "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      recipient_name: address.recipient_name,
      phone_number: address.phone_number,
      street_address: address.street_address,
      building_number: address.building_number || "",
      apartment: address.apartment || "",
      governorate: address.governorate,
      city: address.city,
      postal_code: address.postal_code || "",
      is_default: address.is_default
    });
    setEditingId(address.id!);
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm(lang === "ar" ? "هل تريد حذف هذا العنوان؟" : "Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setDeletingId(addressId);
      await addressService.deleteAddress(addressId);
      showSuccess(lang === "ar" ? "تم حذف العنوان" : "Address deleted");
      fetchAddresses();
    } catch (err) {
      console.error("Error deleting address:", err);
      showError(lang === "ar" ? "فشل حذف العنوان" : "Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      await addressService.setDefaultAddress(user.id, addressId);
      showSuccess(lang === "ar" ? "تم تعيين كعنوان افتراضي" : "Set as default address");
      fetchAddresses();
    } catch (err) {
      console.error("Error setting default:", err);
      showError(lang === "ar" ? "فشل تعيين العنوان الافتراضي" : "Failed to set default address");
    }
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      recipient_name: "",
      phone_number: "",
      street_address: "",
      building_number: "",
      apartment: "",
      governorate: "Cairo",
      city: "",
      postal_code: "",
      is_default: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              {lang === "ar" ? "عناويني" : "My Addresses"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {lang === "ar" ? "إدارة عناوين التوصيل" : "Manage your delivery addresses"}
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              {lang === "ar" ? "إضافة عنوان" : "Add Address"}
            </Button>
          )}
        </div>

        {/* Address Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">
              {editingId ? (lang === "ar" ? "تعديل العنوان" : "Edit Address") : (lang === "ar" ? "عنوان جديد" : "New Address")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Label */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "نوع العنوان" : "Address Type"}
                  </label>
                  <select
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {ADDRESS_LABELS.map(label => (
                      <option key={label.en} value={label.en}>
                        {lang === "ar" ? label.ar : label.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "اسم المستقبل *" : "Recipient Name *"}
                  </label>
                  <input
                    type="text"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    placeholder={lang === "ar" ? "أدخل اسمك الكامل" : "Full name"}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "رقم الهاتف *" : "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+20"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  />
                </div>

                {/* Street Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "عنوان الشارع *" : "Street Address *"}
                  </label>
                  <input
                    type="text"
                    value={formData.street_address}
                    onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                    placeholder={lang === "ar" ? "الشارع والمنطقة" : "Street and area"}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  />
                </div>

                {/* Building Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "رقم المبنى" : "Building Number"}
                  </label>
                  <input
                    type="text"
                    value={formData.building_number}
                    onChange={(e) => setFormData({ ...formData, building_number: e.target.value })}
                    placeholder={lang === "ar" ? "مثلاً: 15" : "e.g., 15"}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>

                {/* Apartment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "رقم الشقة" : "Apartment Number"}
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder={lang === "ar" ? "مثلاً: 3A" : "e.g., 3A"}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>

                {/* Governorate */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "المحافظة" : "Governorate"}
                  </label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {GOVERNORATES.map(gov => (
                      <option key={gov.en} value={gov.en}>
                        {lang === "ar" ? gov.ar : gov.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "المدينة" : "City"}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={lang === "ar" ? "المدينة" : "City"}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "الرمز البريدي" : "Postal Code"}
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder={lang === "ar" ? "اختياري" : "Optional"}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>

                {/* Default Address */}
                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 rounded border-input cursor-pointer"
                  />
                  <label htmlFor="is_default" className="text-sm font-medium cursor-pointer">
                    {lang === "ar" ? "جعل هذا العنوان الافتراضي" : "Set as default address"}
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "..." : (lang === "ar" ? "حفظ" : "Save")}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(address => (
              <div
                key={address.id}
                className="bg-card border border-border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow relative"
              >
                {/* Default Badge */}
                {address.is_default && (
                  <div className="absolute top-4 right-4 bg-primary/10 border border-primary text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {lang === "ar" ? "افتراضي" : "Default"}
                  </div>
                )}

                {/* Label */}
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-bold text-lg">{address.label}</span>
                </div>

                {/* Address Details */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">{address.recipient_name}</p>
                    <p className="text-muted-foreground">{address.phone_number}</p>
                  </div>
                  <p>{address.street_address}</p>
                  {address.building_number && (
                    <p>{lang === "ar" ? "المبنى:" : "Building:"} {address.building_number}</p>
                  )}
                  {address.apartment && (
                    <p>{lang === "ar" ? "الشقة:" : "Apt:"} {address.apartment}</p>
                  )}
                  <p>{address.city}, {address.governorate}</p>
                  {address.postal_code && (
                    <p>{lang === "ar" ? "الرمز البريدي:" : "Postal:"} {address.postal_code}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  {!address.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id!)}
                      className="flex-1"
                    >
                      {lang === "ar" ? "جعل افتراضي" : "Set Default"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(address)}
                    className="flex-1 gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    {lang === "ar" ? "تعديل" : "Edit"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id!)}
                    disabled={deletingId === address.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : !showForm ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <div className="text-5xl emoji-bounce mb-4">📍</div>
            <p className="text-lg font-medium">{lang === "ar" ? "لا توجد عناوين محفوظة" : "No addresses saved"}</p>
            <p className="text-muted-foreground mb-6">
              {lang === "ar" ? "ابدأ بإضافة عنوان توصيل" : "Add a delivery address to get started"}
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {lang === "ar" ? "إضافة عنوان" : "Add First Address"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Addresses;
