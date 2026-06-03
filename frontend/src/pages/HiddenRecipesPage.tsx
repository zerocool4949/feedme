import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listHiddenRecipes, unhideRecipe } from '../api/client';

export function HiddenRecipesPage() {
  const queryClient = useQueryClient();
  const hiddenRecipesQuery = useQuery({
    queryKey: ['recipes', 'hidden'],
    queryFn: listHiddenRecipes,
  });

  const restoreMutation = useMutation({
    mutationFn: unhideRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const recipes = hiddenRecipesQuery.data ?? [];

  if (hiddenRecipesQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
            Recettes masquées
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Les recettes restaurées reviennent dans ta liste, la recherche et le shuffle.
          </Typography>
        </Box>
        <Button component={Link} to="/" variant="outlined" sx={{ borderRadius: '10px', alignSelf: 'flex-start' }}>
          Retour
        </Button>
      </Stack>

      {hiddenRecipesQuery.isError && (
        <Typography color="error">Impossible de charger les recettes masquées.</Typography>
      )}

      {!hiddenRecipesQuery.isError && recipes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Aucune recette masquée.</Typography>
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
            <Card key={recipe.id} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
              {recipe.imageUrl ? (
                <Box
                  component="img"
                  src={recipe.imageUrl}
                  alt=""
                  sx={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '4/3',
                    bgcolor: '#18253A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RestaurantMenuIcon sx={{ fontSize: 36, color: 'rgba(170,182,200,0.15)' }} />
                </Box>
              )}
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap title={recipe.title}>
                  {recipe.title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RestoreIcon />}
                    disabled={restoreMutation.isPending}
                    onClick={() => restoreMutation.mutate(recipe.id)}
                    sx={{ borderRadius: '10px' }}
                  >
                    Restaurer
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Stack>
  );
}
