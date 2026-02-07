import { z } from 'zod';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

export const priceRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().positive(),
}).refine(data => data.min <= data.max, "Min price must be less than max price");

export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(99),
});

export const validateData = <T extends z.ZodTypeAny>(schema: T, data: unknown) => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Validation failed'] };
  }
};