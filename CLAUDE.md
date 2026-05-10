# Bee Task — Guia de Desenvolvimento

Orientações para o Claude Code neste repositório. Mantenha as convenções abaixo ao fazer alterações.

## Projeto

**bee-task-v3 / TimeTrack** — SaaS de gestão de tarefas e rastreamento de tempo. Monorepo com frontend React (Vite) e backend Quarkus, PostgreSQL + Keycloak via Docker. Backlog e histórias de usuário em `backlog.md`.

## Estrutura

```
backend/             Quarkus 3.34, Java 17, Hibernate ORM + Panache, Flyway, JWT (smallrye)
frontend/            Vite + React 19 + TypeScript + Tailwind v4
docker/              Scripts de inicialização do Postgres
docker-compose.yml   Postgres + Keycloak
specification/       Especificações de domínio
backlog.md           Histórias de usuário (US-001…)
```

Pacote raiz Java: `net.beetechgroup.beetask`.

## Comandos

Infra: `docker-compose up` (Postgres :5432, Keycloak :8081).

Backend (`cd backend`):
- Dev: `./mvnw quarkus:dev` (porta 8080, usa H2 no perfil dev, swagger em `/swagger`, OpenAPI em `/openapi`)
- Testes: `./mvnw test`
- Build: `./mvnw package`

Frontend (`cd frontend`):
- Dev: `npm run dev` (porta 5173, proxy `/api/*` → `http://localhost:8080`)
- Build: `npm run build` (executa `tsc -b` e depois `vite build`)
- Lint: `npm run lint`

## Arquitetura do Backend (Clean Architecture adaptada)

Quatro camadas; dependências apontam para dentro. **Nunca** importe para fora.

| Pacote | Responsabilidade | Pode depender de |
|---|---|---|
| `entities/` | POJOs e enums de domínio puro (`Task`, `Project`, `User`, `Organization`, `TaskStatus`, …). Java puro, sem anotações. | nada |
| `usecase/<feature>/<action>/` | Lógica de negócio. Classes simples com injeção via construtor. Records para `XxxInput`/`XxxOutput`. `XxxMapper` estático para domínio→Output. | `entities`, `usecase.repository` |
| `usecase/repository/` | **Portas** de repositório (interfaces) que retornam tipos de domínio. | `entities` |
| `interfaceadapters/controllers/<feature>/` | Controllers JAX-RS, records `XxxRequest`/`XxxResponse`, `XxxControllerMapper`. Traduz HTTP ↔ I/O dos casos de uso. | `usecase`, `entities` |
| `frameworks/persistence/` | `XxxEntity` Panache, `XxxRepositoryImpl` (implementa a porta + `PanacheRepository<XxxEntity>`), `XxxEntityMapper` (entity ↔ domínio). | tudo |
| `frameworks/config/` | Classes `@ApplicationScoped` com métodos `@Produces` que constroem os casos de uso a partir dos repositórios injetados. | tudo |

### Anatomia de um caso de uso

Um novo caso de uso em `usecase/<feature>/<action>/` contém exatamente:
- `XxxInput.java` — `record` com primitivos/IDs/email (sem entidades de domínio na assinatura, salvo intencionalmente)
- `XxxOutput.java` — `record` com o formato da resposta
- `XxxUseCase.java` — classe simples, portas de repositório injetadas via construtor, método único `execute(XxxInput)`
- `XxxMapper.java` — estático, apenas `toXxxOutput(domain)`

Em seguida, **registre** via `@Produces` no `frameworks/config/<Feature>UseCaseConfig.java` correspondente. Casos de uso **não** são anotados com escopos CDI — é o producer que os torna injetáveis.

### Anatomia de um controller

`interfaceadapters/controllers/<feature>/`:
- `XxxController.java` — `@Path`, verbos JAX-RS, `@Inject` nos casos de uso + `SecurityIdentity`, anotações OpenAPI (`@Tag`, `@Operation`, `@APIResponse`)
- `XxxRequest.java` / `XxxResponse.java` — records espelhando o Input/Output do caso de uso (não reutilize records do caso de uso na camada HTTP)
- `XxxControllerMapper.java` — estático: `toXxxInput(request, email)` / `toXxxResponse(output)`

O e-mail autenticado vem de `securityIdentity.getPrincipal().getName()` e é passado para o Input.

### Padrão de repositório

- Porta: `usecase/repository/XxxRepository.java`, métodos retornam tipos de **domínio**.
- Implementação: `frameworks/persistence/repository/XxxRepositoryImpl.java`:
  - `@ApplicationScoped`
  - `implements XxxRepository, PanacheRepository<XxxEntity>`
  - `@Transactional` em escritas
  - Usa `XxxEntityMapper.toEntity` / `toDomain` na fronteira

### Banco de dados / migrações

- Postgres em produção, **H2 em dev** (perfil `%dev`, arquivo em `backend/data/beetask`).
- `quarkus.hibernate-orm.database.generation=validate` (prod) / `update` (dev).
- Migrações Flyway em `backend/src/main/resources/db/migration/V{N}__{snake_name}.sql`.
- `quarkus.flyway.migrate-at-start=false` — migrações não são aplicadas automaticamente; execute deliberadamente.

