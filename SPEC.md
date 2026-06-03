# FeedMe

## Implementation Status

Initial MVP implementation exists in this repository.

Done:

* Project structure for `frontend`, `backend`, and Docker Compose
* React + Vite + TypeScript frontend
* React Router routes for list, detail, create, edit, and import pages
* TanStack Query API integration
* Material UI responsive layout
* NestJS REST API
* Prisma schema and initial migration
* PostgreSQL Docker service with persistent volume
* Default local user support without authentication
* Recipe CRUD
* Ingredient model with normalized ingredient names
* Tag model
* Recipe visibility field: `private`, `public`, `shared`
* Recipe status field: `to_try`, `tested`, `favorite`
* Recipe difficulty and rating fields
* Search by title, description, notes, tags, ingredient names, and normalized ingredient names
* Shuffle meal suggestions with requested counts capped to 1 through 7
* Recipe import service skeleton and editable draft flow
* Dockerfiles for frontend and backend

Not done:

* Authentication and authorization
* Real recipe import extraction from JSON-LD, schema.org Recipe, OpenGraph, or HTML fallback
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

Not verified:

* Docker startup with `docker compose up -d`, because Docker is not installed in the current environment
* Migrations against a live PostgreSQL container
* Runtime API and UI behavior in Docker

---

## Overview

FeedMe is a self-hosted recipe management and meal inspiration application.

The application starts as a single-user application running on a self-hosted server but must be designed to support multiple users in the future.

Recipes are primarily imported from websites or manually created. The application helps users discover meals by searching ingredients, tags, text content, and through random meal suggestions.

The application will initially run as a web application hosted on a NUC using Docker and must later be convertible into an Android APK using Capacitor.

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
* Mark recipes as favorites
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
* NestJS
* Prisma ORM

## Database

* PostgreSQL

## Deployment

* Docker
* Docker Compose

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

Authentication is not required in MVP.

---

# Recipes

## Recipe

Fields:

* id
* owner_user_id
* title
* description
* instructions
* prep_time_minutes
* cook_time_minutes
* servings
* source_url
* image_url
* visibility
* status
* rating
* difficulty
* created_at
* updated_at

### Visibility

Values:

* private
* public
* shared

### Status

Values:

* to_try
* tested
* favorite

### Difficulty

Values:

* easy
* medium
* hard

### Rating

Range:

* 1 to 5

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
3. OpenGraph
4. HTML fallback

Imported data:

* title
* ingredients
* instructions
* image
* prep time
* cook time
* servings

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
* times
* servings

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

Future filters:

* favorites only
* vegetarian
* difficulty
* tags

---

# Recipe Detail Page

Display:

* title
* image
* ingredients
* instructions
* servings
* prep time
* cook time
* tags
* notes
* source URL

Actions:

* edit
* delete

---

# Sharing

Not part of MVP implementation.

However architecture must support:

* private recipes
* public recipes
* shared recipes

Future possibilities:

* browse public recipes
* copy public recipes into private collection
* share recipes with friends

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
* favorites
* visibility field
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
