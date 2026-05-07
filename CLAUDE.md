# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at localhost:5173, proxies /api → localhost:5106
npm run build      # Type-check (vue-tsc) then Vite build → dist/
npm run build:vercel  # Writes prod env vars then builds (Vercel deployments)
npm run preview    # Serve the dist/ folder locally
```

No test runner is configured.

## Stack

Vue 3 (Composition API) · Vite · TypeScript · Vuetify 3 · Pinia · Vue Router 4 · Axios

## Architecture

### HTTP layer (`src/api/http.ts`)

Single Axios instance (`api`) shared by all services. Two interceptors:
- **Request**: attaches `Authorization: Bearer <token>` from `localStorage['booking.jwt']` (skipped on the login endpoint).
- **Response**: reads `ProblemDetails` from error bodies, shows a `useUiStore().showSnack()` notification, and hard-redirects to `/login?returnUrl=...` on 401. Pass `{ skipErrorSnack: true }` in the request config to suppress the snack for a specific call.

### Services (`src/services/`)

Plain exported async functions — no classes. One file per domain (reservas, clientes, sucursales, habitaciones, alojamientos, tiposHabitacion). All call the shared `api` instance and return typed API envelopes.

### API envelope

Every backend response is wrapped in `ApiResponse<T>` (`src/models/api.types.ts`):
```ts
{ success: boolean; message?: string | null; data?: T; errors?: string[] | null }
```
Paginated lists use `DataPageResult<T>` inside that wrapper. All model types are barrel-exported from `src/models/index.ts`.

### Pinia stores (`src/stores/`)

- **`auth`** — login/logout, JWT persisted to `localStorage['booking.jwt']`, full login payload in `localStorage['booking.login']`. `isAuthenticated()`, `getRoles()`, `hasAnyRole(roles[])` are the main helpers.
- **`userContext`** — fetches `/api/v1/internal/auth/me` after login; resolves `idCliente` with localStorage override support (`booking.idClienteOverride`).
- **`ui`** — snack bar state. Call `useUiStore().showSnack(text, ms, variant)` from anywhere for feedback.

### Routing (`src/router/index.ts`)

Two layout trees via nested routes:
- `/` → `PublicLayout` — marketplace, accommodation browsing, reservar (auth required), mis-reservas (auth required).
- `/admin` → `AdminLayout` — requires auth + `Admin` or `Vendedor` role. Permanent side nav with links to all entity CRUDs.

Global guard redirects unauthenticated users to `/login?returnUrl=...` and non-admin users away from `/admin`.

### Roles (`src/constants/roles.ts`)

```ts
AppRole = { Admin: 'Admin', Vendedor: 'Vendedor', Cliente: 'Cliente' }
```

### Environments (`src/environments/`)

`environment.ts` sets `apiUrl: ''` (dev — Vite proxy handles `/api`). `environment.prod.ts` sets the full production URL. Import always from `@/environments/environment`.

### Views (`src/views/`)

Organized by area: `auth/`, `marketplace/`, `accommodations/`, `reservations/`, `admin/`. Admin pages follow a list-page / edit-page pair per entity.
