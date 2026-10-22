# Diretrizes do Projeto BeeTask (GEMINI.md)

Este documento contém as instruções e regras mandatórias para desenvolvimento e manutenção no repositório **bee-task-v3**.

---

## ⚠️ Regras Mandatórias Pós-Edição de Código

> [!IMPORTANT]
> **Sempre após a finalização de quaisquer alterações ou correções no código, é OBRIGATÓRIO:**
> 1. **Atualizar o container Docker correspondente** (rebuild e restart imediato).
> 2. **Realizar o `git commit`** com mensagem clara e padronizada.
> 3. **Executar o `git push`** para o repositório remoto.

---

### 🔄 Fluxo Obrigatório Pós-Edição:

1. **Validar as alterações**:
   - Frontend: `npm --prefix frontend exec -- tsc -b frontend`
   - Backend: `./mvnw test` (ou verificação de compilação)

2. **🐳 Atualizar o container Docker imediatamente**:
   - Se alterou **Frontend**:
     ```bash
     docker compose build --no-cache frontend && docker compose up -d --no-deps frontend
     ```
   - Se alterou **Backend**:
     ```bash
     docker compose build --no-cache backend && docker compose up -d --no-deps backend
     ```
   - Se alterou **Ambos**:
     ```bash
     docker compose build --no-cache frontend backend && docker compose up -d --no-deps frontend backend
     ```

3. **📦 Versionamento Git (Commit & Push)**:
   ```bash
   git add <arquivos>
   git commit -m "feat/fix/refactor: descrição clara da alteração"
   git push origin <branch-atual>
   ```

---

## 🛠️ Padrões do Projeto

- **Frontend**: Vite + React 19 + TypeScript + Tailwind v4 + HeroUI.
  - Tipagem estrita validada com `npm --prefix frontend exec -- tsc -b frontend`.
- **Backend**: Quarkus 3.34 + Java 17 + Clean Architecture (Domain Entities -> Use Cases -> Interface Adapters -> Frameworks).
