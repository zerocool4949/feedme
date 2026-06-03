import fs from 'node:fs';

const apiBaseUrl = process.env.FEEDME_API_BASE_URL ?? 'http://localhost:2323/api';
const targetLanguage = process.env.FEEDME_TRANSLATE_TO ?? 'fr';
const pauseMs = Number(process.env.FEEDME_TRANSLATE_PAUSE_MS ?? 150);
const sourceFile = process.env.FEEDME_TRANSLATE_SOURCE_FILE;

const recipes = sourceFile ? JSON.parse(fs.readFileSync(sourceFile, 'utf8')) : await request('/recipes');
const importedRecipes = recipes.filter((recipe) => recipe.tags.some((tag) => tag.tag === 'imported'));
let translated = 0;
const failures = [];

for (const recipe of importedRecipes) {
  try {
    const translatedTitle = await translateText(recipe.title);
    const translatedNotes = await translateText(recipe.notes ?? '');
    const translatedInstructions = await translateText(recipe.instructions);
    const ingredientNames = recipe.ingredients.map((ingredient) => ingredient.name);
    const translatedIngredientNames = await translateLines(ingredientNames);
    const ingredients = recipe.ingredients.map((ingredient, index) => {
      return normalizeIngredient(ingredient, translatedIngredientNames[index] || ingredient.name);
    });

    await request(`/recipes/${recipe.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: titleOverride(recipe.title) ?? translatedTitle ?? recipe.title,
        notes: translatedNotes || undefined,
        instructions: translatedInstructions || recipe.instructions,
        sourceUrl: recipe.sourceUrl ?? undefined,
        imageUrl: recipe.imageUrl ?? undefined,
        visibility: recipe.visibility,
        ingredients: ingredients.filter(isUsefulIngredient),
        tags: recipe.tags.map((tag) => tag.tag),
      }),
    });

    translated += 1;
    console.log(`Translated: ${recipe.title}`);
  } catch (error) {
    failures.push(`${recipe.title}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(
  JSON.stringify(
    {
      translated,
      failed: failures.length,
      failures,
    },
    null,
    2,
  ),
);

async function translateLines(lines) {
  if (lines.length === 0) {
    return [];
  }

  const delimiter = '\n';
  const translated = await translateText(lines.join(delimiter));
  const translatedLines = translated.split(/\n+/).map((line) => line.trim());

  if (translatedLines.length === lines.length) {
    return translatedLines;
  }

  const fallback = [];
  for (const line of lines) {
    fallback.push(await translateText(line));
  }
  return fallback;
}

async function translateText(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return '';
  }

  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'auto');
  url.searchParams.set('tl', targetLanguage);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', trimmed);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translation failed with ${response.status}`);
  }

  const data = await response.json();
  await delay(pauseMs);

  return (data[0] ?? []).map((part) => part[0]).join('').trim();
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

  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

function formatIngredientText(quantity, unit, name) {
  return [quantity, unit, name].filter(Boolean).join(' ');
}

function normalizeIngredient(ingredient, translatedName) {
  const unit = normalizeUnit(ingredient.unit);
  const quantity = ingredient.quantity ?? undefined;
  let name = translatedName.trim();

  if (quantity && !unit) {
    const unitNameMatch = name.match(/^(unité|unités)\s+d['e]\s+(.+)$/i);
    if (unitNameMatch) {
      name = unitNameMatch[2].trim();
      return {
        quantity,
        unit: unitNameMatch[1].toLowerCase(),
        name,
        originalText: formatIngredientText(quantity, unitNameMatch[1].toLowerCase(), name),
      };
    }
  }

  if (quantity && unit) {
    name = name.replace(/^d['e]\s+/i, '').trim();
  }

  const spoonMatch = name.match(/^(½|1\/2)\s+cuill(?:è|e)re à soupe\s+d['e]\s+(.+)$/i);
  if (!quantity && spoonMatch) {
    return {
      quantity: '1/2',
      unit: 'c. à s.',
      name: spoonMatch[2].trim(),
      originalText: formatIngredientText('1/2', 'c. à s.', spoonMatch[2].trim()),
    };
  }

  return {
    name,
    quantity,
    unit,
    originalText: formatIngredientText(quantity, unit, name),
  };
}

function titleOverride(title) {
  const overrides = {
    'Penne Cinque Pi - Rezept | Swissmilk': 'Penne cinque pi',
    'Hotdog - Rezept | Swissmilk': 'Hot-dog',
    'Hamburger - Rezept | Swissmilk': 'Hamburger',
    'Fajitas - Rezept | Swissmilk': 'Fajitas',
    'Cordon Bleu - Rezept | Swissmilk': 'Cordon bleu',
    'Pita Au Poulet Et Sauce - Recette | Swissmilk': 'Pita au poulet et sauce',
    'Phat Krapao (Thai Mince Dish)': 'Phat krapao (haché thaï)',
    'Ghackets Und Hörnli': 'Ghackets et cornettes',
    'Rindshuft-Stroganoff': 'Stroganoff de rumsteck',
    'Älplermagronen Mit Apfelmus': 'Älplermagronen à la compote de pommes',
    'Bolognese-Sauce': 'Sauce bolognaise',
    'Shrimp Pasta': 'Pâtes aux crevettes',
    'Meatballs in Tomato Sauce': 'Boulettes de viande à la sauce tomate',
    'Pork Adobo': 'Adobo de porc',
    'Pork Chops with Vegetables': 'Côtelettes de porc aux légumes',
    'Club Sandwich': 'Club sandwich',
    'Wiener Schnitzel': 'Escalope viennoise',
    'Pizza Margherita': 'Pizza margherita',
    'Piccata De Poulet': 'Piccata de poulet',
    'Geschnetzeltes': 'Émincé',
    'Ossobuco De Porc Braisé Dans Les Règles De L’art - Viande Suisse':
      "Ossobuco de porc braisé dans les règles de l'art",
    'Pierrade Simple Et Colorée': 'Pierrade simple et colorée',
    'Recette Pita à La Norvégienne à La Truite Fumée': 'Pita à la norvégienne à la truite fumée',
    'Risotto Crémeux Aux Coquilles Saint-Jacques': 'Risotto crémeux aux coquilles Saint-Jacques',
    'Poisson Tomates Cerises, Thym': 'Poisson aux tomates cerises et thym',
    'Lasagne': 'Lasagnes',
  };

  return overrides[title];
}

function isUsefulIngredient(ingredient) {
  const text = ingredient.originalText.toLowerCase();
  return !/^(quantité d'ingrédients|\d+\s+portions?)$/.test(text);
}

function normalizeUnit(unit) {
  if (!unit) {
    return undefined;
  }

  const normalized = unit.toLowerCase();
  const unitMap = {
    el: 'c. à s.',
    tbsp: 'c. à s.',
    cs: 'c. à s.',
    tl: 'c. à c.',
    tsp: 'c. à c.',
    cc: 'c. à c.',
    pinch: 'pincée',
  };

  return unitMap[normalized] ?? unit;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
