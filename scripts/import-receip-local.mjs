import fs from 'node:fs/promises';
import path from 'node:path';

const apiBaseUrl = process.env.FEEDME_API_BASE_URL ?? 'http://localhost:2323/api';
const recipeDir = process.env.FEEDME_RECIPE_DIR ?? 'receip';
const unitWords = new Set([
  'kg',
  'g',
  'mg',
  'l',
  'dl',
  'cl',
  'ml',
  'EL',
  'TL',
  'el',
  'tl',
  'cs',
  'cc',
  'tbsp',
  'tsp',
  'pinch',
  'pinchée',
  'pincée',
  'prise',
  'cup',
  'cups',
]);

const existingRecipes = await request('/recipes');
let deleted = 0;

for (const recipe of existingRecipes) {
  if (recipe.tags.some((tag) => tag.tag === 'imported')) {
    await request(`/recipes/${recipe.id}`, { method: 'DELETE' });
    deleted += 1;
  }
}

const files = (await fs.readdir(recipeDir)).filter((file) => file.endsWith('.html')).sort();
const failures = [];
let created = 0;

for (const file of files) {
  try {
    const html = await fs.readFile(path.join(recipeDir, file), 'utf8');
    const recipe = parseRecipeHtml(html, file);

    await request('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
    created += 1;
  } catch (error) {
    failures.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(
  JSON.stringify(
    {
      deleted,
      created,
      failed: failures.length,
      failures,
    },
    null,
    2,
  ),
);

function parseRecipeHtml(html, file) {
  const title = stripHtml(firstMatch(html, /<h1[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h1>/i)) || path.basename(file, '.html');
  const sourceUrl = decodeHtml(firstMatch(html, /<a[^>]*itemprop="url"[^>]*href="([^"]+)"/i));
  const imageUrl = decodeHtml(firstMatch(html, /<div class="photobox">[\s\S]*?<a href="([^"]+)"/i));
  const ingredients = [...html.matchAll(/<p class="line" itemprop="recipeIngredient">([\s\S]*?)<\/p>/gi)]
    .map((match) => parseIngredient(match[1]))
    .filter((ingredient) => ingredient.name && ingredient.name !== 'Ingrédients');
  const instructionHtml = firstMatch(html, /<div[^>]*itemprop="recipeInstructions"[^>]*>([\s\S]*?)<\/div>/i);
  const instructions = [...instructionHtml.matchAll(/<p class="line">([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter((line) => line && !/^(Directions|Preparation|Préparation)$/.test(line));

  if (ingredients.length === 0) {
    throw new Error('Missing ingredients');
  }

  return removeEmpty({
    title,
    sourceUrl,
    imageUrl,
    visibility: 'private',
    ingredients,
    tags: ['imported'],
    instructions:
      instructions.length > 0
        ? instructions.join('\n')
        : 'La préparation était absente du fichier HTML importé. Complète-la manuellement.',
    notes:
      instructions.length > 0
        ? undefined
        : 'Importé depuis un export HTML local. La préparation était absente du fichier source.',
  });
}

function parseIngredient(value) {
  const originalText = stripHtml(value);
  const match = originalText.match(
    /^(\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?|\d+\s*\/\s*\d+)\s+(.+)$/,
  );

  if (!match) {
    return { name: originalText, originalText };
  }

  const quantity = match[1].replace(/\s+/g, '');
  const rest = match[2].trim();
  const [possibleUnit, ...nameParts] = rest.split(/\s+/);

  if (unitWords.has(possibleUnit) && nameParts.length > 0) {
    return {
      quantity,
      unit: possibleUnit,
      name: nameParts.join(' '),
      originalText,
    };
  }

  return {
    quantity,
    name: rest,
    originalText,
  };
}

async function request(pathname, init = {}) {
  const response = await fetch(`${apiBaseUrl}${pathname}`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }

  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

function firstMatch(value, pattern) {
  return value.match(pattern)?.[1] ?? '';
}

function stripHtml(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function removeEmpty(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ''));
}
