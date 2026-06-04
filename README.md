# FeedMe

Self-hosted recipe management and meal inspiration app.

---

## Server deployment

```bash
docker compose pull
docker compose up -d
```

Frontend: `http://server-ip:2323`

API health: `http://server-ip:2323/api/health`

Database migrations run automatically on startup.

---

## Local development

Requires Node.js and Docker.

```bash
./dev.sh
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

Uses a separate dev Postgres on port 5433 — production data is untouched.

---

## Android APK

The APK targets the self-hosted API: `https://feedme.lyranet.xyz/api`

APKs are built automatically by GitHub Actions on every push.

- **Push to `main`** — builds an APK and saves it as a temporary artifact (30 days) on the Actions tab.
- **Push a version tag** — builds an APK and publishes it as a permanent GitHub Release.

To release a new version:

1. Update `versionCode` and `versionName` in `android/app/build.gradle`.
2. Update the version in the root `package.json`.
3. Commit, then tag and push:

```bash
git tag v1.0.1
git push origin v1.0.1
```

The APK will appear at `https://github.com/zerocool4949/feedme/releases`.

Sync the Android project after a frontend change:

```bash
npm run android:sync
```

---

## Database backup and restore

Backups are written to the ignored local `backups/` folder.

Create a backup (production by default):

```bash
./scripts/backup-db.sh
```

Restore a backup (prompts for confirmation — destructive):

```bash
./scripts/restore-db.sh backups/feedme-YYYYMMDD-HHMMSS.sql
```

---

## User management

Create or update a user (also migrates recipes from the old default user):

```bash
NEW_USERNAME=user NEW_PASSWORD=mypassword docker compose --profile tools run --rm create-user
```

Set `JWT_SECRET` in a `.env` file on the server:

```
JWT_SECRET=a-long-random-secret-string
```

Logged-in users can change their password from the app. After a successful change the local session is cleared and the user must log in again.

---

## Recipe sharing

Recipes can be private or shared.

- **Private**: visible to the owner only.
- **Shared**: visible to all logged-in users in the list, search, detail, and shuffle views.

Only the owner can edit or delete a shared recipe. The legacy `public` type is still accepted for old records but is no longer offered in the UI.

If a shared recipe is not of interest, any user can hide it. Hiding is per-account — the recipe remains available to its owner and other users. Hidden recipes can be restored from the **Hidden** page.

---

## Recipe import

### From local HTML files

Place HTML files in the `receip` folder, then run:

```bash
docker compose --profile tools run --rm recipe-importer
```

Deletes recipes tagged `imported` then reimports all files.

### Automatic translation of imported recipes

```bash
docker compose --profile tools run --rm recipe-translator
```

Translates titles, descriptions, instructions, and ingredients into French via Google Translate.

---

## Stack

- **Frontend**: React · Vite · TypeScript · TanStack Query · Material UI · Capacitor
- **Backend**: Hono · Prisma ORM · Zod · Vitest
- **Database**: PostgreSQL
- **Deployment**: Docker Compose · GitHub Actions CI → GHCR
