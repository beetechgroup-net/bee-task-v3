# Diretrizes do Projeto BeeTask (GEMINI.md)

Este documento contém as instruções e regras mandatórias para desenvolvimento e manutenção no repositório **bee-task-v3**.

---

## ⚠️ Regra Mandatória: Commit e Push ao Finalizar Edições

> [!IMPORTANT]
> **Sempre após a finalização de quaisquer edições ou correções no código, é OBRIGATÓRIO realizar o `git commit` com uma mensagem clara e padronizada e em seguida executar o `git push` para o repositório remoto.**

### Fluxo Obrigatório pós-edição:
1. Validar as alterações (testes/build, ex: `tsc -b` ou `./mvnw test` se aplicável).
2. Adicionar os arquivos alterados:
   ```bash
   git add <arquivos>
   ```
3. Fazer o commit semântico:
   ```bash
   git commit -m "feat/fix/refactor: descrição clara da alteração"
   ```
4. Fazer o push imediatamente:
   ```bash
   git push origin <branch-atual>
   ```

---

## 🐳 Atualização de Ambiente Docker

Caso as alterações envolvam o frontend ou backend que rodam via Docker Compose em produção/staging:
- **Frontend**:
  ```bash
  docker compose build --no-cache frontend && docker compose up -d --no-deps frontend
  ```
- **Backend**:
  ```bash
  docker compose build --no-cache backend && docker compose up -d --no-deps backend
  ```

---

## 🛠️ Padrões do Projeto

- **Frontend**: Vite + React 19 + TypeScript + Tailwind v4 + HeroUI.
  - Verificar tipagem estrita com `npm --prefix frontend exec -- tsc -b`.
- **Backend**: Quarkus 3.34 + Java 17 + Clean Architecture (Domain Entities -> Use Cases -> Interface Adapters -> Frameworks).
