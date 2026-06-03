# FeedMe

## Implementation Status

Initial MVP implementation exists in this repository.

Done:

* Project structure for `frontend`, `backend`, and Docker Compose
* React + Vite + TypeScript frontend
* React Router routes for list, detail, create, edit, and import pages
* TanStack Query API integration
* Material UI responsive layout with persistent dark/light mode (blue pastel palette)
* Recipe list page with 3-column responsive grid (1 on mobile, 2 on tablet, 3 on desktop)
* Hono REST API
* Prisma schema and migrations
* PostgreSQL Docker service with persistent volume
* Multi-user authentication with JWT
* Recipe CRUD
* Ingredient model with normalized ingredient names
* Ingredient quantity/unit parsing before storage
* Tag model
* Recipe visibility field: private or shared in the UI, with legacy `public` records treated as shared
* Search by title, notes, tags, ingredient names, and normalized ingredient names
* Shuffle meal suggestions with requested counts capped to 1 through 7 and image previews
* Recipe import with JSON-LD and HTML fallback extraction and editable draft flow
* Dockerfiles for frontend and backend
* GitHub Actions CI publishing images to GHCR

Not done:

* Meal planning calendar
* Shopping lists
* OCR
* AI recipe generation
* Social feeds
* Recipe comments
* Notifications
* Cloud sync
* Nutrition tracking
* Public recipe browsing, copying, or friend sharing flows
* Capacitor Android packaging
* Automated tests

Verified:

* Backend and frontend production builds succeed with `npm run build`
* ESLint succeeds with `npm run lint`
* Prisma schema validates when `DATABASE_URL` is provided
* Docker deployment works via `docker compose pull && docker compose up -d`
* Migrations run on container startup via `prisma migrate deploy`

---

## Overview

FeedMe is a self-hosted recipe management and meal inspiration application.

The application starts as a single-user application running on a self-hosted server but must be designed to support multiple users in the future.

Recipes are primarily imported from websites or manually created. The application helps users discover meals by searching ingredients, tags, text content, and through random meal suggestions.

The application runs as a web application hosted on a NUC using Docker and must later be convertible into an Android APK using Capacitor.

---

# Goals

Users should be able to:

* Import recipes from websites
* Create recipes manually
* Edit recipes
* Delete recipes
* Search recipes by ingredient
* Search recipes by title, notes, and tags
* Generate random meal ideas
* Organize recipes using tags
* Support future recipe sharing

---

# Non Goals (MVP)

Do NOT build the following in the MVP:

* Meal planning calendar
* Shopping lists
* OCR
* AI recipe generation
* Social feeds
* Recipe comments
* Notifications
* Cloud sync
* Nutrition tracking

---

# Technology Stack

## Frontend

* React
* Vite
* TypeScript
* React Router
* TanStack Query
* Material UI

## Backend

* Node.js
* Hono
* Prisma ORM
* Zod

## Database

* PostgreSQL

## Deployment

* Docker
* Docker Compose
* GitHub Actions CI publishing images to GHCR

## Future Mobile Support

* Capacitor
* Android APK

---

# Users

The MVP can operate with a default local user.

However the database schema must support multiple users from day one.

## User

Fields:

* id
* username
* email
* password_hash
* created_at
* updated_at

Users authenticate with username and password. Recipes are scoped by owner unless they are shared.

---

# Recipes

## Recipe

Fields:

* id
* owner_user_id
* title
* instructions
* source_url
* image_url
* visibility
* created_at
* updated_at

### Visibility

Values:

* private
* shared

`public` can still exist in older database records for compatibility, but the frontend no longer exposes it. Legacy public recipes are readable like shared recipes.

---

# Ingredients

Ingredients are stored separately.

## Ingredient

Fields:

* id
* recipe_id
* name
* normalized_name
* quantity
* unit
* original_text

Example:

Original:

3 fresh tomatoes

Normalized:

tomato

Normalized values will be used for ingredient search.

When possible, imported ingredient lines should be split into quantity, unit, and ingredient name before storage. The original text should still be preserved for display and manual review.

---

# Tags

## RecipeTag

Fields:

* id
* recipe_id
* tag

Examples:

* vegetarian
* pasta
* chicken
* spicy
* quick

---

# Recipe Import

Users can import recipes from URLs.

Supported extraction priority:

1. JSON-LD
2. schema.org Recipe
3. HTML fallback (meta tags and content parsing)

Imported data:

* title
* ingredients
* instructions
* image
* tags (from keywords, category, cuisine)

Users must be able to review and edit imported recipes before saving.

If import fails, users must still be able to manually complete the recipe.

---

# Manual Recipe Creation

Required fields:

* title
* ingredients
* instructions

Optional fields:

* notes
* image
* source URL
* tags
* description

---

# Search

Search must support:

* title
* ingredients
* tags
* notes

Requirements:

* case insensitive
* partial matching
* fast response time
* UI remains usable in light and dark color modes

Examples:

Search:

tomato

Should match:

* tomato
* tomatoes
* fresh tomato

Search:

onion

Should match:

* red onion
* white onion

---

# Shuffle

Users can generate random meal ideas.

Examples:

* Shuffle 1 meal
* Shuffle 4 meals
* Shuffle 7 meals

Rules:

* No duplicates
* Only recipes visible to the current user
* Reshuffle support
* Handle insufficient recipes gracefully
* Show the recipe image with the title when an image is available

Future filters:

* vegetarian
* tags

---

# Recipe List Page

Display:

* search bar
* shuffle section with image previews
* recipe grid (1 column on mobile, 2 on tablet, 3 on desktop)
* each card shows: thumbnail image, title only

Tags are not shown on the list page. Full details including tags are on the detail page.

---

# Recipe Detail Page

Display:

* title
* image
* ingredients
* instructions
* tags
* notes
* source URL
* visibility

Actions:

* edit
* delete

---

# Sharing

Shared recipes are visible to every authenticated user.

Rules:

* private recipes are visible only to their owner
* shared recipes appear in list, search, detail, and shuffle for all logged-in users
* only the owner can edit or delete a recipe
* the frontend offers only private and shared visibility choices

Future possibilities:

* share recipes with specific users
* copy shared recipes into a private collection

---

# Database Requirements

Use PostgreSQL.

Requirements:

* Prisma ORM
* Prisma migrations
* No schema synchronization
* Migration required for every schema change

---

# Deployment Requirements

Application must run completely through Docker.

Required containers:

* frontend
* backend
* postgres

Requirements:

* persistent database volume
* restart unless-stopped
* environment variable configuration
* reverse proxy friendly
* images published to GHCR via GitHub Actions on push to main

Application should be reachable through:

http://server-ip

---

# MVP Features

Must implement:

* recipe CRUD
* ingredient model
* tag model
* recipe import
* recipe search
* ingredient search
* shuffle meal ideas
* Docker deployment

---

# Success Criteria

The MVP is complete when:

* Docker containers start successfully
* Database migrations run successfully
* Recipes can be created
* Recipes can be imported
* Recipes can be edited
* Recipes can be deleted
* Search works
* Shuffle works
* Data persists after container recreation
