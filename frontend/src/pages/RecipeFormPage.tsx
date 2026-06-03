import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipe, getRecipe, updateRecipe } from '../api/client';
import type { IngredientInput, RecipeInput } from '../types/recipe';

const emptyRecipe: RecipeInput = {
  title: '',
  description: '',
  notes: '',
  instructions: '',
  visibility: 'private',
  ingredients: [{ name: '', quantity: '', unit: '', originalText: '' }],
  tags: [],
};

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeInput>(emptyRecipe);
  const [tagText, setTagText] = useState('');
  const recipeQuery = useQuery({ queryKey: ['recipe', id], queryFn: () => getRecipe(id ?? ''), enabled: Boolean(id) });
  const createMutation = useMutation({ mutationFn: createRecipe, onSuccess: (saved) => navigate(`/recipes/${saved.id}`) });
  const updateMutation = useMutation({
    mutationFn: (input: RecipeInput) => updateRecipe(id ?? '', input),
    onSuccess: (saved) => navigate(`/recipes/${saved.id}`),
  });

  useEffect(() => {
    const draft = sessionStorage.getItem('recipeDraft');
    if (!id && draft) {
      setRecipe({ ...emptyRecipe, ...JSON.parse(draft) });
      sessionStorage.removeItem('recipeDraft');
    }
  }, [id]);

  useEffect(() => {
    if (recipeQuery.data) {
      setRecipe({
        title: recipeQuery.data.title,
        description: recipeQuery.data.description ?? '',
        notes: recipeQuery.data.notes ?? '',
        instructions: recipeQuery.data.instructions,
        sourceUrl: recipeQuery.data.sourceUrl ?? '',
        imageUrl: recipeQuery.data.imageUrl ?? '',
        visibility: recipeQuery.data.visibility,
        ingredients: recipeQuery.data.ingredients.map((ingredient) => ({
          name: ingredient.name,
          quantity: ingredient.quantity ?? '',
          unit: ingredient.unit ?? '',
          originalText: ingredient.originalText ?? '',
        })),
        tags: recipeQuery.data.tags.map((tag) => tag.tag),
      });
      setTagText(recipeQuery.data.tags.map((tag) => tag.tag).join(', '));
    }
  }, [recipeQuery.data]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input = { ...recipe, tags: tagText.split(',').map((tag) => tag.trim()) };
    if (id) {
      updateMutation.mutate(input);
    } else {
      createMutation.mutate(input);
    }
  }

  function updateField<K extends keyof RecipeInput>(key: K, value: RecipeInput[K]) {
    setRecipe((current) => ({ ...current, [key]: value }));
  }

  function updateIngredient(index: number, patch: Partial<IngredientInput>) {
    setRecipe((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, ...patch } : ingredient,
      ),
    }));
  }

  return (
    <Card>
      <CardContent>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <Typography variant="h5">{id ? 'Edit Recipe' : 'New Recipe'}</Typography>
          <TextField required label="Title" value={recipe.title} onChange={(event) => updateField('title', event.target.value)} />
          <TextField label="Description" value={recipe.description ?? ''} onChange={(event) => updateField('description', event.target.value)} />
          <TextField required multiline minRows={5} label="Instructions" value={recipe.instructions} onChange={(event) => updateField('instructions', event.target.value)} />
          <TextField multiline minRows={3} label="Notes" value={recipe.notes ?? ''} onChange={(event) => updateField('notes', event.target.value)} />

          <FormControl>
            <InputLabel>Visibility</InputLabel>
            <Select label="Visibility" value={recipe.visibility} onChange={(event) => updateField('visibility', event.target.value as RecipeInput['visibility'])}>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="shared">Shared</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Image URL" value={recipe.imageUrl ?? ''} onChange={(event) => updateField('imageUrl', event.target.value)} />
          <TextField label="Source URL" value={recipe.sourceUrl ?? ''} onChange={(event) => updateField('sourceUrl', event.target.value)} />
          <TextField label="Tags, comma separated" value={tagText} onChange={(event) => setTagText(event.target.value)} />

          <Typography variant="h6">Ingredients</Typography>
          {recipe.ingredients.map((ingredient, index) => (
            <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
              <TextField required label="Name" value={ingredient.name} onChange={(event) => updateIngredient(index, { name: event.target.value })} />
              <TextField label="Quantity" value={ingredient.quantity ?? ''} onChange={(event) => updateIngredient(index, { quantity: event.target.value })} />
              <TextField label="Unit" value={ingredient.unit ?? ''} onChange={(event) => updateIngredient(index, { unit: event.target.value })} />
              <TextField label="Original text" value={ingredient.originalText ?? ''} onChange={(event) => updateIngredient(index, { originalText: event.target.value })} />
              <Button
                type="button"
                color="error"
                disabled={recipe.ingredients.length === 1}
                onClick={() => updateField('ingredients', recipe.ingredients.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </Stack>
          ))}
          <Button
            type="button"
            variant="outlined"
            onClick={() => updateField('ingredients', [...recipe.ingredients, { name: '', quantity: '', unit: '', originalText: '' }])}
          >
            Add Ingredient
          </Button>
          <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
            Save Recipe
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
