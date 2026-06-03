import AddIcon from '@mui/icons-material/Add';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

interface AppProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

export function App({ mode, onToggleMode }: AppProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={{ xs: 2, md: 3 }}>
        <Box
          component="header"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            py: 1,
          }}
        >
          <Stack component={Link} to="/" direction="row" alignItems="center" spacing={1.25} color="inherit" sx={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'background.default',
              }}
            >
              <RestaurantMenuIcon />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ lineHeight: 1 }}>
                FeedMe
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recettes et idées de repas
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Tooltip title={mode === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}>
              <IconButton onClick={onToggleMode} color="inherit" aria-label="Changer le mode d'affichage">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Button component={Link} to="/import" variant="outlined" startIcon={<UploadFileIcon />}>
              Importer
            </Button>
            <Button component={Link} to="/recipes/new" variant="contained" startIcon={<AddIcon />}>
              Nouvelle recette
            </Button>
          </Stack>
        </Box>
        <Outlet />
      </Stack>
    </Container>
  );
}
