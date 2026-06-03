import CasinoIcon from '@mui/icons-material/Casino';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRecipes, shuffleRecipes } from '../api/client';
import type { Recipe } from '../types/recipe';

export function RecipeListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [shuffleCount, setShuffleCount] = useState(1);
  const [shuffled, setShuffled] = useState<Recipe[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const recipesQuery = useQuery({ queryKey: ['recipes', debouncedSearch], queryFn: () => listRecipes(debouncedSearch) });
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
      <Box>
        <TextField
          label="Rechercher une recette, une note, un tag ou un ingrédient"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="h6">Idées de repas au hasard</Typography>
              <Typography variant="body2" color="text.secondary">
                Laisse FeedMe choisir quand tu ne sais pas quoi cuisiner.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {[1, 4, 7].map((count) => (
                <Button
                  key={count}
                  variant={shuffleCount === count ? 'contained' : 'outlined'}
                  onClick={() => handleShuffle(count)}
                  startIcon={<CasinoIcon />}
                  disabled={shuffleMutation.isPending}
                >
                  Tirer {count}
                </Button>
              ))}
            </Stack>
          </Stack>
          {shuffleMutation.isError && <Typography color="error">Impossible de tirer des recettes au hasard.</Typography>}
          {shuffled.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(190px, 1fr))' }, gap: 1.5 }}>
              {shuffled.map((recipe) => (
                <Card key={recipe.id} variant="outlined" sx={{ height: '100%' }}>
                  <CardActionArea component={Link} to={`/recipes/${recipe.id}`} sx={{ height: '100%' }}>
                    {recipe.imageUrl ? (
                      <CardMedia component="img" image={recipe.imageUrl} alt="" sx={{ aspectRatio: '16 / 9', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ aspectRatio: '16 / 9', bgcolor: 'action.hover' }} />
                    )}
                    <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                      <Typography variant="subtitle1" fontWeight={700} title={recipe.title}>
                        {recipe.title}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          )}
        </Stack>
      </Box>

      {recipesQuery.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {recipes.map((recipe) => (
          <Card key={recipe.id} variant="outlined" sx={{ height: '100%' }}>
            <CardActionArea component={Link} to={`/recipes/${recipe.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              {recipe.imageUrl ? (
                <CardMedia component="img" image={recipe.imageUrl} alt="" sx={{ aspectRatio: '4 / 3', objectFit: 'cover' }} />
              ) : (
                <Box sx={{ aspectRatio: '4 / 3', bgcolor: 'action.hover' }} />
              )}
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom noWrap title={recipe.title}>
                  {recipe.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                >
                  {recipe.description || recipe.notes || ''}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
      {!recipesQuery.isLoading && recipes.length === 0 && <Typography>Aucune recette trouvée.</Typography>}
    </Stack>
  );
}

