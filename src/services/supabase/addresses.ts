import { supabase } from '@/config/supabase';

export interface Address {
  id?: string;
  user_id: string;
  label: string; // "Home", "Work", "Other"
  recipient_name: string;
  phone_number: string;
  street_address: string;
  building_number?: string;
  apartment?: string;
  governorate: string; // Egyptian governorate
  city: string;
  postal_code?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Address Management Service
 * Handles CRUD operations for user delivery addresses
 */
export const addressService = {
  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: string) {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching addresses:", err);
      throw err;
    }
  },

  /**
   * Get a specific address by ID
   */
  async getAddress(addressId: string) {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching address:", err);
      throw err;
    }
  },

  /**
   * Create a new address
   */
  async createAddress(address: Omit<Address, "id" | "created_at" | "updated_at">) {
    try {
      // If this is the first address or marked as default, set as default
      const addresses = await this.getUserAddresses(address.user_id);
      const isDefault = address.is_default || addresses.length === 0;

      // If setting as default, unset other defaults
      if (isDefault) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", address.user_id);
      }

      const { data, error } = await supabase
        .from("addresses")
        .insert([
          {
            ...address,
            is_default: isDefault,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error creating address:", err);
      throw err;
    }
  },

  /**
   * Update an address
   */
  async updateAddress(
    addressId: string,
    updates: Partial<Omit<Address, "user_id" | "created_at">>
  ) {
    try {
      // If setting as default, unset other defaults for this user
      if (updates.is_default) {
        const address = await this.getAddress(addressId);
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", address.user_id)
          .neq("id", addressId);
      }

      const { data, error } = await supabase
        .from("addresses")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", addressId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error updating address:", err);
      throw err;
    }
  },

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string) {
    try {
      const address = await this.getAddress(addressId);

      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;

      // If deleted address was default, set first remaining as default
      if (address.is_default) {
        const addresses = await this.getUserAddresses(address.user_id);
        if (addresses.length > 0) {
          await this.updateAddress(addresses[0].id, { is_default: true });
        }
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      throw err;
    }
  },

  /**
   * Set an address as default
   */
  async setDefaultAddress(userId: string, addressId: string) {
    try {
      // Unset all other defaults
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      // Set this as default
      const { data, error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error setting default address:", err);
      throw err;
    }
  },

  /**
   * Get default address for user
   */
  async getDefaultAddress(userId: string) {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .eq("is_default", true)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
      return data || null;
    } catch (err) {
      console.error("Error fetching default address:", err);
      throw err;
    }
  }
};
