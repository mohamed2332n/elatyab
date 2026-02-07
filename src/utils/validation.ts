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

// Example validation schemas
export const itemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");