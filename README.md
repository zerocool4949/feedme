# FeedMe

Application auto-hébergée de gestion de recettes et d'idées de repas.

---

## Déploiement serveur

```bash
docker compose pull
docker compose up -d
```

Frontend : `http://server-ip:2323`

Santé API : `http://server-ip:2323/api/health`

Les migrations de base de données s'exécutent automatiquement au démarrage.

---

## Développement local

### Option 1 — npm (recommandé, hot reload)

Nécessite Node.js et Docker installés.

**Terminal 1 — base de données uniquement**

```bash
docker compose up postgres -d
```

**Terminal 2 — backend**

```bash
cd backend
DATABASE_URL="postgresql://feedme:feedme_password@localhost:5432/feedme?schema=public" npx prisma migrate deploy
DATABASE_URL="postgresql://feedme:feedme_password@localhost:5432/feedme?schema=public" npm run start:dev
```

**Terminal 3 — frontend**

```bash
cd frontend
npm run dev
```

Frontend : `http://localhost:5173`  
Backend : `http://localhost:3000`

### Option 2 — Docker (test du build de production)

```bash
# Créer docker-compose.override.yml avec les build contexts locaux :
# services:
#   backend:
#     build: { context: ./backend }
#     image: feedme-backend-local
#   frontend:
#     build: { context: ./frontend }
#     image: feedme-frontend-local

docker compose build
docker compose up -d
```

Frontend : `http://localhost:2323`

---

## Gestion des utilisateurs

Créer ou mettre à jour un utilisateur (remplace aussi ses recettes depuis l'ancien utilisateur par défaut) :

```bash
NEW_USERNAME=user NEW_PASSWORD=monmotdepasse docker compose --profile tools run --rm create-user
```

Définir `JWT_SECRET` dans un fichier `.env` sur le serveur :

```
JWT_SECRET=une-chaine-aleatoire-longue-et-secrete
```

---

## Partage des recettes

Les recettes peuvent être privées ou partagées.

- **Privée** : visible uniquement par son propriétaire.
- **Partagée** : visible par tous les utilisateurs connectés dans la liste, la recherche, le détail et le shuffle.

Seul le propriétaire peut modifier ou supprimer une recette partagée. L'ancien type `public` reste accepté pour les anciennes données, mais il n'est plus proposé dans l'interface.

---

## Import de recettes

### Depuis des fichiers HTML locaux

Placer les fichiers HTML dans le dossier `receip`, puis exécuter :

```bash
docker compose --profile tools run --rm recipe-importer
```

Supprime les recettes taguées `imported` puis réimporte tous les fichiers.

### Traduction automatique des recettes importées

```bash
docker compose --profile tools run --rm recipe-translator
```

Traduit les titres, descriptions, instructions et ingrédients en français via Google Translate.

---

## Stack

- **Frontend** : React · Vite · TypeScript · TanStack Query · Material UI
- **Backend** : Hono · Prisma ORM · Zod
- **Base de données** : PostgreSQL
- **Déploiement** : Docker Compose · GitHub Actions CI → GHCR
