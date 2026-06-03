export type RecipeVisibility = 'private' | 'public' | 'shared';
export type RecipeStatus = 'to_try' | 'tested' | 'favorite';
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export interface IngredientInput {
  name: string;
  quantity?: string;
  unit?: string;
  originalText?: string;
}

export interface Ingredient extends IngredientInput {
  id: string;
  recipeId: string;
  normalizedName: string;
}

export interface RecipeTag {
  id: string;
  recipeId: string;
  tag: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  instructions: string;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  visibility: RecipeVisibility;
  status: RecipeStatus;
  rating: number | null;
  difficulty: RecipeDifficulty | null;
  createdAt: string;
  updatedAt: string;
  ingredients: Ingredient[];
  tags: RecipeTag[];
}

export interface RecipeInput {
  title: string;
  description?: string;
  notes?: string;
  instructions: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  imageUrl?: string;
  visibility: RecipeVisibility;
  status: RecipeStatus;
  rating?: number;
  difficulty?: RecipeDifficulty;
  ingredients: IngredientInput[];
  tags: string[];
}
