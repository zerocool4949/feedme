import type { Recipe, RecipeInput } from '../types/recipe';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error('Identifiants invalides');
  const data = await response.json() as { token: string };
  return data.token;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await request('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function listRecipes(search: string): Promise<Recipe[]> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return request<Recipe[]>(`/recipes${query}`);
}

export async function listHiddenRecipes(): Promise<Recipe[]> {
  return request<Recipe[]>('/recipes/hidden');
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

export async function hideRecipe(id: string): Promise<void> {
  await request(`/recipes/${id}/hide`, { method: 'POST' });
}

export async function unhideRecipe(id: string): Promise<void> {
  await request(`/recipes/${id}/hide`, { method: 'DELETE' });
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
  const token = localStorage.getItem('feedme-token');
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (response.status === 401) {
    localStorage.removeItem('feedme-token');
    window.location.reload();
    throw new Error('Session expirée');
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `La requête a échoué (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function cleanRecipeInput(input: RecipeInput) {
  return {
    ...input,
    sourceUrl: input.sourceUrl?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    ingredients: input.ingredients.filter((ingredient) => ingredient.name.trim()),
    tags: input.tags.filter((tag) => tag.trim()),
  };
}
