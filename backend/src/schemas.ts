import { z } from 'zod';
import { RecipeVisibility } from '@prisma/client';

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  originalText: z.string().optional(),
});

export const createRecipeSchema = z.object({
  title: z.string(),
  notes: z.string().optional(),
  instructions: z.string(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  visibility: z.nativeEnum(RecipeVisibility).optional(),
  ingredients: z.array(ingredientSchema),
  tags: z.array(z.string()).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();
export const importRecipeSchema = z.object({ url: z.string().url() });
export const loginSchema = z.object({ username: z.string(), password: z.string() });
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export type IngredientDto = z.infer<typeof ingredientSchema>;
export type CreateRecipeDto = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeDto = z.infer<typeof updateRecipeSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
