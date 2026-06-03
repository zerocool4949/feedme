import CasinoIcon from '@mui/icons-material/Casino';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material';
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
      <Box>
        <TextField
          label="Search recipes, notes, tags, ingredients"
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
              <Typography variant="h6">Shuffle FeedMe Ideas</Typography>
              <Typography variant="body2" color="text.secondary">
                Pick a few recipes when you do not want to decide.
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
              Shuffle {count}
            </Button>
          ))}
            </Stack>
          </Stack>
          {shuffleMutation.isError && <Typography color="error">Failed to shuffle recipes.</Typography>}
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {recipes.map((recipe) => (
          <Card key={recipe.id} variant="outlined">
            <CardActionArea component={Link} to={`/recipes/${recipe.id}`} sx={{ height: '100%' }}>
              <Stack direction="row" sx={{ minHeight: 132 }}>
                {recipe.imageUrl ? (
                  <CardMedia
                    component="img"
                    image={recipe.imageUrl}
                    alt=""
                    sx={{ width: { xs: 112, sm: 148 }, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <Box sx={{ width: { xs: 112, sm: 148 }, flexShrink: 0, bgcolor: 'action.hover' }} />
                )}
                <CardContent sx={{ minWidth: 0, flex: 1 }}>
                  <Stack spacing={1}>
                    <Typography variant="h6" color="inherit">
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
                </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Box>
      {!recipesQuery.isLoading && recipes.length === 0 && <Typography>No recipes found.</Typography>}
    </Stack>
  );
}
