import React from 'react';

export type Locale = 'fr' | 'en';

const localeStorageKey = 'feedme-locale';

const fr = {
  'app.changePassword': 'Changer le mot de passe',
  'app.import': 'Importer',
  'app.newRecipe': 'Nouvelle',
  'app.logout': 'Se déconnecter',
  'app.language': 'Changer de langue',
  'common.cancel': 'Annuler',
  'common.back': 'Retour',
  'common.private': 'Privée',
  'common.shared': 'Partagée',
  'common.language.fr': 'Français',
  'common.language.en': 'Anglais',
  'list.hideRecipe': 'Masquer la recette',
  'list.searchPlaceholder': 'Rechercher une recette, un ingrédient, un tag...',
  'list.hidden': 'Masquées',
  'list.shuffleTitle': "Envie d'inspiration ce soir ?",
  'list.shuffleSubtitle': 'Laisse FeedMe choisir pour toi ce soir.',
  'list.shuffleEmpty': 'Clique sur x1, x4 ou x7 pour découvrir des idées de recettes',
  'list.shuffleAgain': 'Relancer',
  'list.shuffleError': 'Impossible de tirer des recettes au hasard.',
  'list.empty': 'Aucune recette trouvée.',
  'detail.loadError': 'Impossible de charger la recette.',
  'detail.edit': 'Modifier',
  'detail.delete': 'Supprimer',
  'detail.hide': 'Masquer',
  'detail.ingredients': 'Ingrédients',
  'detail.instructions': 'Préparation',
  'detail.notes': 'Notes',
  'detail.deleteTitle': 'Supprimer cette recette ?',
  'detail.deleteMessage': '"{{title}}" sera supprimée définitivement.',
  'form.editTitle': 'Modifier la recette',
  'form.newTitle': 'Nouvelle recette',
  'form.title': 'Titre',
  'form.instructions': 'Préparation',
  'form.notes': 'Notes',
  'form.visibility': 'Visibilité',
  'form.language': 'Langue de la recette',
  'form.imageUrl': "URL de l'image",
  'form.sourceUrl': 'URL source',
  'form.tags': 'Tags, séparés par des virgules',
  'form.ingredients': 'Ingrédients',
  'form.ingredientName': 'Nom',
  'form.quantity': 'Quantité',
  'form.unit': 'Unité',
  'form.remove': 'Retirer',
  'form.addIngredient': 'Ajouter un ingrédient',
  'form.saving': 'Enregistrement...',
  'form.save': 'Enregistrer la recette',
  'import.title': 'Importer une recette',
  'import.description': "Colle l'URL d'une recette pour créer un brouillon modifiable avant de l'enregistrer.",
  'import.url': 'URL de la recette',
  'import.pending': 'Import en cours...',
  'import.createDraft': 'Créer un brouillon',
  'login.tagline': 'Bonne cuisine ce soir',
  'login.username': "Nom d'utilisateur",
  'login.password': 'Mot de passe',
  'login.error': "Nom d'utilisateur ou mot de passe incorrect.",
  'login.pending': 'Connexion...',
  'login.submit': 'Se connecter',
  'password.title': 'Changer le mot de passe',
  'password.current': 'Mot de passe actuel',
  'password.new': 'Nouveau mot de passe',
  'password.confirm': 'Confirmer le nouveau mot de passe',
  'password.tooShort': 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
  'password.mismatch': 'Les deux nouveaux mots de passe ne correspondent pas.',
  'password.success': 'Mot de passe modifié. Redirection vers la connexion...',
  'password.pending': 'Modification...',
  'password.submit': 'Modifier le mot de passe',
  'hidden.title': 'Recettes masquées',
  'hidden.description': 'Les recettes restaurées reviennent dans ta liste, la recherche et le shuffle.',
  'hidden.loadError': 'Impossible de charger les recettes masquées.',
  'hidden.empty': 'Aucune recette masquée.',
  'hidden.restore': 'Restaurer',
  'api.invalidCredentials': 'Identifiants invalides',
  'api.sessionExpired': 'Session expirée',
  'api.requestFailed': 'La requête a échoué ({{status}})',
};

export type TranslationKey = keyof typeof fr;

