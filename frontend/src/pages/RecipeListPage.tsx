import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SearchIcon from '@mui/icons-material/Search';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hideRecipe, listRecipes, shuffleRecipes } from '../api/client';
import { getCurrentUserId } from '../auth/current-user';
import type { Recipe } from '../types/recipe';


function RecipeCard({
  recipe,
  compact = false,
  currentUserId,
  onHide,
  hidePending = false,
}: {
  recipe: Recipe;
  compact?: boolean;
  currentUserId: string | null;
  onHide?: (recipeId: string) => void;
  hidePending?: boolean;
}) {
  const navigate = useNavigate();
  const canHideRecipe = Boolean(
    onHide && recipe.ownerUserId !== currentUserId && ['shared', 'public'].includes(recipe.visibility),
  );

  return (
    <Card
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        {canHideRecipe && (
          <IconButton
            aria-label="Masquer la recette"
            title="Masquer la recette"
            disabled={hidePending}
            onClick={(event) => {
              event.stopPropagation();
              onHide?.(recipe.id);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: 'rgba(255,255,255,0.85)',
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.97)' },
            }}
          >
            <VisibilityOffIcon fontSize="small" />
          </IconButton>
        )}
        {recipe.imageUrl ? (
          <Box
            component="img"
            src={recipe.imageUrl}
            alt=""
            sx={{
              width: '100%',
              aspectRatio: compact ? '16/9' : '4/3',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              aspectRatio: compact ? '16/9' : '4/3',
              bgcolor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RestaurantMenuIcon sx={{ fontSize: 36, color: 'rgba(0,0,0,0.1)' }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flex: 1, p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap title={recipe.title}>
          {recipe.title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function RecipeListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [shuffleCount, setShuffleCount] = useState(1);
  const [shuffled, setShuffled] = useState<Recipe[]>([]);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const recipesQuery = useQuery({
    queryKey: ['recipes', debouncedSearch],
    queryFn: () => listRecipes(debouncedSearch),
  });

  const shuffleMutation = useMutation({
    mutationFn: shuffleRecipes,
    onSuccess: (results) => setShuffled(results),
  });

  const hideMutation = useMutation({
    mutationFn: hideRecipe,
    onSuccess: (_, recipeId) => {
      setShuffled((current) => current.filter((recipe) => recipe.id !== recipeId));
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  function handleShuffle(count: number) {
    setShuffleCount(count);
    shuffleMutation.mutate(count);
  }

  const recipes = recipesQuery.data ?? [];

  return (
    <Stack spacing={4}>
      {/* Search */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <TextField
          placeholder="Rechercher une recette, un ingrédient, un tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '100px',
              fontSize: '0.95rem',
              pl: 0.5,
            },
          }}
        />
        <Button
          component={Link}
          to="/recipes/hidden"
          variant="outlined"
          startIcon={<VisibilityOffIcon />}
          sx={{ borderRadius: '100px', flexShrink: 0 }}
        >
          Masquées
        </Button>
      </Stack>

      {/* Shuffle — visual centerpiece */}
      <Box
        sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #EEF3FF 0%, #E6EEFF 60%, #EBF2FF 100%)',
          border: '1px solid rgba(91,141,239,0.15)',
          p: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,141,239,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,141,239,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            gap={2}
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, lineHeight: 1.25 }}
              >
                <Box component="span" sx={{ fontSize: '1.3rem', lineHeight: 1 }}>
                  🍳
                </Box>
                Envie d'inspiration ce soir ?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Laisse FeedMe choisir pour toi ce soir.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap">
              {[1, 4, 7].map((count) => (
                <Button
                  key={count}
                  variant={shuffleCount === count && shuffled.length > 0 ? 'contained' : 'outlined'}
                  onClick={() => handleShuffle(count)}
                  disabled={shuffleMutation.isPending}
                  sx={{ minWidth: 52, fontWeight: 700, fontSize: '0.9rem' }}
                >
                  ×{count}
                </Button>
              ))}
              {shuffled.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => handleShuffle(shuffleCount)}
                  disabled={shuffleMutation.isPending}
                  startIcon={<ShuffleIcon />}
                >
                  Relancer
                </Button>
              )}
            </Stack>
          </Stack>

          {shuffleMutation.isPending && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {!shuffleMutation.isPending && shuffled.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                borderRadius: '12px',
                border: '1px dashed rgba(91,141,239,0.25)',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Clique sur ×1, ×4 ou ×7 pour découvrir des idées de recettes 🍽️
              </Typography>
            </Box>
          )}

          {!shuffleMutation.isPending && shuffled.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(170px, 1fr))' },
                gap: 2,
              }}
            >
              {shuffled.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  compact
                  currentUserId={currentUserId}
                  onHide={(recipeId) => hideMutation.mutate(recipeId)}
                  hidePending={hideMutation.isPending}
                />
              ))}
            </Box>
          )}

          {shuffleMutation.isError && (
            <Typography color="error" variant="body2">
              Impossible de tirer des recettes au hasard.
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Recipe grid */}
      {recipesQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : recipes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Aucune recette trouvée.</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(auto-fit, minmax(145px, 1fr))',
              lg: 'repeat(3, 1fr)',
            },
            gap: { xs: 1.5, sm: 2.5, md: 3 },
          }}
        >
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              currentUserId={currentUserId}
              onHide={(recipeId) => hideMutation.mutate(recipeId)}
              hidePending={hideMutation.isPending}
            />
          ))}
        </Box>
      )}
    </Stack>
  );
}
