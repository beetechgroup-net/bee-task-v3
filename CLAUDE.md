# Bee Task — Guia de Desenvolvimento

## Stack

- **Backend**: Quarkus + Hibernate ORM + Panache (Java 17+)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Banco de dados**: PostgreSQL (via Docker Compose)

## Arquitetura

O backend segue **Clean Architecture** adaptada:

```
entities/          → Domínio puro: entidades e regras de negócio
usecase/           → Casos de uso: orquestram entidades e repositórios (interfaces)
interfaceadapters/ → Controllers REST (JAX-RS), mappers de entrada/saída
frameworks/        → Implementações: Panache repositories, JPA entities, mappers de persistência
```

**Regras de dependência (nunca viole):**
- `entities` não importa nada externo (sem frameworks, sem Jakarta, sem Quarkus)
- `usecase` só importa `entities` e interfaces próprias
- `interfaceadapters` importa `usecase` e `entities`, nunca `frameworks`
- `frameworks` implementa as interfaces de `usecase`

## Padrões de Código Java

### Repositories — Sem SQL nativo e sem JPQL explícito

Nas implementações de repository (`frameworks/persistence/repository/`), use **sempre** o estilo shorthand do Panache:

```java
// CORRETO — shorthand Panache (propriedades da entidade)
find("user.email = ?1 and status = ?2", email, status).list();
find("organization.id", organizationId).stream().toList();
findByIdOptional(id).map(mapper::toDomain);

// ERRADO — JPQL explícito
find("SELECT t FROM TaskEntity t WHERE t.user.email = ?1", email);
find("select distinct t from TaskEntity t join t.history h where ...", ...);

// ERRADO — SQL nativo
getEntityManager().createNativeQuery("SELECT * FROM tasks WHERE ...");
```

Para consultas complexas que envolvem JOINs com coleções, prefira buscar via shorthand e filtrar em Java:

```java
// Busca por propriedade simples + filtragem em Java
return find("user.email = ?1", email).list().stream()
    .filter(entity -> entity.getHistory().stream().anyMatch(h ->
        Objects.nonNull(h.getStartAt()) &&
        !h.getStartAt().isAfter(end) &&
        (Objects.isNull(h.getEndAt()) || !h.getEndAt().isBefore(start))))
    .map(mapper::toDomain)
    .toList();
```

### Verificações de nulo — `Objects.isNull` e `Objects.nonNull`

Use sempre `Objects.isNull(x)` e `Objects.nonNull(x)` ao invés dos operadores `== null` e `!= null`:

```java
// CORRETO
if (Objects.isNull(entity.getId())) {
    persist(entity);
}

if (Objects.nonNull(input.projectId())) {
    task.setProject(projectRepository.findProjectById(input.projectId()).orElseThrow());
}

// ERRADO
if (entity.getId() == null) { ... }
if (input.projectId() != null) { ... }
```

Isso se aplica a: repositories, mappers, use cases e entities.  
Exceção tolerada: ternários simples inline onde a legibilidade é melhor com `!=`.

### Mappers de persistência

Sempre verifique nulo na entrada de métodos de mapeamento:

```java
public static MyEntity toEntity(MyDomain domain) {
    if (Objects.isNull(domain)) return null;
    // ...
}
```

### Padrão de save nos repositories

```java
if (Objects.isNull(entity.getId())) {
    persist(entity);
} else {
    entity = getEntityManager().merge(entity);
}
```

## Workflow de Tarefas

Use o skill `/new-task` para seguir o guia completo de início ao PR.

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

## Rodando o projeto

```bash
# Backend
cd backend
./mvnw quarkus:dev

# Frontend
cd frontend
npm install
npm run dev

# Banco de dados
docker-compose up -d
```
