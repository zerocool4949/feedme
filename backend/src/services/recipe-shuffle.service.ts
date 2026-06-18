interface ShuffleRecipeFeature {
  normalizedName?: string;
  tag?: string;
}

export interface ShuffleRecipe {
  ingredients: ShuffleRecipeFeature[];
  tags: ShuffleRecipeFeature[];
}

export function shuffleDiverseRecipes<T extends ShuffleRecipe>(recipes: T[], count: number): T[] {
  const safeCount = Math.min(Math.max(Math.trunc(count), 1), recipes.length);
  if (safeCount === 0) return [];

  const pool = shuffleArray(recipes);
  const selected = pool.splice(Math.floor(Math.random() * pool.length), 1);

  while (selected.length < safeCount && pool.length > 0) {
    const nextIndex = findLeastSimilarRecipeIndex(pool, selected);
    selected.push(pool.splice(nextIndex, 1)[0]);
  }

  return selected;
}

function findLeastSimilarRecipeIndex<T extends ShuffleRecipe>(pool: T[], selected: T[]): number {
  let bestIndex = 0;
  let bestSimilarity = Number.POSITIVE_INFINITY;

  for (const [index, recipe] of pool.entries()) {
    const similarity = Math.max(...selected.map((selectedRecipe) => recipeSimilarity(recipe, selectedRecipe)));

    if (similarity < bestSimilarity) {
      bestIndex = index;
      bestSimilarity = similarity;
    }
  }

  return bestIndex;
}

function recipeSimilarity(first: ShuffleRecipe, second: ShuffleRecipe): number {
  const firstFeatures = recipeFeatures(first);
  const secondFeatures = recipeFeatures(second);

  // Treat recipes with no features as neutral rather than maximally dissimilar,
  // otherwise they would always win the greedy pick and dominate every shuffle.
  if (firstFeatures.size === 0 || secondFeatures.size === 0) return 0.5;

  let intersection = 0;
  for (const feature of firstFeatures) {
    if (secondFeatures.has(feature)) {
      intersection += 1;
    }
  }

  const union = firstFeatures.size + secondFeatures.size - intersection;
  return intersection / union;
}

function recipeFeatures(recipe: ShuffleRecipe): Set<string> {
  return new Set([
    ...recipe.ingredients.map((ingredient) => ingredient.normalizedName).filter(isPresent).map((name) => `ingredient:${name}`),
    ...recipe.tags.map((tag) => tag.tag).filter(isPresent).map((tag) => `tag:${tag.toLowerCase()}`),
  ]);
}

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function isPresent(value: string | undefined): value is string {
  return Boolean(value);
}
