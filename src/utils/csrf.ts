// CSRF protection utility using custom headers
const CSRF_HEADER_NAME = 'X-Requested-With';
const CSRF_HEADER_VALUE = 'XMLHttpRequest';

// Function to add CSRF protection to fetch requests
export const addCSRFProtection = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    headers: {
      ...options.headers,
      [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
    },
  };
};

// Function to create a protected fetch wrapper
export const createProtectedFetch = () => {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const protectedInit = addCSRFProtection(init);
    return fetch(input, protectedInit);
  };
};

// Default protected fetch instance
export const protectedFetch = createProtectedFetch();

// Function to add CSRF header to TanStack Query mutations
export const withCSRF = <T extends { meta?: Record<string, unknown> }>(
  options: T
): T => {
  return {
    ...options,
    meta: {
      ...options.meta,
      headers: {
        ...(options.meta?.headers as Record<string, string>),
        [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
      },
    },
  };
};