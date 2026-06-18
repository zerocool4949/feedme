import { afterEach, describe, expect, it, vi } from 'vitest';
import { shuffleDiverseRecipes, type ShuffleRecipe } from './recipe-shuffle.service';

interface TestRecipe extends ShuffleRecipe {
  id: string;
}

describe('shuffleDiverseRecipes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers recipes with less ingredient and tag overlap', () => {
    const recipes = [
      recipe('pasta-carbonara', ['pasta', 'egg', 'cheese'], ['italian']),
      recipe('pasta-tomato', ['pasta', 'tomato', 'cheese'], ['italian']),
      recipe('beef-rice', ['beef', 'rice', 'pepper'], ['asian']),
    ];

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const shuffled = shuffleDiverseRecipes(recipes, 2);

    expect(shuffled.map((item) => item.id)).toContain('beef-rice');
    expect(shuffled.map((item) => item.id).sort()).not.toEqual(['pasta-carbonara', 'pasta-tomato']);
  });

  it('keeps all returned recipes distinct when count exceeds available recipes', () => {
    const recipes = [recipe('one', ['egg'], []), recipe('two', ['rice'], [])];

    const shuffled = shuffleDiverseRecipes(recipes, 7);

    expect(shuffled).toHaveLength(2);
    expect(new Set(shuffled.map((item) => item.id)).size).toBe(2);
  });
});

function recipe(id: string, ingredients: string[], tags: string[]): TestRecipe {
  return {
    id,
    ingredients: ingredients.map((normalizedName) => ({ normalizedName })),
    tags: tags.map((tag) => ({ tag })),
  };
}
