/** 
 * Utility functions for safely accessing environment variables
 * Only VITE_ prefixed environment variables are exposed to client-side code
 */
export const getEnvVariable = (name: string, defaultValue?: string): string => {
  // Enforce VITE_ prefix for client-side environment variables
  if (!name.startsWith('VITE_')) {
    throw new Error(`Client-side environment variable "${name}" must be prefixed with "VITE_". This prevents accidental exposure of sensitive credentials.`);
  }
  
  const value = import.meta.env[name];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is not defined and no default value provided`);
  }
  return value || defaultValue || '';
};

export const getEnvVariableBoolean = (name: string, defaultValue: boolean = false): boolean => {
  // Enforce VITE_ prefix for client-side environment variables
  if (!name.startsWith('VITE_')) {
    throw new Error(`Client-side environment variable "${name}" must be prefixed with "VITE_". This prevents accidental exposure of sensitive credentials.`);
  }
  
  const value = import.meta.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true';
};

export const getEnvVariableNumber = (name: string, defaultValue: number = 0): number => {
  // Enforce VITE_ prefix for client-side environment variables
  if (!name.startsWith('VITE_')) {
    throw new Error(`Client-side environment variable "${name}" must be prefixed with "VITE_". This prevents accidental exposure of sensitive credentials.`);
  }
  
  const value = import.meta.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return defaultValue;
  }
  return num;
};

// Example of how to safely access VITE_ prefixed environment variables
export const getApiUrl = (): string => {
  return getEnvVariable('VITE_API_URL', '/api');
};

export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development';
};