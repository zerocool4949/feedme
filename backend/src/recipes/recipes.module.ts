import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipeImportService } from './recipe-import.service';
import { RecipesService } from './recipes.service';

@Module({
  controllers: [RecipesController],
  providers: [RecipesService, RecipeImportService],
})
export class RecipesModule {}
