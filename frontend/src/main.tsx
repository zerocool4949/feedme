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
    element: <App />,
    children: [
      { index: true, element: <RecipeListPage /> },
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
    primary: { main: '#2e7d32' },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
