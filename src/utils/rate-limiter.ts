// Utility for client-side rate limiting
type RateLimiterMap = Map<string, number>;

const rateLimiters: RateLimiterMap = new Map();

export const isRateLimited = (key: string, limitMs: number = 1000): boolean => {
  const now = Date.now();
  const lastRequest = rateLimiters.get(key) || 0;
  
  if (now - lastRequest < limitMs) {
    return true;
  }
  
  rateLimiters.set(key, now);
  return false;
};

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const limit = 60000; // 1 minute
  
  for (const [key, timestamp] of rateLimiters.entries()) {
    if (now - timestamp > limit) {
      rateLimiters.delete(key);
    }
  }
}, 30000); // Run cleanup every 30 seconds