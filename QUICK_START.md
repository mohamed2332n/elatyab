# Quick Start Guide to Project Improvements

## New Features & Utilities Available

### 1. Constants Management
**File**: `src/lib/constants.ts`

Instead of hardcoding values, use the constants file:

```typescript
import { CART, PAGINATION, VALIDATION } from '@/lib/constants';

// Before:
const FREE_DELIVERY_THRESHOLD = 500;
const MAX_QUANTITY = 99;

// After:
const FREE_DELIVERY_THRESHOLD = CART.FREE_DELIVERY_THRESHOLD;
const MAX_QUANTITY = CART.MAX_QUANTITY;
```

### 2. Enhanced Validation
**File**: `src/utils/validation.ts`

New validation functions available:

```typescript
import { 
  isValidEmail, 
  isValidPassword, 
  isStrongPassword,
  sanitizeInput 
} from '@/utils/validation';

// Validate email
if (!isValidEmail(userEmail)) {
  console.error('Invalid email');
}

// Validate strong password
if (!isStrongPassword(password)) {
  console.error('Password must contain uppercase, lowercase, numbers, and special chars');
}

// Sanitize user input to prevent XSS
const cleanInput = sanitizeInput(userInput);
```

### 3. Error Handling with Retry Logic
**File**: `src/utils/error-handler.ts`

Automatic error recovery:

```typescript
import { retryAsync, handleApiError, withTimeout } from '@/utils/error-handler';

// Automatic retry with exponential backoff
try {
  const data = await retryAsync(
    () => apiService.getProducts(1, 12),
    3,      // max attempts
    1000,   // initial delay in ms
  );
} catch (error) {
  const appError = handleApiError(error);
  console.error(appError.message);
}

// Add timeout to promise
try {
  const data = await withTimeout(
    apiService.getProducts(),
    10000 // 10 second timeout
  );
} catch (error) {
  console.error('Request timeout');
}
```

### 4. Wishlist/Favorites Feature (NEW)
**File**: `src/context/wishlist-context.tsx`

Available through `useWishlist()` hook:

```typescript
import { useWishlist } from '@/context/wishlist-context';

function ProductCard({ productId, name }) {
  const { 
    isInWishlist, 
    toggleWishlist, 
    getWishlistCount 
  } = useWishlist();
  
  const isFavorite = isInWishlist(productId);
  const count = getWishlistCount();

  return (
    <div>
      <h3>{name}</h3>
      <button onClick={() => toggleWishlist(productId)}>
        {isFavorite ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
      </button>
      <p>Wishlist items: {count}</p>
    </div>
  );
}
```

**Features**:
- Automatically persists to browser localStorage
- Works across page refreshes
- Clean API for wishlist management

### 5. Pagination Component (NEW)
**File**: `src/components/pagination.tsx`

Use the new pagination component:

```typescript
import { Pagination, PaginationInfo } from '@/components/pagination';

function ProductList() {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService.getProducts(page, 12)
      .then(response => {
        setProducts(response.data);
        setTotal(response.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <div className="grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <PaginationInfo 
        currentPage={page} 
        pageSize={12} 
        total={total} 
      />
      
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / 12)}
        onPageChange={setPage}
        isLoading={loading}
      />
    </>
  );
}
```

### 6. Product Filtering & Sorting
**File**: `src/utils/product-helpers.ts`

Powerful product filtering:

```typescript
import { 
  filterAndSortProducts, 
  getPriceRange,
  getUniqueTags 
} from '@/utils/product-helpers';

// Filter and sort products
const filtered = filterAndSortProducts(allProducts, {
  search: 'apple',
  minPrice: 50,
  maxPrice: 300,
  inStock: true,
  sortBy: 'rating',      // or 'price', 'popularity', 'newest'
  sortOrder: 'desc'      // or 'asc'
});

// Get price range (for price slider)
const [minPrice, maxPrice] = getPriceRange(products);

// Get all unique tags (for filter options)
const allTags = getUniqueTags(products);
```

### 7. Improved API Service
**File**: `src/services/api.ts`

The API service now includes:

