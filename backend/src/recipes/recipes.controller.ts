import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateRecipeDto, ImportRecipeDto, UpdateRecipeDto } from './dto';
import { RecipeImportService } from './recipe-import.service';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly recipeImportService: RecipeImportService,
  ) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.recipesService.findAll(search);
  }

  @Get('shuffle')
  shuffle(@Query('count') count?: string) {
    return this.recipesService.shuffle(Number(count ?? 1));
  }

  @Post('import')
  importRecipe(@Body() dto: ImportRecipeDto) {
    return this.recipeImportService.createDraft(dto.url);
  }

  @Post()
  create(@Body() dto: CreateRecipeDto) {
    return this.recipesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRecipeDto) {
    return this.recipesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
  }
}
