import { supabase } from '@/config/supabase';

export const ordersService = {
  // Create order
  createOrder: async (orderData: any) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          delivery_address: orderData.deliveryAddress,
          delivery_phone: orderData.deliveryPhone,
          delivery_latitude: orderData.latitude,
          delivery_longitude: orderData.longitude,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          discount: orderData.discount,
          total: orderData.total,
          payment_method: orderData.paymentMethod,
          payment_status: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
          status: 'pending',
          notes: orderData.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_name_en: item.name,
        product_name_ar: item.name_ar || item.name,
        product_image: item.image || item.images?.[0],
        weight: item.weight,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await supabase.from('cart_items').delete().eq('user_id', orderData.userId);

      return { data: order, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user orders
  getUserOrders: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(*)
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get single order
  getOrder: async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(*)
        `,
        )
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const updates: any = { status };
      const now = new Date().toISOString();

      switch (status) {
        case 'confirmed':
          updates.confirmed_at = now;
          break;
        case 'packed':
          updates.packed_at = now;
          break;
        case 'shipped':
          updates.shipped_at = now;
          break;
        case 'delivered':
          updates.delivered_at = now;
          break;
        case 'cancelled':
          updates.cancelled_at = now;
          break;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
