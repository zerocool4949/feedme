import { Injectable } from '@nestjs/common';

@Injectable()
export class RecipeImportService {
  createDraft(url: string) {
    return {
      title: '',
      description: '',
      notes: 'Import extraction is not implemented yet. Review and complete this recipe manually.',
      instructions: '',
      sourceUrl: url,
      imageUrl: '',
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      servings: null,
      ingredients: [],
      tags: [],
    };
  }
}
