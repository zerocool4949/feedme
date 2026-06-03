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
import { useNavigate } from 'react-router-dom';
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
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-5px)',
          bgcolor: '#1A2D4A',
          borderColor: 'rgba(124,184,255,0.2)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
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
              bgcolor: 'rgba(10,16,28,0.78)',
              color: 'text.primary',
              '&:hover': { bgcolor: 'rgba(10,16,28,0.92)' },
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
              bgcolor: '#18253A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RestaurantMenuIcon sx={{ fontSize: 36, color: 'rgba(170,182,200,0.15)' }} />
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

      {/* Shuffle — visual centerpiece */}
      <Box
        sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #121C2E 0%, #162340 60%, #1C2E50 100%)',
          border: '1px solid rgba(124,184,255,0.12)',
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
            background: 'radial-gradient(circle, rgba(124,184,255,0.07) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(125,211,167,0.04) 0%, transparent 70%)',
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
              <CircularProgress size={28} sx={{ color: '#7CB8FF' }} />
            </Box>
          )}

          {!shuffleMutation.isPending && shuffled.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.08)',
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
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 2.5 },
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
