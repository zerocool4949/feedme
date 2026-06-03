import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './pages/App';
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
      primary: { main: isDark ? '#7aadee' : '#4a7ec7' },
      secondary: { main: isDark ? '#a3b8d8' : '#7a9dbf' },
      background: {
        default: isDark ? '#0f1726' : '#f4f7ff',
        paper: isDark ? '#162035' : '#ffffff',
      },
      text: {
        primary: isDark ? '#dde8f8' : '#1c2b4a',
        secondary: isDark ? '#7d99be' : '#556a8a',
      },
      divider: isDark ? 'rgba(221, 232, 248, 0.1)' : 'rgba(28, 43, 74, 0.1)',
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 800 },
      h5: { fontWeight: 750 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 700, textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? 'linear-gradient(180deg, #0f1726 0%, #0c1220 100%)'
              : 'linear-gradient(180deg, #f7f9ff 0%, #eef3ff 100%)',
            minHeight: '100vh',
          },
          a: {
            color: 'inherit',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(122, 173, 238, 0.15)' : 'rgba(74, 126, 199, 0.15)',
            boxShadow: isDark ? '0 18px 50px rgba(0, 0, 0, 0.3)' : '0 14px 35px rgba(74, 126, 199, 0.08)',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 650,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
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
