import { z } from 'zod';

// Define types for validation results
export type ValidationError = { 
  success: false; 
  errors: string[] 
};

export type ValidationSuccess<T> = { 
  success: true; 
  data: T 
};

// Generic validation function
export const validateData = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ValidationSuccess<z.infer<T>> | ValidationError => {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => err.message);
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isStrongPassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

export const isValidProductName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 100;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price);
};

export const isValidQuantity = (quantity: number, max: number = 99): boolean => {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= max;
};

// Example validation schemas
export const itemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

export const emailSchema = z.string().email("Invalid email address").max(254, "Email is too long");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  weight: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(99),
  image: z.string().optional(),
});

export const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const searchQuerySchema = z.string().min(1).max(100);

export const priceRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().positive(),
}).refine(data => data.min <= data.max, "Min price must be less than max price");