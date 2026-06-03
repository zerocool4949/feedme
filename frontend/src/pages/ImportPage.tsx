import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
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
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Import Recipe</Typography>
          <Typography color="text.secondary">
            The MVP includes the import endpoint and editable draft flow. Extraction logic is intentionally a skeleton.
          </Typography>
          <TextField label="Recipe URL" value={url} onChange={(event) => setUrl(event.target.value)} fullWidth />
          <Button variant="contained" onClick={() => importMutation.mutate(url)} disabled={!url.trim()}>
            Create Draft
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
