# AGENTS.md

## General Principles

* Build the simplest working solution first.
* Prefer clarity over cleverness.
* Prefer maintainability over optimization.
* Do not build features that were not requested.
* Avoid speculative architecture.

---

# Think Before Coding

Before implementing:

1. Read the full request.
2. Identify assumptions.
3. Explain tradeoffs when multiple approaches exist.
4. Choose the simplest solution that satisfies the requirements.

Do not guess requirements.

---

# Large Changes

For any task involving:

* architecture changes
* database redesign
* major refactoring
* new services

First provide:

* implementation plan
* files to modify
* risks
* alternatives

Then wait for approval.

---

# Simplicity First

Prefer:

* simple components
* simple APIs
* simple database structures
* simple Docker configurations

Avoid:

* microservices
* plugin systems
* event buses
* premature optimization
* unnecessary abstractions

---

# Surgical Changes

When modifying code:

* change only what is necessary
* avoid unrelated refactoring
* avoid unnecessary renaming
* avoid formatting unrelated files
* keep commits focused

---

# Architecture

Frontend:

* React
* Vite
* TypeScript
* React Router
* TanStack Query
* Material UI

Backend:

* NestJS
* Prisma

Database:

* PostgreSQL

Deployment:

* Docker Compose

---

# Database Rules

Use Prisma migrations.

Never use schema synchronization.

Every schema change must:

1. Update Prisma schema
2. Create migration
3. Update backend
4. Update frontend if needed

Never skip migrations.

---

# API Rules

Use REST APIs.

Requirements:

* input validation
* proper error handling
* meaningful responses
* predictable endpoints

---

# Search Rules

Ingredient search is a core feature.

Always use normalized ingredient names.

Prefer reusable search services.

Avoid hacks that create inconsistent search behavior.

---

# Recipe Import Rules

Recipe import is a core feature.

Priority order:

1. JSON-LD
2. schema.org Recipe
3. OpenGraph
4. HTML fallback

Import logic must be isolated from UI logic.

---

# Docker Rules

The application is self-hosted.

Everything must work through:

docker compose up -d

Avoid assumptions about local development environments.

---

# UI Conventions

Theme uses a blue pastel palette (light and dark mode) defined in `frontend/src/main.tsx`.

Do not change the color scheme without being asked.

List pages show minimal card content (title, description). Tags and metadata belong on the detail page only.

Responsive breakpoints follow MUI defaults: xs mobile, sm tablet, lg desktop.

---

# Mobile Compatibility

Future Android APK support is required.

Avoid:

* browser-specific hacks
* desktop-only assumptions
* dependencies incompatible with Capacitor

All UI must remain mobile friendly.

---

# Validation Before Completion

Before declaring a task complete:

* build succeeds
* lint succeeds
* tests succeed if present
* migrations succeed
* Docker containers start
* API endpoints function
* UI functions

Do not claim success without verification.

---

# Deliverables

After each completed task provide:

## Summary

What was implemented.

## Files Changed

List all created and modified files.

## Database Changes

List migrations and schema changes.

## Verification

Explain what was tested.

## Known Limitations

List remaining issues or future improvements.

---

# Feature Scope Discipline

Implement only what is requested.

If asked to implement:

* recipe search

Do not also implement:

* meal planning
* shopping lists
* AI recommendations
* social features

Future ideas belong in TODOs, not implementation.

---

# Code Quality

* TypeScript everywhere
* Strong typing
* Avoid any
* ESLint
* Prettier
* Meaningful naming
* Small focused functions
* Reusable components where appropriate

---

# MVP Priority

Priority order:

1. Database
2. Backend API
3. Frontend CRUD
4. Search
5. Import
6. Shuffle
7. Polish

Always get the core functionality working before adding enhancements.
