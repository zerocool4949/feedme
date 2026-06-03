import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
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
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <Typography variant="h5">{id ? 'Modifier la recette' : 'Nouvelle recette'}</Typography>
          <TextField required label="Titre" value={recipe.title} onChange={(event) => updateField('title', event.target.value)} />
          <TextField label="Description" value={recipe.description ?? ''} onChange={(event) => updateField('description', event.target.value)} />
          <TextField required multiline minRows={5} label="Préparation" value={recipe.instructions} onChange={(event) => updateField('instructions', event.target.value)} />
          <TextField multiline minRows={3} label="Notes" value={recipe.notes ?? ''} onChange={(event) => updateField('notes', event.target.value)} />

          <FormControl>
            <InputLabel>Visibilité</InputLabel>
            <Select label="Visibilité" value={recipe.visibility} onChange={(event) => updateField('visibility', event.target.value as RecipeInput['visibility'])}>
              <MenuItem value="private">Privée</MenuItem>
              <MenuItem value="public">Publique</MenuItem>
              <MenuItem value="shared">Partagée</MenuItem>
            </Select>
          </FormControl>

          <TextField label="URL de l'image" value={recipe.imageUrl ?? ''} onChange={(event) => updateField('imageUrl', event.target.value)} />
          <TextField label="URL source" value={recipe.sourceUrl ?? ''} onChange={(event) => updateField('sourceUrl', event.target.value)} />
          <TextField label="Tags, séparés par des virgules" value={tagText} onChange={(event) => setTagText(event.target.value)} />

          <Typography variant="h6">Ingrédients</Typography>
          {recipe.ingredients.map((ingredient, index) => (
            <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
              <TextField required label="Nom" value={ingredient.name} onChange={(event) => updateIngredient(index, { name: event.target.value })} />
              <TextField label="Quantité" value={ingredient.quantity ?? ''} onChange={(event) => updateIngredient(index, { quantity: event.target.value })} />
              <TextField label="Unité" value={ingredient.unit ?? ''} onChange={(event) => updateIngredient(index, { unit: event.target.value })} />
              <TextField label="Texte original" value={ingredient.originalText ?? ''} onChange={(event) => updateIngredient(index, { originalText: event.target.value })} />
              <Button
                type="button"
                color="error"
                variant="outlined"
                startIcon={<DeleteOutlineIcon />}
                disabled={recipe.ingredients.length === 1}
                onClick={() => updateField('ingredients', recipe.ingredients.filter((_, i) => i !== index))}
              >
                Supprimer
              </Button>
            </Stack>
          ))}
          <Button
            type="button"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => updateField('ingredients', [...recipe.ingredients, { name: '', quantity: '', unit: '', originalText: '' }])}
          >
            Ajouter un ingrédient
          </Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={createMutation.isPending || updateMutation.isPending}>
            Enregistrer la recette
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
