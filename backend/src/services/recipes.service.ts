import { HTTPException } from 'hono/http-exception';
import { Prisma, RecipeVisibility } from '@prisma/client';
import { prisma } from '../db';
import { CreateRecipeDto, IngredientDto, UpdateRecipeDto } from '../schemas';
import { normalizeIngredientName, parseIngredientLine } from '../recipes/ingredient-normalizer';

const includeRecipeRelations = {
  ingredients: true,
  tags: true,
} satisfies Prisma.RecipeInclude;

interface RecipeScalarData {
  title?: string;
  notes?: string | null;
  instructions?: string;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  visibility?: RecipeVisibility;
}

export class RecipesService {
  async findAll(userId: string, search?: string) {
    const where: Prisma.RecipeWhereInput = {
      AND: [this.visibleToUserFilter(userId), ...(search ? [this.buildSearchFilter(search)] : [])],
    };

    return prisma.recipe.findMany({
      where,
      include: includeRecipeRelations,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const recipe = await prisma.recipe.findFirst({
      where: { AND: [{ id }, this.visibleToUserFilter(userId)] },
      include: includeRecipeRelations,
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recette introuvable' });
    }

    return recipe;
  }

  async create(userId: string, dto: CreateRecipeDto) {
    this.validateRecipePayload(dto.ingredients, dto.instructions);

    return prisma.recipe.create({
      data: {
        ...this.recipeData(dto),
        title: dto.title.trim(),
        instructions: dto.instructions.trim(),
        ownerUserId: userId,
        ingredients: { create: this.ingredientData(dto.ingredients) },
        tags: { create: this.tagData(dto.tags ?? []) },
      },
      include: includeRecipeRelations,
    });
  }

  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    await this.findOwned(userId, id);

    if (dto.ingredients || dto.instructions !== undefined) {
      this.validateRecipePayload(dto.ingredients, dto.instructions);
    }

    return prisma.$transaction(async (tx) => {
      if (dto.ingredients) {
        await tx.ingredient.deleteMany({ where: { recipeId: id } });
      }
      if (dto.tags) {
        await tx.recipeTag.deleteMany({ where: { recipeId: id } });
      }

      return tx.recipe.update({
        where: { id },
        data: {
          ...this.recipeData(dto),
          ...(dto.ingredients ? { ingredients: { create: this.ingredientData(dto.ingredients) } } : {}),
          ...(dto.tags ? { tags: { create: this.tagData(dto.tags) } } : {}),
        },
        include: includeRecipeRelations,
      });
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await prisma.recipe.delete({ where: { id } });
    return { deleted: true };
  }

  async shuffle(userId: string, count: number) {
    const safeCount = Number.isFinite(count) ? Math.min(Math.max(Math.trunc(count), 1), 7) : 1;
    const recipes = await prisma.recipe.findMany({
      where: this.visibleToUserFilter(userId),
      include: includeRecipeRelations,
    });

    return recipes.sort(() => Math.random() - 0.5).slice(0, safeCount);
  }

  private visibleToUserFilter(userId: string): Prisma.RecipeWhereInput {
    return {
      AND: [
        {
          OR: [
            { ownerUserId: userId },
            { visibility: RecipeVisibility.shared },
            { visibility: RecipeVisibility.public },
          ],
        },
        { hiddenBy: { none: { userId } } },
      ],
    };
  }

  async hide(userId: string, id: string) {
    const recipe = await prisma.recipe.findFirst({
      where: { AND: [{ id }, this.visibleToUserFilter(userId)] },
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recette introuvable' });
    }

    if (recipe.ownerUserId === userId) {
      throw new HTTPException(400, { message: 'Impossible de masquer votre propre recette' });
    }

    await prisma.hiddenRecipe.upsert({
      where: { userId_recipeId: { userId, recipeId: id } },
      create: { userId, recipeId: id },
      update: {},
    });

    return { hidden: true };
  }

  async findHidden(userId: string) {
    return prisma.recipe.findMany({
      where: {
        hiddenBy: { some: { userId } },
        OR: [{ visibility: RecipeVisibility.shared }, { visibility: RecipeVisibility.public }],
      },
      include: includeRecipeRelations,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async unhide(userId: string, id: string) {
    await prisma.hiddenRecipe.deleteMany({
      where: { userId, recipeId: id },
    });

    return { hidden: false };
  }

  private async findOwned(userId: string, id: string) {
    const recipe = await prisma.recipe.findFirst({
      where: { id, ownerUserId: userId },
      include: includeRecipeRelations,
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recette introuvable' });
    }

    return recipe;
  }

  private buildSearchFilter(search: string): Prisma.RecipeWhereInput {
    const query = search.trim();
    const normalizedQuery = normalizeIngredientName(query);

    return {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
        { tags: { some: { tag: { contains: query.toLowerCase(), mode: 'insensitive' } } } },
        { ingredients: { some: { name: { contains: query, mode: 'insensitive' } } } },
        { ingredients: { some: { normalizedName: { contains: normalizedQuery, mode: 'insensitive' } } } },
      ],
    };
  }

  private recipeData(dto: UpdateRecipeDto): RecipeScalarData {
    return {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.notes !== undefined ? { notes: emptyToNull(dto.notes) } : {}),
      ...(dto.instructions !== undefined ? { instructions: dto.instructions.trim() } : {}),
      ...(dto.sourceUrl !== undefined ? { sourceUrl: emptyToNull(dto.sourceUrl) } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: emptyToNull(dto.imageUrl) } : {}),
      ...(dto.visibility !== undefined ? { visibility: dto.visibility } : {}),
    };
  }

  private ingredientData(ingredients: IngredientDto[]) {
    return ingredients
      .filter((ingredient) => ingredient.name.trim().length > 0)
      .map((ingredient) => {
        const parsed = parseIngredientLine(ingredient.name);
        const name = ingredient.quantity || ingredient.unit ? ingredient.name.trim() : parsed.name;
        const quantity = ingredient.quantity ?? parsed.quantity;
        const unit = ingredient.unit ?? parsed.unit;
        const originalText = ingredient.originalText ?? ingredient.name;

        return {
          name,
          normalizedName: normalizeIngredientName(name),
          quantity: emptyToNull(quantity),
          unit: emptyToNull(unit),
          originalText: emptyToNull(originalText),
        };
      });
  }

  private tagData(tags: string[]) {
    return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].map((tag) => ({ tag }));
  }

  private validateRecipePayload(ingredients?: IngredientDto[], instructions?: string) {
    if (instructions !== undefined && instructions.trim().length === 0) {
      throw new HTTPException(400, { message: 'La préparation est obligatoire' });
    }

    if (ingredients !== undefined && this.ingredientData(ingredients).length === 0) {
      throw new HTTPException(400, { message: 'Au moins un ingrédient est obligatoire' });
    }
  }
}

function emptyToNull(value?: string): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const recipesService = new RecipesService();
