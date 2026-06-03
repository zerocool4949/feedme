# FeedMe

Self-hosted MVP recipe and meal inspiration app.

## Current Status

Initial MVP implementation is in place.

Implemented:

* React + Vite + TypeScript frontend
* NestJS backend
* Prisma ORM
* PostgreSQL schema and initial migration
* Docker Compose with frontend, backend, and postgres services
* Default local user support
* Recipe CRUD
* Ingredients table with normalized ingredient names
* Tags table
* Recipe visibility: private, public, shared
* Recipe status: to_try, tested, favorite
* Search by title, description, notes, tags, and ingredients
* Shuffle meal suggestions
* Recipe import endpoint and editable draft flow skeleton
* Responsive Material UI frontend

Not implemented yet:

* Authentication
* Real recipe extraction from JSON-LD, schema.org, OpenGraph, or HTML
* Meal planning
* Shopping lists
* Social features
* OCR
* AI features
* Public recipe browsing or sharing flows
* Automated tests

Verification performed:

* `npm run build`
* `npm run lint`
* `npx prisma validate --schema backend/prisma/schema.prisma`

Not verified in this environment:

* `docker compose up -d`, because Docker is not installed locally.
* Runtime API endpoint checks against a running PostgreSQL container.

## Run

```bash
docker compose up -d
```

Frontend: `http://localhost`

Backend health: `http://localhost/api/health`
