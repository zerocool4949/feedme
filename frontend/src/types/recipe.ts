export type RecipeVisibility = 'private' | 'public' | 'shared';

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
  sourceUrl: string | null;
  imageUrl: string | null;
  visibility: RecipeVisibility;
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
  sourceUrl?: string;
  imageUrl?: string;
  visibility: RecipeVisibility;
  ingredients: IngredientInput[];
  tags: string[];
}
