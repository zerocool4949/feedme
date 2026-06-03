import { PartialType } from '@nestjs/mapped-types';
import { RecipeDifficulty, RecipeStatus, RecipeVisibility } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class IngredientDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  originalText?: string;
}

export class CreateRecipeDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  instructions!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  prepTimeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cookTimeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(RecipeVisibility)
  visibility?: RecipeVisibility;

  @IsOptional()
  @IsEnum(RecipeStatus)
  status?: RecipeStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsEnum(RecipeDifficulty)
  difficulty?: RecipeDifficulty;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients!: IngredientDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}

export class ImportRecipeDto {
  @IsUrl()
  url!: string;
}
