import AddIcon from '@mui/icons-material/Add';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

interface AppProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  onLogout: () => void;
}

export function App({ mode, onToggleMode, onLogout }: AppProps) {
  const isDark = mode === 'dark';

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          bgcolor: isDark ? 'rgba(11,18,32,0.85)' : 'rgba(244,247,255,0.85)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 60,
              gap: 2,
            }}
          >
            <Stack
              component={Link}
              to="/"
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RestaurantMenuIcon sx={{ fontSize: 18, color: 'primary.contrastText' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em" sx={{ lineHeight: 1 }}>
                FeedMe
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title={isDark ? 'Mode clair' : 'Mode sombre'}>
                <IconButton
                  onClick={onToggleMode}
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                >
                  {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Button
                component={Link}
                to="/import"
                variant="outlined"
                size="small"
                startIcon={<UploadFileIcon />}
                sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '10px' }}
              >
                Importer
              </Button>
              <Button
                component={Link}
                to="/recipes/new"
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                sx={{ borderRadius: '10px' }}
              >
                Nouvelle
              </Button>
              <Tooltip title="Se déconnecter">
                <IconButton
                  onClick={onLogout}
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
