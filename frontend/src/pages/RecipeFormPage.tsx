import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
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
  notes: '',
  instructions: '',
  visibility: 'private',
  ingredients: [{ name: '', quantity: '', unit: '', originalText: '' }],
  tags: [],
};

const fieldRadius = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeInput>(emptyRecipe);
  const [tagText, setTagText] = useState('');

  const recipeQuery = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => getRecipe(id ?? ''),
    enabled: Boolean(id),
  });

  const createMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: (saved) => navigate(`/recipes/${saved.id}`),
  });

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
      ingredients: current.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, ...patch } : ingredient,
      ),
    }));
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card sx={{ borderRadius: '20px' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Typography variant="h5">{id ? 'Modifier la recette' : 'Nouvelle recette'}</Typography>

          <TextField
            required
            label="Titre"
            value={recipe.title}
            onChange={(e) => updateField('title', e.target.value)}
            sx={fieldRadius}
          />
          <TextField
            required
            multiline
            minRows={5}
            label="Préparation"
            value={recipe.instructions}
            onChange={(e) => updateField('instructions', e.target.value)}
            sx={fieldRadius}
          />
          <TextField
            multiline
            minRows={3}
            label="Notes"
            value={recipe.notes ?? ''}
            onChange={(e) => updateField('notes', e.target.value)}
            sx={fieldRadius}
          />

          <FormControl sx={fieldRadius}>
            <InputLabel>Visibilité</InputLabel>
            <Select
              label="Visibilité"
              value={recipe.visibility}
              onChange={(e) => updateField('visibility', e.target.value as RecipeInput['visibility'])}
            >
              <MenuItem value="private">Privée</MenuItem>
              <MenuItem value="shared">Partagée</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="URL de l'image"
            value={recipe.imageUrl ?? ''}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            sx={fieldRadius}
          />
          <TextField
            label="URL source"
            value={recipe.sourceUrl ?? ''}
            onChange={(e) => updateField('sourceUrl', e.target.value)}
            sx={fieldRadius}
          />
          <TextField
            label="Tags, séparés par des virgules"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            sx={fieldRadius}
          />

          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Ingrédients
            </Typography>
            <Stack spacing={1.5}>
              {recipe.ingredients.map((ingredient, index) => (
                <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                  <TextField
                    required
                    label="Nom"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, { name: e.target.value })}
                    sx={{ ...fieldRadius, flex: 2 }}
                  />
                  <TextField
                    label="Quantité"
                    value={ingredient.quantity ?? ''}
                    onChange={(e) => updateIngredient(index, { quantity: e.target.value })}
                    sx={{ ...fieldRadius, flex: 1 }}
                  />
                  <TextField
                    label="Unité"
                    value={ingredient.unit ?? ''}
                    onChange={(e) => updateIngredient(index, { unit: e.target.value })}
                    sx={{ ...fieldRadius, flex: 1 }}
                  />
                  <Button
                    type="button"
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteOutlineIcon />}
                    disabled={recipe.ingredients.length === 1}
                    onClick={() => updateField('ingredients', recipe.ingredients.filter((_, i) => i !== index))}
                    sx={{ borderRadius: '10px', flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
                  >
                    Retirer
                  </Button>
                </Stack>
              ))}
            </Stack>
            <Button
              type="button"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                updateField('ingredients', [
                  ...recipe.ingredients,
                  { name: '', quantity: '', unit: '', originalText: '' },
                ])
              }
              sx={{ mt: 1.5, borderRadius: '10px', width: { xs: '100%', sm: 'auto' } }}
            >
              Ajouter un ingrédient
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isPending}
            size="large"
            sx={{ borderRadius: '12px', py: 1.5 }}
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer la recette'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
