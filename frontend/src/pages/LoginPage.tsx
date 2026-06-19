import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { login } from '../api/client';
import { LocaleToggleButton } from '../components/LocaleToggleButton';
import { useI18n } from '../i18n';

interface LoginPageProps {
  onLogin: (token: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const token = await login(username, password);
      onLogin(token);
    } catch {
      setError(t('login.error'));
    } finally {
      setPending(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(22,40,69,0.9) 0%, transparent 100%), #0B1220',
      }}
    >
      <LocaleToggleButton
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          color: '#FFFFFF',
          bgcolor: 'rgba(255,255,255,0.08)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
        }}
      />
      <Box sx={{ width: '100%', maxWidth: 380 }}>
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 5 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '18px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 40px rgba(124,184,255,0.3)',
            }}
          >
            <RestaurantMenuIcon sx={{ fontSize: 30, color: 'primary.contrastText' }} />
          </Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            FeedMe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('login.tagline')}
          </Typography>
        </Stack>

        <Card
          sx={{
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            bgcolor: 'rgba(18,28,46,0.85)',
          }}
        >
          <CardContent sx={{ p: 3.5 }}>
            <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
              <TextField
                label={t('login.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label={t('login.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={pending}
                size="large"
                fullWidth
                sx={{ py: 1.5, borderRadius: '12px', fontSize: '1rem', mt: 0.5 }}
              >
                {pending ? t('login.pending') : t('login.submit')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
