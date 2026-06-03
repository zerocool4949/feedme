import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecipe, getRecipe } from '../api/client';

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeQuery = useQuery({ queryKey: ['recipe', id], queryFn: () => getRecipe(id ?? ''), enabled: Boolean(id) });
  const deleteMutation = useMutation({
    mutationFn: () => deleteRecipe(id ?? ''),
    onSuccess: () => navigate('/'),
  });

  const recipe = recipeQuery.data;
  if (recipeQuery.isError) {
    return <Typography color="error">Impossible de charger la recette.</Typography>;
  }
  if (!recipe) {
    return <Typography>Chargement de la recette...</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="h4">{recipe.title}</Typography>
          {recipe.description && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {recipe.description}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to={`/recipes/${recipe.id}/edit`} variant="outlined" startIcon={<EditIcon />}>
            Modifier
          </Button>
          <Button color="error" variant="outlined" onClick={() => deleteMutation.mutate()} startIcon={<DeleteOutlineIcon />}>
            Supprimer
          </Button>
        </Stack>
      </Stack>

      {recipe.imageUrl && <img src={recipe.imageUrl} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 8 }} />}

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Chip label={visibilityLabel(recipe.visibility)} />
        {recipe.tags.map((tag) => (
          <Chip key={tag.id} label={tag.tag} />
        ))}
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ingrédients
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id}>{ingredient.originalText || [ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(' ')}</li>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Préparation
          </Typography>
          <Typography whiteSpace="pre-wrap">{recipe.instructions}</Typography>
        </CardContent>
      </Card>

      {recipe.notes && <Typography whiteSpace="pre-wrap">Notes : {recipe.notes}</Typography>}
      {recipe.sourceUrl && (
        <Typography>
          Source : <a href={recipe.sourceUrl}>{recipe.sourceUrl}</a>
        </Typography>
      )}
    </Stack>
  );
}

function visibilityLabel(visibility: 'private' | 'public' | 'shared'): string {
  switch (visibility) {
    case 'public':
      return 'Publique';
    case 'shared':
      return 'Partagée';
    case 'private':
    default:
      return 'Privée';
  }
}
