import { HTTPException } from 'hono/http-exception';
import { IngredientDto } from '../schemas';

export interface RecipeDraft {
  title: string;
  notes: string;
  instructions: string;
  sourceUrl: string;
  imageUrl: string;
  ingredients: IngredientDto[];
  tags: string[];
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface RecipeJson {
  '@type'?: JsonValue;
  '@graph'?: JsonValue;
  name?: JsonValue;
  headline?: JsonValue;
  image?: JsonValue;
  recipeIngredient?: JsonValue;
  recipeInstructions?: JsonValue;
  keywords?: JsonValue;
  recipeCategory?: JsonValue;
  recipeCuisine?: JsonValue;
}

export class RecipeImportService {
  async createDraft(url: string): Promise<RecipeDraft> {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'FeedMe recipe importer',
      },
    });

    if (!response.ok) {
      throw new HTTPException(400, { message: `Impossible de récupérer l'URL de la recette (${response.status})` });
    }

    const html = await response.text();
    const jsonRecipe = findRecipeJson(html);
    const draft = jsonRecipe ? draftFromJson(jsonRecipe, url) : draftFromHtml(html, url);

    if (!draft.title && !draft.instructions && draft.ingredients.length === 0) {
      throw new HTTPException(400, { message: "Impossible d'extraire les détails de la recette depuis cette URL" });
    }

    return {
      ...draft,
      sourceUrl: url,
      notes: draft.notes || "Brouillon importé. Vérifie la recette avant de l'enregistrer.",
    };
  }
}

function draftFromJson(recipe: RecipeJson, url: string): RecipeDraft {
  const ingredients = toStringArray(recipe.recipeIngredient).map((ingredient) => ({
    name: ingredient,
    originalText: ingredient,
  }));

  return {
    title: firstString(recipe.name) || firstString(recipe.headline),
    notes: '',
    instructions: toInstructions(recipe.recipeInstructions),
    sourceUrl: url,
    imageUrl: firstImage(recipe.image),
    ingredients,
    tags: unique([
      ...toStringArray(recipe.keywords).flatMap((keyword) => keyword.split(',')),
      ...toStringArray(recipe.recipeCategory),
      ...toStringArray(recipe.recipeCuisine),
    ]),
  };
}

function draftFromHtml(html: string, url: string): RecipeDraft {
  const text = htmlToText(html);
  const title = extractTagText(html, 'h1') || metaContent(html, 'og:title') || extractTagText(html, 'title');
  const ingredientLines = linesBetween(text, 'Ingrédients', 'Préparation')
    .filter(isUsefulIngredientLine)
    .map((ingredient) => ({
      name: ingredient,
      originalText: ingredient,
    }));
  const instructionLines = extractInstructionLines(text);

  return {
    title,
    notes: '',
    instructions: instructionLines.join('\n'),
    sourceUrl: url,
    imageUrl: metaContent(html, 'og:image'),
    ingredients: ingredientLines,
    tags: [],
  };
}

function findRecipeJson(html: string): RecipeJson | null {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const script of scripts) {
    const content = decodeHtml(stripHtmlComments(script[1]).trim());
    const parsed = safeJsonParse(content);
    const recipe = findRecipeNode(parsed);

    if (recipe) {
      return recipe;
    }
  }

  return null;
}

function findRecipeNode(value: JsonValue | undefined): RecipeJson | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const recipe = findRecipeNode(item);
      if (recipe) return recipe;
    }
    return null;
  }

  if (typeof value !== 'object') return null;

  const object = value as RecipeJson;
  if (isRecipeType(object['@type'])) return object;

  return findRecipeNode(object['@graph']);
}

function isRecipeType(type: JsonValue | undefined): boolean {
  if (typeof type === 'string') return type.toLowerCase() === 'recipe';
  return Array.isArray(type) && type.some((item) => typeof item === 'string' && item.toLowerCase() === 'recipe');
}

function safeJsonParse(value: string): JsonValue | undefined {
  try {
    return JSON.parse(value) as JsonValue;
  } catch {
    return undefined;
  }
}

function toInstructions(value: JsonValue | undefined): string {
  return toStringArray(value)
    .map((step) => step.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n');
}

function toStringArray(value: JsonValue | undefined): string[] {
  if (!value) return [];
  if (typeof value === 'string' || typeof value === 'number') return [String(value).trim()].filter(Boolean);
  if (Array.isArray(value)) return value.flatMap(toStringArray);

  if (typeof value === 'object') {
    const object = value as { text?: JsonValue; name?: JsonValue; itemListElement?: JsonValue };
    return [...toStringArray(object.text), ...toStringArray(object.name), ...toStringArray(object.itemListElement)];
  }

  return [];
}

function firstString(value: JsonValue | undefined): string {
  return toStringArray(value)[0] ?? '';
}

function firstImage(value: JsonValue | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return firstImage(value[0]);

  if (typeof value === 'object') {
    const object = value as { url?: JsonValue; contentUrl?: JsonValue };
    return firstString(object.url) || firstString(object.contentUrl);
  }

  return '';
}

function htmlToText(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<(br|p|div|li|h[1-6]|tr|section|article|ul|ol)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim(),
  );
}

function extractTagText(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeHtml(match[1].replace(/<[^>]+>/g, ' ')).trim() : '';
}

function metaContent(html: string, name: string): string {
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escapeRegExp(name)}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escapeRegExp(name)}["'][^>]*>`,
    'i',
  );
  const match = html.match(pattern);
  return decodeHtml((match?.[1] ?? match?.[2] ?? '').trim());
}

function linesBetween(text: string, start: string, end: string): string[] {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) return [];

  const endIndex = text.indexOf(end, startIndex + start.length);
  const section = text.slice(startIndex + start.length, endIndex === -1 ? undefined : endIndex);

  return section.split('\n').map((line) => line.trim()).filter(Boolean);
}

function extractInstructionLines(text: string): string[] {
  const preparationSection = linesBetween(text, "Changer d'affichage", 'Par portion:');
  const lines = preparationSection.length ? preparationSection : linesBetween(text, 'Préparation', 'Par portion:');

  return lines
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line.length > 20)
    .map((line, index) => `${index + 1}. ${line}`);
}

function isUsefulIngredientLine(line: string): boolean {
  if (/^\d+\s+portions?$/i.test(line)) return false;
  if (/^(quantité ingrédients|afficher la recette|cuisinez en écoutant|compote de pommes:?|viande hachée:?)$/i.test(line)) return false;
  return line.length > 2;
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function stripHtmlComments(value: string): string {
  return value.replace(/<!--|-->/g, '');
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const recipeImportService = new RecipeImportService();