// TypeScript enforces en has exactly the same keys as fr
const en: Record<TranslationKey, string> = {
  'app.changePassword': 'Change password',
  'app.import': 'Import',
  'app.newRecipe': 'New',
  'app.logout': 'Log out',
  'app.language': 'Change language',
  'common.cancel': 'Cancel',
  'common.back': 'Back',
  'common.private': 'Private',
  'common.shared': 'Shared',
  'common.language.fr': 'French',
  'common.language.en': 'English',
  'list.hideRecipe': 'Hide recipe',
  'list.searchPlaceholder': 'Search for a recipe, ingredient, or tag...',
  'list.hidden': 'Hidden',
  'list.shuffleTitle': 'Need dinner inspiration?',
  'list.shuffleSubtitle': 'Let FeedMe choose for you tonight.',
  'list.shuffleEmpty': 'Tap x1, x4, or x7 to discover recipe ideas',
  'list.shuffleAgain': 'Shuffle again',
  'list.shuffleError': 'Could not shuffle recipes.',
  'list.empty': 'No recipes found.',
  'detail.loadError': 'Could not load the recipe.',
  'detail.edit': 'Edit',
  'detail.delete': 'Delete',
  'detail.hide': 'Hide',
  'detail.ingredients': 'Ingredients',
  'detail.instructions': 'Preparation',
  'detail.notes': 'Notes',
  'detail.deleteTitle': 'Delete this recipe?',
  'detail.deleteMessage': '"{{title}}" will be permanently deleted.',
  'form.editTitle': 'Edit recipe',
  'form.newTitle': 'New recipe',
  'form.title': 'Title',
  'form.instructions': 'Preparation',
  'form.notes': 'Notes',
  'form.visibility': 'Visibility',
  'form.language': 'Recipe language',
  'form.imageUrl': 'Image URL',
  'form.sourceUrl': 'Source URL',
  'form.tags': 'Tags, separated by commas',
  'form.ingredients': 'Ingredients',
  'form.ingredientName': 'Name',
  'form.quantity': 'Quantity',
  'form.unit': 'Unit',
  'form.remove': 'Remove',
  'form.addIngredient': 'Add ingredient',
  'form.saving': 'Saving...',
  'form.save': 'Save recipe',
  'import.title': 'Import a recipe',
  'import.description': 'Paste a recipe URL to create an editable draft before saving it.',
  'import.url': 'Recipe URL',
  'import.pending': 'Importing...',
  'import.createDraft': 'Create draft',
  'login.tagline': 'Good cooking tonight',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.error': 'Incorrect username or password.',
  'login.pending': 'Signing in...',
  'login.submit': 'Sign in',
  'password.title': 'Change password',
  'password.current': 'Current password',
  'password.new': 'New password',
  'password.confirm': 'Confirm new password',
  'password.tooShort': 'The new password must contain at least 8 characters.',
  'password.mismatch': 'The two new passwords do not match.',
  'password.success': 'Password changed. Redirecting to sign in...',
  'password.pending': 'Changing...',
  'password.submit': 'Change password',
  'hidden.title': 'Hidden recipes',
  'hidden.description': 'Restored recipes return to your list, search, and shuffle.',
  'hidden.loadError': 'Could not load hidden recipes.',
  'hidden.empty': 'No hidden recipes.',
  'hidden.restore': 'Restore',
  'api.invalidCredentials': 'Invalid credentials',
  'api.sessionExpired': 'Session expired',
  'api.requestFailed': 'The request failed ({{status}})',
};

const translations: Record<Locale, Record<TranslationKey, string>> = { fr, en };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(getCurrentLocale);

  const setLocale = React.useCallback((nextLocale: Locale) => {
    localStorage.setItem(localeStorageKey, nextLocale);
    setLocaleState(nextLocale);
  }, []);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => interpolate(translations[locale][key], params),
    }),
    [locale, setLocale],
  );

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}

export function translate(key: TranslationKey, params?: Record<string, string | number>) {
  return interpolate(translations[getCurrentLocale()][key], params);
}

export function getCurrentLocale(): Locale {
  const stored = localStorage.getItem(localeStorageKey);
  if (stored === 'fr' || stored === 'en') return stored;
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('fr')) return 'fr';
  return 'en';
}

function interpolate(value: string, params?: Record<string, string | number>) {
  if (!params) return value;
  return Object.entries(params).reduce(
    (result, [key, replacement]) => result.replaceAll(`{{${key}}}`, String(replacement)),
    value,
  );
}
