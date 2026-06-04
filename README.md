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

## Android APK

L'APK cible l'API auto-hébergée : `https://feedme.lyranet.xyz/api`

Prérequis sur la machine de build :

- JDK 21 installé, avec `JAVA_HOME` qui pointe vers ce JDK
- Android SDK installé avec les packages `platform-tools`, `platforms;android-36`, `build-tools;36.0.0`
- `ANDROID_HOME` défini ou `android/local.properties` contenant le chemin du SDK, par exemple `sdk.dir=C\:\\Android`

Construire l'APK debug :

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot' # adapte ce chemin si besoin
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME='C:\Android' # adapte ce chemin si besoin
npm run android:build:debug
```

APK généré :

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Synchroniser le projet Android après une modification frontend :

```bash
npm run android:sync
```

Installer sur un appareil connecté :

```bash
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### APK release signé

Le keystore et ses mots de passe ne doivent pas être commités.

Créer `android/keystore.properties` :

```properties
storeFile=../feedme-release.keystore
storePassword=...
keyAlias=feedme
keyPassword=...
```

Construire l'APK release signé :

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot' # adapte ce chemin si besoin
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME='C:\Android' # adapte ce chemin si besoin
npm run android:build:release
```

APK généré :

```text
android/app/build/outputs/apk/release/app-release.apk
```

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

Les utilisateurs connectÃ©s peuvent modifier leur mot de passe depuis l'application. AprÃ¨s modification, la session locale est supprimÃ©e et l'utilisateur doit se reconnecter.

---

## Partage des recettes

Les recettes peuvent être privées ou partagées.

- **Privée** : visible uniquement par son propriétaire.
- **Partagée** : visible par tous les utilisateurs connectés dans la liste, la recherche, le détail et le shuffle.

Seul le propriétaire peut modifier ou supprimer une recette partagée. L'ancien type `public` reste accepté pour les anciennes données, mais il n'est plus proposé dans l'interface.

Si une recette partagée ne t'intéresse pas, tu peux la masquer. Le masquage ne concerne que ton compte : la recette reste disponible pour son propriétaire et les autres utilisateurs. Les recettes masquées peuvent être restaurées depuis la page **Masquées**.

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
- **Backend** : Hono · Prisma ORM · Zod · Vitest
- **Base de données** : PostgreSQL
- **Déploiement** : Docker Compose · GitHub Actions CI → GHCR
