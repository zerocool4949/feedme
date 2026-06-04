import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importRecipe } from '../api/client';

export function ImportPage() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const importMutation = useMutation({
    mutationFn: importRecipe,
    onSuccess: (draft) => {
      sessionStorage.setItem('recipeDraft', JSON.stringify(draft));
      navigate('/recipes/new');
    },
  });

  return (
    <Card sx={{ borderRadius: '20px' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          component="form"
          spacing={2}
          onSubmit={(event) => {
            event.preventDefault();
            if (url.trim() && !importMutation.isPending) {
              importMutation.mutate(url);
            }
          }}
        >
          <Typography variant="h5">Importer une recette</Typography>
          <Typography color="text.secondary">
            Colle l'URL d'une recette pour créer un brouillon modifiable avant de l'enregistrer.
          </Typography>
          <TextField
            label="URL de la recette"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            fullWidth
            type="url"
            autoComplete="url"
            inputMode="url"
          />
          {importMutation.isError ? <Alert severity="error">{importMutation.error.message}</Alert> : null}
          <Button
            type="submit"
            variant="contained"
            disabled={!url.trim() || importMutation.isPending}
            startIcon={<UploadFileIcon />}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, borderRadius: '12px' }}
          >
            {importMutation.isPending ? 'Import en cours...' : 'Créer un brouillon'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
