import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './pages/App';
import { ImportPage } from './pages/ImportPage';
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
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('feedme-color-mode') as 'light' | 'dark' | null) ?? 'dark';
  });
  const theme = React.useMemo(() => createFeedMeTheme(mode), [mode]);

  function toggleMode() {
    setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('feedme-color-mode', next);
      return next;
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App mode={mode} onToggleMode={toggleMode} />
    </ThemeProvider>
  );
}

function createFeedMeTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#7dd87d' : '#2f7d46' },
      secondary: { main: isDark ? '#f0b35a' : '#b56a15' },
      background: {
        default: isDark ? '#111815' : '#f5f3ec',
        paper: isDark ? '#18231f' : '#ffffff',
      },
      text: {
        primary: isDark ? '#eef5ec' : '#17211c',
        secondary: isDark ? '#a9b9ad' : '#5e6b62',
      },
      divider: isDark ? 'rgba(238, 245, 236, 0.12)' : 'rgba(23, 33, 28, 0.12)',
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
              ? 'linear-gradient(180deg, #111815 0%, #0f1512 100%)'
              : 'linear-gradient(180deg, #fbfaf6 0%, #f5f3ec 100%)',
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
            borderColor: isDark ? 'rgba(238, 245, 236, 0.12)' : 'rgba(23, 33, 28, 0.1)',
            boxShadow: isDark ? '0 18px 50px rgba(0, 0, 0, 0.22)' : '0 14px 35px rgba(47, 65, 53, 0.08)',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
