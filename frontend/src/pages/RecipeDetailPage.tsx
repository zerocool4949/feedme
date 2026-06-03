import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
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
    return <Typography color="error">Failed to load recipe.</Typography>;
  }
  if (!recipe) {
    return <Typography>Loading recipe...</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Typography variant="h4">{recipe.title}</Typography>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to={`/recipes/${recipe.id}/edit`} variant="outlined">
            Edit
          </Button>
          <Button color="error" variant="outlined" onClick={() => deleteMutation.mutate()}>
            Delete
          </Button>
        </Stack>
      </Stack>

      {recipe.imageUrl && <img src={recipe.imageUrl} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 8 }} />}

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Chip label={recipe.visibility} />
        {recipe.tags.map((tag) => (
          <Chip key={tag.id} label={tag.tag} />
        ))}
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="h6">Ingredients</Typography>
          <ul>
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id}>{ingredient.originalText || [ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(' ')}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Instructions</Typography>
          <Typography whiteSpace="pre-wrap">{recipe.instructions}</Typography>
        </CardContent>
      </Card>

      {recipe.notes && <Typography whiteSpace="pre-wrap">Notes: {recipe.notes}</Typography>}
      {recipe.sourceUrl && (
        <Typography>
          Source: <a href={recipe.sourceUrl}>{recipe.sourceUrl}</a>
        </Typography>
      )}
    </Stack>
  );
}
