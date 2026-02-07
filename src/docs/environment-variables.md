# Environment Variables Security Guide

## Important Security Notice
To prevent accidental exposure of sensitive credentials, only environment variables prefixed with `VITE_` are exposed to client-side code.

## Safe Usage Examples

### ✅ Correct Usage (Client-side)
```typescript
// Accessing VITE_ prefixed variables
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;

// Using the utility functions (recommended)
import { getApiUrl, getEnvVariable } from '@/lib/env';
const apiUrl = getApiUrl();
const apiKey = getEnvVariable('VITE_API_KEY');
```

### ❌ Incorrect Usage (Client-side)
```typescript
// These will NOT be available in client-side code
const secretKey = import.meta.env.SECRET_API_KEY;
const dbPassword = import.meta.env.DATABASE_PASSWORD;

// Direct access is now restricted by ESLint rules
const anyEnv = import.meta.env; // This will trigger ESLint warning
```

## Best Practices
1. **Always prefix client-side environment variables with `VITE_`**
2. **Never store secrets (API keys, passwords) in client-side code**
3. **Use server-side environment variables for sensitive data**
4. **Validate environment variables at startup using utility functions**
5. **Use the provided utility functions (`getEnvVariable`, `getEnvVariableBoolean`, etc.) for type-safe access**

## Server-side Variables (Not exposed to client)
For sensitive data like database passwords, API secrets, etc., use server-side environment variables that are NOT prefixed with `VITE_`. These variables should only be accessed by backend services, not client-side code.

## ESLint Rules
The project includes ESLint rules that will:
- Prevent direct access to `import.meta.env`
- Prevent access to non-VITE_ prefixed environment variables
- Guide developers toward secure patterns

Always use the utility functions in `@/lib/env` for accessing environment variables.