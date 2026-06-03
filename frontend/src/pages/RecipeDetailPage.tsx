import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecipe, getRecipe } from '../api/client';

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

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const recipeQuery = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => getRecipe(id ?? ''),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRecipe(id ?? ''),
    onSuccess: () => navigate('/'),
  });

  const recipe = recipeQuery.data;

  if (recipeQuery.isError) {
    return <Typography color="error">Impossible de charger la recette.</Typography>;
  }

  if (!recipe) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Title + actions */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} gap={2}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ lineHeight: 1.2, mb: 1.5 }}>
            {recipe.title}
          </Typography>
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            <Chip
              label={visibilityLabel(recipe.visibility)}
              size="small"
              sx={{ bgcolor: 'rgba(170,182,200,0.12)', color: 'text.secondary' }}
            />
            {recipe.tags.map((tag) => {
              const color = tagColor(tag.tag);
              return (
                <Chip
                  key={tag.id}
                  label={tag.tag}
                  size="small"
                  sx={{ bgcolor: color.bg, color: color.text }}
                />
              );
            })}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} flexShrink={0}>
          <Button
            component={Link}
            to={`/recipes/${recipe.id}/edit`}
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            sx={{ borderRadius: '10px' }}
          >
            Modifier
          </Button>
          <Button
            color="error"
            variant="outlined"
            size="small"
            onClick={() => setConfirmOpen(true)}
            startIcon={<DeleteOutlineIcon />}
            sx={{ borderRadius: '10px' }}
          >
            Supprimer
          </Button>
        </Stack>
      </Stack>

      {/* Hero image */}
      {recipe.imageUrl && (
        <Box
          component="img"
          src={recipe.imageUrl}
          alt=""
          sx={{
            width: '100%',
            maxHeight: 440,
            objectFit: 'cover',
            borderRadius: '16px',
            display: 'block',
          }}
        />
      )}

      {/* Content grid: ingredients + instructions */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Card sx={{ borderRadius: '16px' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Ingrédients
            </Typography>
            <Stack spacing={0.5} component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
              {recipe.ingredients.map((ingredient) => (
                <Box
                  component="li"
                  key={ingredient.id}
                  sx={{
                    py: 0.5,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
                    {ingredient.originalText ||
                      [ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(' ')}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '16px' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Préparation
            </Typography>
            <Typography
              whiteSpace="pre-wrap"
              color="text.secondary"
              variant="body2"
              lineHeight={1.8}
            >
              {recipe.instructions}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Notes + source */}
      {(recipe.notes || recipe.sourceUrl) && (
        <Card sx={{ borderRadius: '16px' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            {recipe.notes && (
              <>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
                  Notes
                </Typography>
                <Typography whiteSpace="pre-wrap" variant="body2" color="text.secondary" lineHeight={1.7}>
                  {recipe.notes}
                </Typography>
              </>
            )}
            {recipe.sourceUrl && (
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: recipe.notes ? 2 : 0 }}>
                <LinkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <Box
                    component="a"
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {recipe.sourceUrl}
                  </Box>
                </Typography>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle fontWeight={700}>Supprimer cette recette ?</DialogTitle>
        <DialogContent>
          <DialogContentText>« {recipe.title} » sera supprimée définitivement.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ borderRadius: '10px' }}>
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() => {
              setConfirmOpen(false);
              deleteMutation.mutate();
            }}
            sx={{ borderRadius: '10px' }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
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
