# Supabase Integration Setup Guide

## Status
✅ Supabase dependencies installed
✅ Configuration files created
✅ All API services implemented

## Quick Setup Steps

### 1. Get Your Supabase Credentials

Go to https://app.supabase.com

1. **Create a new project** or select existing project (https://dtuagfxysqmdprriyxzs.supabase.co)
2. Navigate to **Settings → API**
3. Copy:
   - **Project URL** (already in .env.local)
   - **anon/public key** (add to .env.local)

### 2. Update .env.local

```bash
# .env.local
VITE_SUPABASE_URL=https://dtuagfxysqmdprriyxzs.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

Replace `your-anon-public-key-here` with your actual anon key from Supabase dashboard.

### 3. Create Database Schema

In Supabase Dashboard → SQL Editor, run the complete SQL schema provided in `SUPABASE_SCHEMA.sql`.

The schema includes:
- `profiles` - User profiles
- `categories` - Product categories  
- `products` - All products
- `cart_items` - Shopping cart
- `addresses` - Delivery addresses
- `wallets` - User wallet balances
- `wallet_transactions` - Transaction history
- `orders` - Orders
- `order_items` - Order line items
- `offers` - Marketing offers
- `reviews` - Product reviews
- `wishlist` - Wishlist items

### 4. Seed Sample Data

In Supabase Dashboard → SQL Editor, run the seed data script to populate:
- 12 product categories
- 20+ products with bilingual names
- Sample offers

### 5. Enable Row Level Security (RLS)

All tables have RLS enabled with appropriate policies. Ensure:
- ✅ Users can only see their own data (addresses, wallet, orders)
- ✅ All users can view products, categories, offers
- ✅ Authentication required for cart and orders

### 6. API Service Files

Created in `src/services/supabase/`:
- `auth.ts` - Authentication
- `products.ts` - Product queries
- `categories.ts` - Category queries
- `cart.ts` - Shopping cart
- `orders.ts` - Order management
- `wallet.ts` - Wallet & payments
- `offers.ts` - Marketing offers
- `wishlist.ts` - Wishlist management

### 7. Usage Example

```typescript
import { productsService } from '@/services/supabase';

// Get all products
const { data: products, error } = await productsService.getAllProducts();

// Search products
const { data } = await productsService.searchProducts('apple', 'en');

// Get featured products
const { data: featured } = await productsService.getFeaturedProducts();
```

## Next Steps

1. **Update Auth Context** → Use Supabase auth instead of mock
2. **Update Cart Context** → Use Supabase cart service instead of localStorage
3. **Update Product Pages** → Use real database instead of mock API
4. **Update Orders** → Save orders to Supabase
5. **Update Wallet** → Use real wallet transactions

## Architecture

```
React App
│
├── src/config/supabase.ts          (Supabase client)
├── src/services/supabase/          (API services)
│   ├── auth.ts
│   ├── products.ts
│   ├── cart.ts
│   ├── orders.ts
│   ├── wallet.ts
│   └── ...
│
├── src/context/                    (React contexts)
│   ├── auth-context.tsx            (Will use authService)
│   └── cart-context.tsx            (Will use cartService)
│
└── Pages/Services/Components        (Will use services)
    └── Call API services for data
```

## Security Notes

- **anon/public key**: Safe to use in client code (use only for this)
- **service_role key**: NEVER expose to client (backend only)
- All sensitive operations use Row Level Security
- Authentication required for user-specific data
- Policies prevent unauthorized access

## Testing

After setup complete, test each service:

```typescript
// Test auth
const { data } = await authService.signUp(email, password, name, phone);

// Test products
const { data: products } = await productsService.getAllProducts();

// Test cart
const { data: cartItem } = await cartService.addToCart(userId, productId);

// Test orders
const { data: order } = await ordersService.createOrder(orderData);
```

## Troubleshooting

**Issue**: "Supabase not configured"
- Solution: Check .env.local has correct URL and anon key

**Issue**: "RLS policy violation"
- Solution: Ensure user is authenticated and user_id matches

**Issue**: "Table doesn't exist"
- Solution: Run the SQL schema in Supabase dashboard

**Issue**: "CORS error"
- Solution: Supabase handles CORS automatically for web

## Files Created

- ✅ `src/config/supabase.ts` - Client config
- ✅ `src/services/supabase/auth.ts` - Auth service
- ✅ `src/services/supabase/products.ts` - Products service
- ✅ `src/services/supabase/categories.ts` - Categories service
- ✅ `src/services/supabase/cart.ts` - Cart service
- ✅ `src/services/supabase/orders.ts` - Orders service
- ✅ `src/services/supabase/wallet.ts` - Wallet service
- ✅ `src/services/supabase/offers.ts` - Offers service
- ✅ `src/services/supabase/wishlist.ts` - Wishlist service
- ✅ `src/services/supabase/index.ts` - Exports all services
- ✅ `.env.local` - Environment config

## Database Schema File

See `SUPABASE_SCHEMA.sql` in project root for complete SQL schema.

## Next: Update Contexts

Would you like me to now update:
1. Auth context to use Supabase authentication?
2. Cart context to use Supabase cart service?
3. Product pages to fetch from Supabase?
