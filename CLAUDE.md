# CLAUDE.md

Guidance for Claude Code when working in this repository. Keep edits aligned with the conventions below.

## Project

**bee-task-v3 / TimeTrack** — task & time-tracking SaaS. Monorepo with React (Vite) frontend and Quarkus backend, PostgreSQL + Keycloak via Docker. Backlog and user stories live in `backlog.md`.

## Layout

```
backend/    Quarkus 3.34, Java 17, Hibernate ORM + Panache, Flyway, JWT (smallrye)
frontend/   Vite + React 19 + TypeScript + Tailwind v4
docker/     Postgres init scripts
docker-compose.yml   Postgres + Keycloak
specification/       Domain specs
backlog.md           User stories (US-001…)
```

Java root package: `net.beetechgroup.beetask`.

## Commands

Infra: `docker-compose up` (Postgres :5432, Keycloak :8081).

Backend (`cd backend`):
- Dev: `./mvnw quarkus:dev` (port 8080, uses H2 in dev profile, swagger at `/swagger`, OpenAPI at `/openapi`)
- Test: `./mvnw test`
- Build: `./mvnw package`

Frontend (`cd frontend`):
- Dev: `npm run dev` (port 5173, proxies `/api/*` → `http://localhost:8080`)
- Build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint`

## Backend Architecture (Clean Architecture, adapted)

Four layers, dependencies point inward. **Never** import outward.

| Package | Role | May depend on |
|---|---|---|
| `entities/` | Pure domain POJOs and enums (`Task`, `Project`, `User`, `Organization`, `TaskStatus`, …). Plain Java, no annotations. | nothing |
| `usecase/<feature>/<action>/` | Business logic. Plain classes with constructor DI. Records for `XxxInput`/`XxxOutput`. Static `XxxMapper` for domain→Output. | `entities`, `usecase.repository` |
| `usecase/repository/` | Repository **ports** (interfaces) returning domain types. | `entities` |
| `interfaceadapters/controllers/<feature>/` | JAX-RS controllers, `XxxRequest`/`XxxResponse` records, `XxxControllerMapper`. Translates HTTP ↔ use case I/O. | `usecase`, `entities` |
| `frameworks/persistence/` | Panache `XxxEntity`, `XxxRepositoryImpl` (implements port + `PanacheRepository<XxxEntity>`), `XxxEntityMapper` (entity ↔ domain). | everything |
| `frameworks/config/` | `@ApplicationScoped` classes with `@Produces` methods that build use cases from injected repository ports. | everything |

### Use case anatomy

A new use case `usecase/<feature>/<action>/` contains exactly:
- `XxxInput.java` — `record` with primitives/IDs/email (no domain entities in the signature unless intentional)
- `XxxOutput.java` — `record` with the response shape
- `XxxUseCase.java` — plain class, constructor-injected repository ports, single `execute(XxxInput)` method
- `XxxMapper.java` — static `toXxxOutput(domain)` only

Then **wire it** via `@Produces` in the matching `frameworks/config/<Feature>UseCaseConfig.java`. Use cases are NOT annotated with CDI scopes themselves — the producer is what makes them injectable.

### Controller anatomy

`interfaceadapters/controllers/<feature>/`:
- `XxxController.java` — `@Path`, JAX-RS verbs, `@Inject` use cases + `SecurityIdentity`, OpenAPI annotations (`@Tag`, `@Operation`, `@APIResponse`)
- `XxxRequest.java` / `XxxResponse.java` — records mirroring the use case Input/Output (don't reuse use case records in HTTP layer)
- `XxxControllerMapper.java` — static `toXxxInput(request, email)` / `toXxxResponse(output)`

The authenticated email comes from `securityIdentity.getPrincipal().getName()` and is passed into the Input.

### Repository pattern

- Port: `usecase/repository/XxxRepository.java`, methods return **domain** types.
- Impl: `frameworks/persistence/repository/XxxRepositoryImpl.java`:
  - `@ApplicationScoped`
  - `implements XxxRepository, PanacheRepository<XxxEntity>`
  - `@Transactional` on writes
  - Uses `XxxEntityMapper.toEntity` / `toDomain` at the boundary

### DB / migrations

- Postgres in prod, **H2 in dev** (`%dev` profile, file at `backend/data/beetask`).
- `quarkus.hibernate-orm.database.generation=validate` (prod) / `update` (dev).
- Flyway migrations live at `backend/src/main/resources/db/migration/V{N}__{snake_name}.sql`.
- `quarkus.flyway.migrate-at-start=false` — migrations are not auto-applied; run them deliberately.

### Auth

- JWT signed with `privateKey.pem`, verified with `publicKey.pem`. Issuer `https://beetech.net`.
- Keycloak is provisioned in docker-compose but **not yet integrated** into the app — JWTs are minted by `usecase/auth/login`.

## Frontend Conventions

- **React 19**, **Tailwind v4** (`@tailwindcss/vite`, no Tailwind config file required), **react-router-dom v7**.
- Folder layout: `pages/`, `components/`, `services/`, `contexts/`, `types/`, `lib/`.
- HTTP through `apiFetch` in `src/lib/api.ts` — it auto-injects the JWT from `localStorage.user.jwt` and prefixes `VITE_API_URL` (defaults to `/api`, proxied by Vite to the backend).
- Each backend feature gets a service in `services/<feature>Service.ts` exporting an object of methods.
- Class merging uses `cn(...inputs)` from `src/lib/utils.ts` (clsx + tailwind-merge).
- Icons: `lucide-react`. Animations: `framer-motion`. DnD: `@hello-pangea/dnd`.
- Auth state: `AuthContext` (`src/contexts/AuthContext.tsx`) — `user`, `activeOrg`, `login`, `logout`, `refreshUser`. Persisted in `localStorage` (`user`, `activeOrgId`).
- Authenticated routes nest under `<AppShell />` in `src/router.tsx`. Role-restricted routes wrap with `<RoleGate allowedRoles={["OWNER", "ADMIN"]}>`.
- UI strings are in pt-BR. Keep that consistent.

## Conventions & Constraints

- Don't put business logic in controllers — they only translate HTTP ↔ use case I/O.
- **Never return a use case Output record directly from a controller.** Controllers must define their own `XxxResponse` records and use `XxxControllerMapper.toResponse(output)` to convert. Use case I/O types must not leak into the HTTP layer.
- Don't import `jakarta.*`, `io.quarkus.*`, or Panache from `entities/` or `usecase/` (except `usecase.repository` ports which are pure interfaces).
- Don't reach for a UI library on the frontend — Tailwind only.
- Don't create files outside the conventional folders.
- Vertical slices first; refactor when a pattern repeats. The backlog is in `backlog.md`.

## Skills

Project skills live in `.claude/skills/`:
- `scaffold-usecase` — generate a backend use case + controller wiring.
- `scaffold-feature` — generate a frontend page + service + types + route.
- `architecture-review` — audit Clean Architecture violations.
