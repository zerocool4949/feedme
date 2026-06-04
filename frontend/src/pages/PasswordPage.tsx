import LockResetIcon from '@mui/icons-material/LockReset';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { changePassword } from '../api/client';

const fieldRadius = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

export function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setPending(true);
    try {
      await changePassword(currentPassword, newPassword);
      localStorage.removeItem('feedme-token');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de modifier le mot de passe.');
    } finally {
      setPending(false);
    }
  }

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
            onChange={(event) => setCurrentPassword(event.target.value)}
            sx={fieldRadius}
          />
          <TextField
            required
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(event) => setNewPassword(event.target.value)}
            sx={fieldRadius}
          />
          <TextField
            required
            label="Confirmer le nouveau mot de passe"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(event) => setConfirmPassword(event.target.value)}
            sx={fieldRadius}
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Button
            type="submit"
            variant="contained"
            startIcon={<LockResetIcon />}
            disabled={pending}
            size="large"
            sx={{ borderRadius: '12px', py: 1.5 }}
          >
            {pending ? 'Modification...' : 'Modifier le mot de passe'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
