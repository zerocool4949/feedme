import LockResetIcon from '@mui/icons-material/LockReset';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { changePassword } from '../api/client';
import { useI18n } from '../i18n';

const fieldRadius = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

export function PasswordPage() {
  const { t } = useI18n();
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
      setValidationError(t('password.tooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(t('password.mismatch'));
      return;
    }

    mutation.mutate();
  }

  const error = validationError || (mutation.error instanceof Error ? mutation.error.message : '');

  return (
    <Card sx={{ borderRadius: '20px', maxWidth: 560, mx: 'auto' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Typography variant="h5">{t('password.title')}</Typography>
          <TextField
            required
            label={t('password.current')}
            type="password"
            value={currentPassword}
            autoComplete="current-password"
            disabled={mutation.isSuccess}
            onChange={(event) => setCurrentPassword(event.target.value)}
            sx={fieldRadius}
          />
          <TextField
            required
            label={t('password.new')}
            type="password"
            value={newPassword}
            autoComplete="new-password"
            disabled={mutation.isSuccess}
            onChange={(event) => setNewPassword(event.target.value)}
            sx={fieldRadius}
          />
          <TextField
            required
            label={t('password.confirm')}
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            disabled={mutation.isSuccess}
            onChange={(event) => setConfirmPassword(event.target.value)}
            sx={fieldRadius}
          />
          {mutation.isSuccess && (
            <Alert severity="success">
              {t('password.success')}
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
              {mutation.isPending ? t('password.pending') : t('password.submit')}
            </Button>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="large"
              disabled={mutation.isPending || mutation.isSuccess}
              sx={{ borderRadius: '12px', py: 1.5 }}
            >
              {t('common.cancel')}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
