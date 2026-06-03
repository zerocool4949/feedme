import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
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
  findAll(@CurrentUser() user: { sub: string }, @Query('search') search?: string) {
    return this.recipesService.findAll(user.sub, search);
  }

  @Get('shuffle')
  shuffle(@CurrentUser() user: { sub: string }, @Query('count') count?: string) {
    return this.recipesService.shuffle(user.sub, Number(count ?? 1));
  }

  @Post('import')
  importRecipe(@Body() dto: ImportRecipeDto) {
    return this.recipeImportService.createDraft(dto.url);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateRecipeDto) {
    return this.recipesService.create(user.sub, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.recipesService.findOne(user.sub, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() dto: UpdateRecipeDto) {
    return this.recipesService.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.recipesService.remove(user.sub, id);
  }
}
