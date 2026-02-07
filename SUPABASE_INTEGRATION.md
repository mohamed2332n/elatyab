# Supabase Integration - Deployment & Next Steps

> **Status**: ✅ All Supabase services created and app builds successfully

## 📋 What's Been Setup

### Infrastructure
- ✅ Supabase client configuration
- ✅ 8 API service modules (auth, products, cart, orders, wallet, etc.)
- ✅ Complete TypeScript typing
- ✅ Environment configuration template

### Files Created

```
src/
├── config/
│   └── supabase.ts                    (Client config)
├── services/
│   └── supabase/
│       ├── auth.ts                    (Authentication)
│       ├── products.ts                (Product queries)
│       ├── categories.ts              (Category queries)
│       ├── cart.ts                    (Shopping cart)
│       ├── orders.ts                  (Order management)
│       ├── wallet.ts                  (Wallet & payments)
│       ├── offers.ts                  (Marketing offers)
│       ├── wishlist.ts                (Wishlist)
│       └── index.ts                   (Export all)

.env.local                              (Environment config)
SUPABASE_SCHEMA.sql                     (Database schema)
SUPABASE_SEED.sql                       (Sample data)
SUPABASE_SETUP.md                       (Setup guide)
```

## 🚀 Quick Start (3 Steps)

### Step 1: Get Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy the **anon/public key**

### Step 2: Update .env.local
```bash
VITE_SUPABASE_URL=https://dtuagfxysqmdprriyxzs.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Step 3: Create Database
In Supabase SQL Editor:
1. Copy & paste entire contents of `SUPABASE_SCHEMA.sql`
2. Run it
3. Copy & paste contents of `SUPABASE_SEED.sql`
4. Run it

**Done!** Your backend is ready.

## 🔄 Integration Timeline

These are the remaining integration steps to fully migrate to Supabase:

### Phase 1: Authentication (Next)
- [ ] Update [src/context/auth-context.tsx](src/context/auth-context.tsx) to use `authService`
- [ ] Remove mock auth logic
- [ ] Test login/signup with real database
- **Impact**: Enable real user accounts

### Phase 2: Products & Categories
- [ ] Update [src/pages/Index.tsx](src/pages/Index.tsx) to use `productsService`
- [ ] Update [src/pages/Categories.tsx](src/pages/Categories.tsx)
- [ ] Update [src/pages/Search.tsx](src/pages/Search.tsx)
- [ ] Update [src/components/product-card.tsx](src/components/product-card.tsx)
- **Impact**: Display real database products

### Phase 3: Cart & Checkout
- [ ] Update [src/context/cart-context.tsx](src/context/cart-context.tsx) to use `cartService`
- [ ] Migrate from localStorage to database
- [ ] Remove mock cart data
- [ ] Update [src/pages/Checkout.tsx](src/pages/Checkout.tsx)
- **Impact**: Persistent multi-device cart

### Phase 4: Orders
- [ ] Update [src/pages/Checkout.tsx](src/pages/Checkout.tsx) to create orders with `ordersService`
- [ ] Update [src/pages/Orders.tsx](src/pages/Orders.tsx)
- [ ] Update [src/pages/OrderDetails.tsx](src/pages/OrderDetails.tsx)
- **Impact**: Save orders to real database

### Phase 5: Wallet & Transactions
- [ ] Update [src/pages/Wallet.tsx](src/pages/Wallet.tsx) to use `walletService`
- [ ] Implement recharge function
- [ ] Track transaction history
- **Impact**: Real financial transactions

### Phase 6: Offers & Wishlist
- [ ] Update [src/pages/Offers.tsx](src/pages/Offers.tsx)
- [ ] Update wishlist context
- **Impact**: Dynamic marketing & saved items

## 📚 API Service Examples

### Products
```typescript
import { productsService } from '@/services/supabase';

// Get all products
const { data, error } = await productsService.getAllProducts(50, 0);

// Get by category
const { data } = await productsService.getProductsByCategory(categoryId);

// Search
const { data } = await productsService.searchProducts('apple', 'en');

// Get featured
const { data } = await productsService.getFeaturedProducts();
```

### Cart
```typescript
import { cartService } from '@/services/supabase';

// Get user's cart
const { data: cartItems } = await cartService.getCart(userId);

// Add item
const { data } = await cartService.addToCart(userId, productId, quantity);

