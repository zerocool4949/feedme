import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Chip, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listRecipes, shuffleRecipes } from '../api/client';
import type { Recipe } from '../types/recipe';

export function RecipeListPage() {
  const [search, setSearch] = useState('');
  const [shuffleCount, setShuffleCount] = useState(1);
  const [shuffled, setShuffled] = useState<Recipe[]>([]);
  const recipesQuery = useQuery({ queryKey: ['recipes', search], queryFn: () => listRecipes(search) });
  const shuffleMutation = useMutation({
    mutationFn: shuffleRecipes,
    onSuccess: (results) => setShuffled(results),
  });

  function handleShuffle(count: number) {
    setShuffleCount(count);
    shuffleMutation.mutate(count);
  }

  const recipes = recipesQuery.data ?? [];

  return (
    <Stack spacing={3}>
      <TextField
        label="Search recipes, notes, tags, ingredients"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        fullWidth
      />

      <Stack spacing={1}>
        <Typography variant="h6">Shuffle FeedMe Ideas</Typography>
        <Stack direction="row" spacing={1}>
          {[1, 4, 7].map((count) => (
            <Button key={count} variant={shuffleCount === count ? 'contained' : 'outlined'} onClick={() => handleShuffle(count)}>
              Shuffle {count}
            </Button>
          ))}
        </Stack>
        {shuffleMutation.isError && <Typography color="error">Failed to shuffle recipes.</Typography>}
        {shuffled.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(180px, 1fr))' }, gap: 1.5 }}>
            {shuffled.map((recipe) => (
              <Card key={recipe.id} variant="outlined">
                <CardActionArea component={Link} to={`/recipes/${recipe.id}`}>
                  {recipe.imageUrl ? (
                    <CardMedia component="img" image={recipe.imageUrl} alt="" sx={{ aspectRatio: '16 / 9', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ aspectRatio: '16 / 9', bgcolor: 'action.hover' }} />
                  )}
                  <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap title={recipe.title}>
                      {recipe.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {recipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6" component={Link} to={`/recipes/${recipe.id}`} color="inherit">
                  {recipe.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recipe.description || recipe.notes || 'No notes yet'}
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip size="small" label={recipe.visibility} />
                  {recipe.tags.map((tag) => (
                    <Chip key={tag.id} size="small" label={tag.tag} />
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
      {!recipesQuery.isLoading && recipes.length === 0 && <Typography>No recipes found.</Typography>}
    </Stack>
  );
}
