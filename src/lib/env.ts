/**
 * Utility functions for safely accessing environment variables
 * Only VITE_ prefixed environment variables are exposed to the client
 */

export const getEnvVariable = (name: string, defaultValue?: string): string => {
  const value = import.meta.env[name];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is not defined and no default value provided`);
  }
  return value || defaultValue || '';
};

export const getEnvVariableBoolean = (name: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true';
};

export const getEnvVariableNumber = (name: string, defaultValue: number = 0): number => {
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