```typescript
import { apiService } from '@/services/api';

// Get products with pagination
const response = await apiService.getProducts(
  1,    // page number
  12    // page size
);
// Returns: { data, total, page, pageSize, hasMore }

// Search products with filters
const results = await apiService.searchProducts(
  'apple',
  { 
    minPrice: 50,
    maxPrice: 300,
    inStock: true
  }
);

// All API calls now have:
// - Automatic timeout (10 seconds)
// - Automatic retries (up to 3 attempts)
// - Input validation
// - Error handling
```

### 8. Type Safety
**File**: `src/lib/types.ts`

Import and use types:

```typescript
import { 
  Product, 
  CartItem, 
  Order, 
  PaginatedProducts 
} from '@/lib/types';

function handleProduct(product: Product) {
  console.log(product.name, product.discountedPrice);
}

async function getPagedProducts() {
  const response: PaginatedProducts = await apiService.getProducts(1, 12);
  return response.data;
}
```

---

## Best Practices

### 1. Input Validation
Always validate user input:
```typescript
import { validateData, emailSchema, passwordSchema } from '@/utils/validation';

const validation = validateData(emailSchema, userEmail);
if (!validation.success) {
  throw new Error(validation.errors[0]);
}
```

### 2. Error Handling
Use the error handler for better error messages:
```typescript
import { getErrorMessage, isRetryableError } from '@/utils/error-handler';

try {
  await apiCall();
} catch (error) {
  const message = getErrorMessage(error);
  if (isRetryableError(error)) {
    // Automatically retried by apiService
  }
}
```

### 3. Using Constants
Don't hardcode values:
```typescript
import { CART, PAGINATION } from '@/lib/constants';

if (cartTotal < CART.FREE_DELIVERY_THRESHOLD) {
  deliveryFee = CART.STANDARD_DELIVERY_FEE;
}

const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
```

### 4. Performance
Use pagination for large lists:
```typescript
// Good - pagination prevents loading 10000 items at once
const { data } = await apiService.getProducts(page, 12);

// Avoid - loading all items
const allProducts = await apiService.getProducts(1, 10000);
```

---

## Common Issues & Solutions

### Issue: "Cannot find context"
**Solution**: Make sure the provider is wrapped in App.tsx

### Issue: "Wishlist not persisting"
**Solution**: Check browser localStorage is enabled and not full

### Issue: API calls too slow
**Solution**: Check network tab, consider pagination and caching

### Issue: Type errors with new utilities
**Solution**: Import types from `src/lib/types.ts`

---

## Testing Your Changes

### Test Wishlist:
```typescript
// In browser console
localStorage.getItem('wishlist'); // Should show array of product IDs
```

### Test Pagination:
```typescript
// In API service
const response = await apiService.getProducts(1, 12);
console.log(response.hasMore); // Should show if more pages exist
```

### Test Error Handling:
```typescript
// Force an error
await apiService.getProduct('invalid-id');
// Should automatically retry and show error message
```

---

## Migration Guide

If you have existing code using old patterns:

### Old Pattern → New Pattern

**Constants**:
```typescript
// Old
const MAX_QUANTITY = 99;

// New
import { CART } from '@/lib/constants';
const MAX_QUANTITY = CART.MAX_QUANTITY;
```

**Validation**:
```typescript
// Old
const isEmail = email.includes('@');

// New
import { isValidEmail } from '@/utils/validation';
const isEmail = isValidEmail(email);
```

**API Calls**:
```typescript
// Old
const products = await apiService.getProducts();

// New
const { data, total } = await apiService.getProducts(1, 12);
```

**Error Handling**:
```typescript
// Old
try { ... } catch (e) { console.log(e); }

// New
try { ... } catch (e) { 
  const msg = getErrorMessage(e); 
  showToast(msg);
}
```

---

## Documentation Links

- [Full Improvements Guide](./IMPROVEMENTS.md)
- [Constants Reference](./src/lib/constants.ts)
- [Types Reference](./src/lib/types.ts)
- [Error Handler API](./src/utils/error-handler.ts)
- [Validation Functions](./src/utils/validation.ts)
- [Product Helpers](./src/utils/product-helpers.ts)

---

## Need Help?

1. Check the examples above
2. Review the IMPROVEMENTS.md file
3. Look at the JSDoc comments in each utility file
4. Check TypeScript IntelliSense for available methods

Happy coding! 🚀
