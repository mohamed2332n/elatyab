import { supabase } from '@/config/supabase';

export const walletService = {
  // Get wallet balance
  getWallet: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Wallet doesn't exist, create it
        return await walletService.createWallet(userId);
      }

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create wallet for user
  createWallet: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .insert({ user_id: userId, balance: 0 })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Recharge wallet
  rechargeWallet: async (
    userId: string,
    amount: number,
    description = 'Wallet Recharge',
  ) => {
    try {
      // Get current wallet
      let { data: wallet, error: walletFetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (walletFetchError && walletFetchError.code === 'PGRST116') {
        // Create wallet first
        const { data: newWallet } = await walletService.createWallet(userId);
        wallet = newWallet;
      } else if (walletFetchError) {
        throw walletFetchError;
      }

      const newBalance = parseFloat(wallet.balance.toString()) + parseFloat(amount.toString());

      // Update wallet balance
      const { data: updatedWallet, error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', userId)
        .select()
        .single();

      if (walletError) throw walletError;

      // Add transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          type: 'credit',
          amount: amount,
          description: description,
          reference_type: 'recharge',
          balance_after: newBalance,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      return { data: { wallet: updatedWallet, transaction }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Debit from wallet (for orders)
  debitWallet: async (
    userId: string,
    amount: number,
    orderId: string,
    description = 'Order Payment',
  ) => {
    try {
      // Get current wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (parseFloat(wallet.balance.toString()) < parseFloat(amount.toString())) {
        throw new Error('Insufficient balance');
      }

      const newBalance = parseFloat(wallet.balance.toString()) - parseFloat(amount.toString());

      // Update wallet balance
      const { data: updatedWallet, error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', userId)
        .select()
        .single();

      if (walletError) throw walletError;

      // Add transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          type: 'debit',
          amount: amount,
          description: description,
          reference_type: 'order',
          reference_id: orderId,
          balance_after: newBalance,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      return { data: { wallet: updatedWallet, transaction }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get transaction history
  getTransactions: async (userId: string, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