// Update quantity
await cartService.updateQuantity(cartItemId, newQuantity);

// Remove
await cartService.removeFromCart(cartItemId);

// Clear all
await cartService.clearCart(userId);
```

### Orders
```typescript
import { ordersService } from '@/services/supabase';

// Create order
const { data: order } = await ordersService.createOrder({
  userId,
  deliveryAddress: '...',
  deliveryPhone: '...',
  subtotal: 100,
  deliveryFee: 30,
  total: 130,
  paymentMethod: 'wallet',
  items: [...]
});

// Get user's orders
const { data: orders } = await ordersService.getUserOrders(userId);

// Get single order
const { data: order } = await ordersService.getOrder(orderId);

// Update status
await ordersService.updateOrderStatus(orderId, 'delivered');
```

### Wallet
```typescript
import { walletService } from '@/services/supabase';

// Get balance
const { data: wallet } = await walletService.getWallet(userId);

// Recharge
const { data } = await walletService.rechargeWallet(userId, 500);

// Debit (for order payment)
await walletService.debitWallet(userId, 130, orderId);

// Get history
const { data: transactions } = await walletService.getTransactions(userId, 50);
```

## 🔐 Security Notes

- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only access their own data
- **Auth required** for cart, orders, wallet operations
- **Products**, **offers**, **categories** publicly visible
- Never expose service_role key to client

## 🧪 Testing Checklist

After each phase, test:

```typescript
// Phase 1: Auth
✓ User signup
✓ User login  
✓ User logout
✓ Profile read
✓ Profile update

// Phase 2: Products
✓ getAllProducts()
✓ searchProducts()
✓ getProductsByCategory()
✓ getFeaturedProducts()

// Phase 3: Cart
✓ addToCart()
✓ getCart()
✓ updateQuantity()
✓ removeFromCart()

// Phase 4: Orders
✓ createOrder()
✓ getUserOrders()
✓ getOrder()
✓ updateOrderStatus()

// Phase 5: Wallet
✓ getWallet()
✓ rechargeWallet()
✓ debitWallet()
✓ getTransactions()
```

## 📊 Database Schema Summary

| Table | Purpose | RLS | Users Access |
|-------|---------|-----|---------|
| profiles | User data | ✓ | Own only |
| products | All products | ✓ | View all |
| categories | Categories | ✓ | View all |
| cart_items | Shopping cart | ✓ | Own only |
| orders | Orders | ✓ | Own only |
| order_items | Order details | ✓ | Own only |
| wallets | Account balance | ✓ | Own only |
| wallet_transactions | Transaction history | ✓ | Own only |
| offers | Marketing offers | ✓ | View all |
| addresses | Delivery addresses | ✓ | Own only |
| reviews | Product reviews | ✓ | View all |
| wishlist | Saved items | ✓ | Own only |

## 📱 Bilingual Support

All tables support bilingual content:
- `name_en` / `name_ar`
- `description_en` / `description_ar`
- `title_en` / `title_ar`

Arabic numerals and EGP currency formatting is already implemented via `priceFormatter` utility.

## 🐛 Troubleshooting

### "Supabase environment variables not configured"
- Check `.env.local` has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `pnpm dev`

### "RLS policy violation"
- Ensure user is authenticated (`auth.uid()` works)
- Check user_id matches in database
- Verify RLS policies are enabled

### "Table doesn't exist"
- Run `SUPABASE_SCHEMA.sql` in Supabase SQL Editor
- Check table names match exactly

### "CORS error"
- Supabase handles CORS automatically for web
- Check anon key is correct
- Verify domain is allowed in Supabase settings

## 📞 Getting Help

1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup
2. Review service examples above
3. Check Supabase docs: https://supabase.com/docs
4. Verify database has tables: Supabase Dashboard → SQL Editor

## 🎯 Success Criteria

When fully integrated ($Supabase works perfectly when:

✅ Users can sign up/login with real database
✅ Products load from database (not mock data)
✅ Cart persists across sessions & devices
✅ Orders save to database
✅ Wallet transactions tracked
✅ Bilingual search works
✅ All prices display in EGP
✅ RTL layout working in Arabic mode

---

**Next Action**: Start Phase 1 - Update Auth Context to use Supabase authentication.

Questions? Check the SUPABASE_SETUP.md file for more details!