### Autenticação

- JWT assinado com `privateKey.pem`, verificado com `publicKey.pem`. Issuer `https://beetech.net`.
- Keycloak está provisionado no docker-compose mas **ainda não integrado** ao app — JWTs são gerados por `usecase/auth/login`.

## Padrões de Código Java

### Repositories — Sem SQL nativo e sem JPQL explícito

Use **sempre** o estilo shorthand do Panache nas implementações de repositório:

```java
// CORRETO — shorthand Panache
find("user.email = ?1 and status = ?2", email, status).list();
find("organization.id", organizationId).stream().toList();
findByIdOptional(id).map(mapper::toDomain);

// ERRADO — JPQL explícito
find("SELECT t FROM TaskEntity t WHERE t.user.email = ?1", email);
find("select distinct t from TaskEntity t join t.history h where ...", ...);

// ERRADO — SQL nativo
getEntityManager().createNativeQuery("SELECT * FROM tasks WHERE ...");
```

Para consultas com JOIN em coleções, busque via shorthand e filtre em Java:

```java
return find("user.email = ?1", email).list().stream()
    .filter(entity -> entity.getHistory().stream().anyMatch(h ->
        Objects.nonNull(h.getStartAt()) &&
        !h.getStartAt().isAfter(end) &&
        (Objects.isNull(h.getEndAt()) || !h.getEndAt().isBefore(start))))
    .map(mapper::toDomain)
    .toList();
```

### Verificações de nulo — `Objects.isNull` e `Objects.nonNull`

Use sempre `Objects.isNull(x)` e `Objects.nonNull(x)` ao invés de `== null` e `!= null`:

```java
// CORRETO
if (Objects.isNull(entity.getId())) { persist(entity); }
if (Objects.nonNull(input.projectId())) { ... }

// ERRADO
if (entity.getId() == null) { ... }
if (input.projectId() != null) { ... }
```

Aplica-se a: repositories, mappers, use cases e entities.

### Mappers de persistência

Sempre verifique nulo na entrada:

```java
public static MyEntity toEntity(MyDomain domain) {
    if (Objects.isNull(domain)) return null;
    // ...
}
```

## Convenções Gerais

- Não coloque lógica de negócio em controllers — eles apenas traduzem HTTP ↔ I/O do caso de uso.
- **Nunca retorne um record de Output do caso de uso diretamente em um controller.** Controllers devem definir seus próprios records `XxxResponse` e usar `XxxControllerMapper.toResponse(output)`. Tipos de I/O do caso de uso não devem vazar para a camada HTTP.
- Não importe `jakarta.*`, `io.quarkus.*` ou Panache em `entities/` ou `usecase/` (exceto nas interfaces de `usecase.repository`, que são puras).
- No frontend, não use biblioteca de UI — apenas Tailwind.
- Não crie arquivos fora das pastas convencionais.
- Fatias verticais primeiro; refatore quando um padrão se repetir. O backlog está em `backlog.md`.

## Frontend

- **React 19**, **Tailwind v4** (`@tailwindcss/vite`, sem arquivo de config do Tailwind), **react-router-dom v7**.
- Estrutura de pastas: `pages/`, `components/`, `services/`, `contexts/`, `types/`, `lib/`.
- HTTP via `apiFetch` em `src/lib/api.ts` — injeta o JWT de `localStorage.user.jwt` e prefixa `VITE_API_URL` (padrão `/api`, com proxy do Vite para o backend).
- Cada feature do backend tem um service em `services/<feature>Service.ts`.
- Mesclagem de classes CSS com `cn(...inputs)` de `src/lib/utils.ts` (clsx + tailwind-merge).
- Ícones: `lucide-react`. Animações: `framer-motion`. DnD: `@hello-pangea/dnd`.
- Estado de auth: `AuthContext` (`src/contexts/AuthContext.tsx`) — `user`, `activeOrg`, `login`, `logout`, `refreshUser`. Persistido em `localStorage`.
- Rotas autenticadas aninhadas em `<AppShell />` em `src/router.tsx`. Rotas restritas por papel com `<RoleGate allowedRoles={["OWNER", "ADMIN"]}>`.
- Textos da UI em pt-BR. Mantenha esse padrão.

## Workflow de Tarefas

Use o skill `/new-task` para o guia completo de início ao PR.

### Branches

| Tipo | Prefixo |
|------|---------|
| Funcionalidade | `feat/` |
| Bug | `fix/` |
| Manutenção | `chore/` |
| Testes | `test/` |

### Commits

Formato: `<tipo>: <descrição em inglês no imperativo>`

```
feat: add task filtering by user organization
fix: prevent null pointer in task history mapper
chore: replace JPQL with Panache shorthand queries
```

### Pull Requests

- Título em inglês, curto (< 70 chars)
- Descrição em **português**, seguindo `.github/PULL_REQUEST_TEMPLATE.md`
- Vincular a issue com `Fecha #<número>`

## Skills

Skills do projeto em `.claude/skills/`:
- `new-task` — workflow completo: ler issue → branch → código → commit → PR.
