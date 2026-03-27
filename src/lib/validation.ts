import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  type: z.enum(["add", "remove"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
