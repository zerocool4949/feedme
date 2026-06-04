import LockResetIcon from '@mui/icons-material/LockReset';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { changePassword } from '../api/client';

const fieldRadius = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

export function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const mutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setTimeout(() => {
        localStorage.removeItem('feedme-token');
        window.location.reload();
      }, 1500);
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setValidationError('');

    if (newPassword.length < 8) {
      setValidationError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    mutation.mutate();
  }

  const error = validationError || (mutation.error instanceof Error ? mutation.error.message : '');

  return (
    <Card sx={{ borderRadius: '20px', maxWidth: 560, mx: 'auto' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Typography variant="h5">Changer le mot de passe</Typography>
          <TextField
            required
            label="Mot de passe actuel"
            type="password"
            value={currentPassword}
            autoComplete="current-password"
            disabled={mutation.isSuccess}
            onChange={(event) => setCurrentPassword(event.target.value)}
            sx={fieldRadius}
          />
          <TextField
            required
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            autoComplete="new-password"
            disabled={mutation.isSuccess}
            onChange={(event) => setNewPassword(event.target.value)}
            sx={fieldRadius}
          />
          <TextField
            required
            label="Confirmer le nouveau mot de passe"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            disabled={mutation.isSuccess}
            onChange={(event) => setConfirmPassword(event.target.value)}
            sx={fieldRadius}
          />
          {mutation.isSuccess && (
            <Alert severity="success">
              Mot de passe modifié. Redirection vers la connexion…
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1.5}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<LockResetIcon />}
              disabled={mutation.isPending || mutation.isSuccess}
              size="large"
              sx={{ borderRadius: '12px', py: 1.5, flex: 1 }}
            >
              {mutation.isPending ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="large"
              disabled={mutation.isPending || mutation.isSuccess}
              sx={{ borderRadius: '12px', py: 1.5 }}
            >
              Annuler
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
