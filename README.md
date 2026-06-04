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

### Option 1 — npm (recommended, hot reload)

Requires Node.js and Docker.

**Terminal 1 — database only**

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

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`

### Option 2 — Docker (production build test)

```bash
# Create docker-compose.override.yml with local build contexts:
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

Frontend: `http://localhost:2323`

---

## Android APK

The APK targets the self-hosted API: `https://feedme.lyranet.xyz/api`

Build machine requirements:

- JDK 21 with `JAVA_HOME` pointing to it
- Android SDK with packages `platform-tools`, `platforms;android-36`, `build-tools;36.0.0`
- `ANDROID_HOME` set, or `android/local.properties` containing `sdk.dir=C\:\\Android`

Build the debug APK:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME='C:\Android'
npm run android:build:debug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

Sync the Android project after a frontend change:

```bash
npm run android:sync
```

Install on a connected device:

```bash
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Signed release APK

Never commit the keystore or its passwords.

Create `android/keystore.properties`:

```properties
storeFile=../feedme-release.keystore
storePassword=...
keyAlias=feedme
keyPassword=...
```

Build the signed release APK:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME='C:\Android'
npm run android:build:release
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

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
