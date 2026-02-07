# Security Implementation: CSRF Protection

This application implements CSRF protection using custom headers. Here's how it works and how to maintain it.

## Client-Side Implementation

1. **Custom Header Approach**: All state-changing requests (POST, PUT, DELETE) include the header:
   ```
   X-Requested-With: XMLHttpRequest
   ```

2. **Protected Hooks**: Use `useProtectedMutation` instead of `useMutation` for all state-changing operations:
   ```typescript
   import { useProtectedMutation } from '@/hooks/use-protected-mutation';
   
   const mutation = useProtectedMutation({
     mutationFn: (data) => apiService.createItem(data),
     // ... other options
   });
   ```

3. **Manual Requests**: For direct fetch requests, use the `addCSRFProtection` utility:
   ```typescript
   import { addCSRFProtection } from '@/utils/csrf';
   
   fetch('/api/items', addCSRFProtection({
     method: 'POST',
     body: JSON.stringify(data)
   }));
   ```

## Server-Side Implementation

Your backend must validate CSRF protection by checking for the custom header:

### Express.js Example
```javascript
app.use((req, res, next) => {
  const allowedMethods = ['GET', 'HEAD', 'OPTIONS'];
  const stateChanging = !allowedMethods.includes(req.method);
  
  if (stateChanging) {
    const requestedWith = req.get('X-Requested-With');
    if (!requestedWith || requestedWith !== 'XMLHttpRequest') {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
  
  next();
});
```

### Alternative: Token-Based Approach

For stronger security, implement token-based CSRF protection:

1. Server generates a CSRF token and includes it in the initial page load
2. Client includes this token in a custom header for all requests
3. Server validates the token before processing requests

## Best Practices

1. **Always use HTTPS** in production
2. **Set SameSite cookies** to `Strict` or `Lax`:
   ```javascript
   res.cookie('session', sessionId, {
     httpOnly: true,
     secure: true,
     sameSite: 'strict'
   });
   ```
3. **Validate all state-changing requests** on the server
4. **Keep tokens secure** and rotate them periodically

## Testing CSRF Protection

1. Try making a POST request without the CSRF header - it should be rejected
2. Try making a GET request without the header - it should work
3. Verify that legitimate requests with the header work correctly