import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SearchIcon from '@mui/icons-material/Search';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listRecipes, shuffleRecipes } from '../api/client';
import type { Recipe } from '../types/recipe';

const TAG_COLORS = [
  { bg: 'rgba(124,184,255,0.15)', text: '#7CB8FF' },
  { bg: 'rgba(125,211,167,0.15)', text: '#7DD3A7' },
  { bg: 'rgba(167,139,250,0.15)', text: '#A78BFA' },
  { bg: 'rgba(255,138,128,0.15)', text: '#FF8A80' },
];

function tagColor(tag: string) {
  const hash = [...tag].reduce((a, c) => a + c.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

function RecipeCard({ recipe, compact = false }: { recipe: Recipe; compact?: boolean }) {
  const navigate = useNavigate();

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
        <IconButton
          size="small"
          onClick={(e) => e.stopPropagation()}
          aria-label="Ajouter aux favoris"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(11,18,32,0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '5px',
            '&:hover': { bgcolor: 'rgba(11,18,32,0.85)' },
          }}
        >
          <FavoriteBorderIcon sx={{ fontSize: 15, color: '#FF8A80' }} />
        </IconButton>
      </Box>

      <CardContent sx={{ flex: 1, p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap title={recipe.title}>
          {recipe.title}
        </Typography>
        {recipe.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75 }}>
            {recipe.tags.slice(0, 3).map((tag) => {
              const color = tagColor(tag.tag);
              return (
                <Chip
                  key={tag.id}
                  label={tag.tag}
                  size="small"
                  sx={{
                    bgcolor: color.bg,
                    color: color.text,
                    height: 20,
                    fontSize: '0.65rem',
                    letterSpacing: '0.01em',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function RecipeListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [shuffleCount, setShuffleCount] = useState(1);
  const [shuffled, setShuffled] = useState<Recipe[]>([]);

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
                <RecipeCard key={recipe.id} recipe={recipe} compact />
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
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </Box>
      )}
    </Stack>
  );
}
