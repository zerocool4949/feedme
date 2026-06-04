import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './pages/App';
import { HiddenRecipesPage } from './pages/HiddenRecipesPage';
import { ImportPage } from './pages/ImportPage';
import { LoginPage } from './pages/LoginPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeFormPage } from './pages/RecipeFormPage';
import { RecipeListPage } from './pages/RecipeListPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootApp />,
    children: [
      { index: true, element: <RecipeListPage /> },
      { path: 'recipes/hidden', element: <HiddenRecipesPage /> },
      { path: 'recipes/new', element: <RecipeFormPage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'recipes/:id/edit', element: <RecipeFormPage /> },
      { path: 'import', element: <ImportPage /> },
    ],
  },
]);

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5B8DEF',
      contrastText: '#ffffff',
    },
    secondary: { main: '#8BB4F8' },
    error: { main: '#EF5350' },
    success: { main: '#4CAF50' },
    background: {
      default: '#FDFCF8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1C1E',
      secondary: '#6B7280',
    },
    divider: 'rgba(0,0,0,0.07)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['"Inter"', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 750, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.7 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#FDFCF8',
          minHeight: '100vh',
        },
        a: { color: 'inherit' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          border: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: '100px',
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 20px rgba(91,141,239,0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.72rem',
          border: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.15)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(91,141,239,0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5B8DEF',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          borderRadius: '20px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: '#1C1C1E',
          color: '#FFFFFF',
          borderRadius: '8px',
          fontSize: '0.75rem',
        },
      },
    },
  },
});

function RootApp() {
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem('feedme-token'));

  function handleLogin(t: string) {
    localStorage.setItem('feedme-token', t);
    setToken(t);
  }

  function handleLogout() {
    localStorage.removeItem('feedme-token');
    setToken(null);
  }

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App onLogout={handleLogout} />
    </ThemeProvider>
  );
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
