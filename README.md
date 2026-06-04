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

Le premier APK Android cible l'API auto-hebergee :

`https://feedme.lyranet.xyz/api`

Etat actuel :

- Capacitor est installe.
- Le projet Android existe dans `android/`.
- La configuration Capacitor existe dans `capacitor.config.ts`.
- Le mode Android frontend existe dans `frontend/.env.android`.
- `npm run android:sync` fonctionne.
- Le build APK debug n'est pas encore termine.

Prerequis :

- JDK 21 installe et utilise pour le build Android
- Android SDK installe et configure
- `adb` disponible si tu veux installer/tester sur un telephone ou un emulateur

Il reste a installer/configurer les packages Android SDK :

- `platform-tools`
- `platforms;android-36`
- `build-tools;36.0.0`

Le dernier blocage connu etait :

```text
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable
```

Note : JDK 25 est trop recent pour le build Gradle actuel. Utiliser JDK 21.

Construire un APK debug :

```bash
npm run android:build:debug
```

APK genere :

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Synchroniser seulement le projet Android apres une modification frontend :

```bash
npm run android:sync
```

Si `JAVA_HOME` pointe encore vers JDK 25, lancer le build avec JDK 21 :

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
npm run android:build:debug
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
