import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

export function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box
          component="header"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="h4" component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
            FeedMe
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/import" variant="outlined">
              Import
            </Button>
            <Button component={Link} to="/recipes/new" variant="contained">
              New Recipe
            </Button>
          </Stack>
        </Box>
        <Outlet />
      </Stack>
    </Container>
  );
}
