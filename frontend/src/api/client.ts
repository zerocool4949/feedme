import type { Recipe, RecipeInput } from '../types/recipe';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function listRecipes(search: string): Promise<Recipe[]> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return request<Recipe[]>(`/recipes${query}`);
}

export async function getRecipe(id: string): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`);
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  return request<Recipe>('/recipes', {
    method: 'POST',
    body: JSON.stringify(cleanRecipeInput(input)),
  });
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cleanRecipeInput(input)),
  });
}

export async function deleteRecipe(id: string): Promise<void> {
  await request(`/recipes/${id}`, { method: 'DELETE' });
}

export async function shuffleRecipes(count: number): Promise<Recipe[]> {
  return request<Recipe[]>(`/recipes/shuffle?count=${count}`);
}

export async function importRecipe(url: string): Promise<Partial<RecipeInput>> {
  return request<Partial<RecipeInput>>('/recipes/import', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function cleanRecipeInput(input: RecipeInput) {
  return {
    ...input,
    prepTimeMinutes: numberOrUndefined(input.prepTimeMinutes),
    cookTimeMinutes: numberOrUndefined(input.cookTimeMinutes),
    servings: numberOrUndefined(input.servings),
    rating: numberOrUndefined(input.rating),
    difficulty: input.difficulty || undefined,
    sourceUrl: input.sourceUrl?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    ingredients: input.ingredients.filter((ingredient) => ingredient.name.trim()),
    tags: input.tags.filter((tag) => tag.trim()),
  };
}

function numberOrUndefined(value?: number): number | undefined {
  return value === undefined || Number.isNaN(value) ? undefined : value;
}
