import { describe, expect, it } from 'vitest';
import { parseRecipeDraftFromHtml } from './recipe-import.service';

const sourceUrl = 'https://example.test/recipe';

describe('parseRecipeDraftFromHtml', () => {
  it('extracts a recipe from JSON-LD', () => {
    const draft = parseRecipeDraftFromHtml(
      `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Tomato Pasta",
              "image": { "url": "https://example.test/pasta.jpg" },
              "recipeIngredient": ["200 g pasta", "3 tomatoes"],
              "recipeInstructions": [
                { "@type": "HowToStep", "text": "Boil the pasta." },
                { "@type": "HowToStep", "text": "Add the tomatoes." }
              ],
              "keywords": "pasta, quick",
              "recipeCategory": "Dinner",
              "recipeCuisine": "Italian"
            }
          </script>
        </head>
      </html>
      `,
      sourceUrl,
    );

    expect(draft.title).toBe('Tomato Pasta');
    expect(draft.imageUrl).toBe('https://example.test/pasta.jpg');
    expect(draft.ingredients).toEqual([
      { name: '200 g pasta', originalText: '200 g pasta' },
      { name: '3 tomatoes', originalText: '3 tomatoes' },
    ]);
    expect(draft.instructions).toBe('1. Boil the pasta.\n2. Add the tomatoes.');
    expect(draft.tags).toEqual(['pasta', 'quick', 'Dinner', 'Italian']);
  });

  it('extracts a JSON-LD recipe from @graph', () => {
    const draft = parseRecipeDraftFromHtml(
      `
      <script type="application/ld+json">
        {
          "@graph": [
            { "@type": "WebPage", "name": "Page" },
            {
              "@type": ["Recipe", "Article"],
              "name": "Graph Soup",
              "recipeIngredient": ["1 onion"],
              "recipeInstructions": "Simmer until warm."
            }
          ]
        }
      </script>
      `,
      sourceUrl,
    );

    expect(draft.title).toBe('Graph Soup');
    expect(draft.ingredients).toEqual([{ name: '1 onion', originalText: '1 onion' }]);
    expect(draft.instructions).toBe('1. Simmer until warm.');
  });

  it('falls back to schema.org Recipe microdata', () => {
    const draft = parseRecipeDraftFromHtml(
      `
      <article itemscope itemtype="https://schema.org/Recipe">
        <h1 itemprop="name">Microdata Cake</h1>
        <img itemprop="image" src="https://example.test/cake.jpg" />
        <p itemprop="recipeIngredient">2 eggs</p>
        <p itemprop="recipeIngredient">100 g flour</p>
        <div itemprop="recipeInstructions">
          Mix the batter and bake for thirty minutes.
        </div>
        <span itemprop="keywords">dessert, baking</span>
        <span itemprop="recipeCategory">Cake</span>
      </article>
      `,
      sourceUrl,
    );

    expect(draft.title).toBe('Microdata Cake');
    expect(draft.imageUrl).toBe('https://example.test/cake.jpg');
    expect(draft.ingredients).toEqual([
      { name: '2 eggs', originalText: '2 eggs' },
      { name: '100 g flour', originalText: '100 g flour' },
    ]);
    expect(draft.instructions).toBe('1. Mix the batter and bake for thirty minutes.');
    expect(draft.tags).toEqual(['dessert', 'baking', 'Cake']);
  });

  it('falls back to OpenGraph metadata', () => {
    const draft = parseRecipeDraftFromHtml(
      `
      <html>
        <head>
          <meta property="og:title" content="OpenGraph Stew" />
          <meta property="og:description" content="A slow cooked stew draft." />
          <meta property="og:image" content="https://example.test/stew.jpg" />
          <meta property="article:tag" content="comfort" />
          <meta name="keywords" content="winter, beef" />
        </head>
      </html>
      `,
      sourceUrl,
    );

    expect(draft.title).toBe('OpenGraph Stew');
    expect(draft.notes).toBe('A slow cooked stew draft.');
    expect(draft.imageUrl).toBe('https://example.test/stew.jpg');
    expect(draft.ingredients).toEqual([]);
    expect(draft.instructions).toBe('');
    expect(draft.tags).toEqual(['comfort', 'winter', 'beef']);
  });

  it('falls back to visible HTML content', () => {
    const draft = parseRecipeDraftFromHtml(
      `
      <html>
        <head><title>Fallback Title</title></head>
        <body>
          <h1>Fallback Omelette</h1>
          <section>
            <h2>Ingredients</h2>
            <p>2 eggs</p>
            <p>1 pinch salt</p>
            <h2>Preparation</h2>
            <p>Beat the eggs with salt until the mixture is smooth.</p>
            <p>Cook gently in a warm pan until just set.</p>
            <p>Par portion:</p>
          </section>
        </body>
      </html>
      `,
      sourceUrl,
    );

    expect(draft.title).toBe('Fallback Omelette');
    expect(draft.ingredients).toEqual([
      { name: '2 eggs', originalText: '2 eggs' },
      { name: '1 pinch salt', originalText: '1 pinch salt' },
    ]);
    expect(draft.instructions).toBe('1. Beat the eggs with salt until the mixture is smooth.\n2. Cook gently in a warm pan until just set.');
  });

  it('handles accented French fallback headings', () => {
    const draft = parseRecipeDraftFromHtml(
      `
      <html>
        <body>
          <h1>Soupe rapide</h1>
          <h2>Ingrédients</h2>
          <p>1 oignon</p>
          <p>2 tomates</p>
          <h2>Préparation</h2>
          <p>Faire revenir les legumes pendant plusieurs minutes.</p>
          <p>Ajouter de l'eau et laisser mijoter doucement.</p>
          <p>Par portion:</p>
        </body>
      </html>
      `,
      sourceUrl,
    );

    expect(draft.ingredients).toEqual([
      { name: '1 oignon', originalText: '1 oignon' },
      { name: '2 tomates', originalText: '2 tomates' },
    ]);
    expect(draft.instructions).toBe(
      "1. Faire revenir les legumes pendant plusieurs minutes.\n2. Ajouter de l'eau et laisser mijoter doucement.",
    );
  });

  it('uses JSON-LD before lower-priority sources', () => {
    const draft = parseRecipeDraftFromHtml(
      `
      <html>
        <head>
          <meta property="og:title" content="OpenGraph Title" />
          <script type="application/ld+json">
            { "@type": "Recipe", "name": "JSON Title", "recipeIngredient": ["1 apple"] }
          </script>
        </head>
        <body>
          <article itemscope itemtype="https://schema.org/Recipe">
            <h1 itemprop="name">Microdata Title</h1>
          </article>
        </body>
      </html>
      `,
      sourceUrl,
    );

    expect(draft.title).toBe('JSON Title');
    expect(draft.ingredients).toEqual([{ name: '1 apple', originalText: '1 apple' }]);
  });

  it('returns an empty draft when nothing useful can be extracted', () => {
    const draft = parseRecipeDraftFromHtml('<html><body><div>No recipe here.</div></body></html>', sourceUrl);

    expect(draft).toEqual({
      title: '',
      notes: '',
      instructions: '',
      sourceUrl,
      imageUrl: '',
      ingredients: [],
      tags: [],
    });
  });
});
