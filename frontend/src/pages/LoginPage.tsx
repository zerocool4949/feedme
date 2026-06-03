import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useState, FormEvent } from 'react';
import { login } from '../api/client';

interface LoginPageProps {
  onLogin: (token: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
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
      setError('Nom d\'utilisateur ou mot de passe incorrect.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 380 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <Typography variant="h4" textAlign="center" fontWeight={800}>
              FeedMe
            </Typography>
            <TextField
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <Button type="submit" variant="contained" disabled={pending} size="large">
              {pending ? 'Connexion…' : 'Se connecter'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
