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

function RootApp() {
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem('feedme-token'));
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('feedme-color-mode') as 'light' | 'dark' | null) ?? 'dark';
  });
  const theme = React.useMemo(() => createFeedMeTheme(mode), [mode]);

  function handleLogin(t: string) {
    localStorage.setItem('feedme-token', t);
    setToken(t);
  }

  function handleLogout() {
    localStorage.removeItem('feedme-token');
    setToken(null);
  }

  function toggleMode() {
    setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('feedme-color-mode', next);
      return next;
    });
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
      <App mode={mode} onToggleMode={toggleMode} onLogout={handleLogout} />
    </ThemeProvider>
  );
}

function createFeedMeTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#7CB8FF' : '#4a7ec7',
        contrastText: isDark ? '#0B1220' : '#ffffff',
      },
      secondary: { main: isDark ? '#A6C8FF' : '#7a9dbf' },
      error: { main: '#FF8A80' },
      success: { main: '#7DD3A7' },
      background: {
        default: isDark ? '#0B1220' : '#f4f7ff',
        paper: isDark ? '#121C2E' : '#ffffff',
      },
      text: {
        primary: isDark ? '#F4F7FB' : '#1c2b4a',
        secondary: isDark ? '#AAB6C8' : '#556a8a',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(28,43,74,0.1)',
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: ['"Inter"', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 750, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark ? '#0B1220' : '#f4f7ff',
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
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(28,43,74,0.1)'}`,
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
              boxShadow: isDark ? '0 4px 20px rgba(124,184,255,0.25)' : '0 4px 16px rgba(74,126,199,0.3)',
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
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(28,43,74,0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(124,184,255,0.3)' : 'rgba(74,126,199,0.4)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#7CB8FF' : '#4a7ec7',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            background: isDark ? '#121C2E' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(28,43,74,0.1)'}`,
            borderRadius: '20px',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: isDark ? '#18253A' : '#1c2b4a',
            color: '#F4F7FB',
            borderRadius: '8px',
            fontSize: '0.75rem',
          },
        },
      },
    },
  });
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
