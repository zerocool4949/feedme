import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
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
type CheerioApi = ReturnType<typeof cheerio.load>;

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
    const draft = parseRecipeDraftFromHtml(html, url);

    if (!isUsefulDraft(draft)) {
      throw new HTTPException(400, { message: "Impossible d'extraire les détails de la recette depuis cette URL" });
    }

    return {
      ...draft,
      sourceUrl: url,
      notes: draft.notes || "Brouillon importé. Vérifie la recette avant de l'enregistrer.",
    };
  }
}

export function parseRecipeDraftFromHtml(html: string, url: string): RecipeDraft {
  const $ = cheerio.load(html);
  const jsonRecipe = findRecipeJson(html);
  const drafts = [
    jsonRecipe ? draftFromJson(jsonRecipe, url) : null,
    draftFromSchemaOrg($, url),
    draftFromOpenGraph($, url),
    draftFromHtml($, html, url),
  ];

  return drafts.find((draft) => draft && isUsefulDraft(draft)) ?? emptyDraft(url);
}

function draftFromJson(recipe: RecipeJson, url: string): RecipeDraft {
  const ingredients = toStringArray(recipe.recipeIngredient).map((ingredient) => ({
    name: ingredient,
    originalText: ingredient,
  }));

  return {
    title: firstString(recipe.name) || firstString(recipe.headline),
    notes: '',
    instructions: toInstructions(toStringArray(recipe.recipeInstructions)),
    sourceUrl: url,
    imageUrl: firstImage(recipe.image),
    ingredients,
    tags: unique([
      ...toStringArray(recipe.keywords).flatMap(splitCommaValues),
      ...toStringArray(recipe.recipeCategory),
      ...toStringArray(recipe.recipeCuisine),
    ]),
  };
}

function draftFromSchemaOrg($: CheerioApi, url: string): RecipeDraft | null {
  const recipe = $('[itemtype*="schema.org/Recipe"], [typeof*="Recipe"]').first();
  if (!recipe.length) return null;

  const propText = (name: string) =>
    unique(
      recipe
        .find(`[itemprop="${name}"], [property="${name}"]`)
        .map((_, element) => propertyValue($, element))
        .get(),
    );

  const ingredients = propText('recipeIngredient').map((ingredient) => ({
    name: ingredient,
    originalText: ingredient,
  }));

  return {
    title: propText('name')[0] ?? propText('headline')[0] ?? '',
    notes: '',
    instructions: toInstructions(propText('recipeInstructions')),
    sourceUrl: url,
    imageUrl: propText('image')[0] ?? '',
    ingredients,
    tags: unique([...propText('keywords').flatMap(splitCommaValues), ...propText('recipeCategory'), ...propText('recipeCuisine')]),
  };
}

function draftFromOpenGraph($: CheerioApi, url: string): RecipeDraft | null {
  const title = metaContent($, 'og:title') || metaContent($, 'twitter:title');
  const notes = metaContent($, 'og:description') || metaContent($, 'description') || metaContent($, 'twitter:description');
  const imageUrl = metaContent($, 'og:image') || metaContent($, 'twitter:image');
  const tags = unique([
    ...allMetaContent($, 'article:tag'),
    ...splitCommaValues(metaContent($, 'keywords') || metaContent($, 'news_keywords')),
  ]);

  if (!title && !notes && !imageUrl && tags.length === 0) return null;

  return {
    title,
    notes,
    instructions: '',
    sourceUrl: url,
    imageUrl,
    ingredients: [],
    tags,
  };
}

function draftFromHtml($: CheerioApi, html: string, url: string): RecipeDraft {
  const text = htmlToText(html);
  const title = cleanText($('h1').first().text()) || metaContent($, 'og:title') || cleanText($('title').first().text());
  const ingredientLines = linesBetweenHeading(text, 'ingredients', 'preparation')
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
    imageUrl: metaContent($, 'og:image'),
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

function toInstructions(values: string[]): string {
  return values
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

function metaContent($: CheerioApi, name: string): string {
  return allMetaContent($, name)[0] ?? '';
}

function allMetaContent($: CheerioApi, name: string): string[] {
  return unique(
    $(`meta[name="${name}"], meta[property="${name}"]`)
      .map((_, element) => cleanText($(element).attr('content') ?? ''))
      .get(),
  );
}

function linesBetween(text: string, start: string, end: string): string[] {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) return [];

  const endIndex = text.indexOf(end, startIndex + start.length);
  const section = text.slice(startIndex + start.length, endIndex === -1 ? undefined : endIndex);

  return section.split('\n').map((line) => line.trim()).filter(Boolean);
}

function linesBetweenHeading(text: string, start: string, end: string): string[] {
  const lines = text.split('\n').map((line) => line.trim());
  const startIndex = lines.findIndex((line) => foldText(line).includes(start));
  if (startIndex === -1) return [];

  const endIndex = lines.findIndex((line, index) => index > startIndex && foldText(line).includes(end));
  return lines.slice(startIndex + 1, endIndex === -1 ? undefined : endIndex).filter(Boolean);
}

function extractInstructionLines(text: string): string[] {
  const preparationSection = linesBetween(text, "Changer d'affichage", 'Par portion:');
  const lines = preparationSection.length ? preparationSection : linesBetweenHeading(text, 'preparation', 'par portion:');

  return lines
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line.length > 20)
    .map((line, index) => `${index + 1}. ${line}`);
}

function isUsefulIngredientLine(line: string): boolean {
  const foldedLine = foldText(line);
  if (/^\d+\s+portions?$/i.test(line)) return false;
  if (/^(quantite ingredients|afficher la recette|cuisinez en ecoutant|compote de pommes:?|viande hachee:?)$/i.test(foldedLine)) return false;
  return line.length > 2;
}

function unique(values: string[]): string[] {
  return [...new Set(values.map(cleanText).filter(Boolean))];
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

function propertyValue($: CheerioApi, element: Element): string {
  const node = $(element);
  const value = node.attr('content') ?? node.attr('src') ?? node.attr('href') ?? node.attr('datetime') ?? node.text();
  return cleanText(value);
}

function splitCommaValues(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function foldText(value: string): string {
  return cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isUsefulDraft(draft: RecipeDraft): boolean {
  return Boolean(draft.title || draft.instructions || draft.ingredients.length > 0);
}

function emptyDraft(url: string): RecipeDraft {
  return {
    title: '',
    notes: '',
    instructions: '',
    sourceUrl: url,
    imageUrl: '',
    ingredients: [],
    tags: [],
  };
}

export const recipeImportService = new RecipeImportService();
