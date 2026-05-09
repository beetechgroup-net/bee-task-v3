---
trigger: manual
description: Workflow completo para iniciar e concluir uma nova tarefa a partir de uma issue do GitHub
---

# Workflow de Nova Tarefa

Siga estes passos em ordem para executar uma tarefa do início ao PR.

## Passo 1 — Ler a issue

```bash
gh issue view <número> --repo <owner/repo>
```

Leia o **título** e a **descrição** completa da issue antes de qualquer ação.

## Passo 2 — Criar a branch

Escolha o prefixo de acordo com o tipo de mudança:

| Tipo | Prefixo | Quando usar |
|------|---------|-------------|
| Nova funcionalidade | `feat/` | Algo novo que o usuário percebe |
| Correção de bug | `fix/` | Comportamento errado corrigido |
| Manutenção/chore | `chore/` | Refactor, config, padrões, docs |
| Teste | `test/` | Apenas adição/correção de testes |

Formato do nome: `<prefixo><descricao-em-kebab-case>`

```bash
git checkout main
git pull origin main
git checkout -b feat/nome-descritivo-da-tarefa
```

## Passo 3 — Executar a tarefa

Implemente as mudanças seguindo os padrões definidos no `CLAUDE.md` do projeto.

## Passo 4 — Commit

Formato obrigatório: `<tipo>: <descrição em inglês no imperativo>`

```bash
git add <arquivos específicos>
git commit -m "feat: add null check using Objects utility methods"
```

Tipos válidos: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`

Exemplos:
- `feat: add task filtering by organization`
- `fix: prevent duplicate user organization entries`
- `chore: replace JPQL queries with Panache shorthand`

## Passo 5 — Criar o Pull Request

```bash
git push origin <nome-da-branch>
gh pr create \
  --title "<tipo>: <descrição curta em inglês>" \
  --body "$(cat <<'EOF'
## Descrição
...

## Tipo de mudança
- [x] Nova funcionalidade

## Issue relacionada
Fecha #<número>

## O que foi feito
- ...

## Como testar
1. ...

## Checklist
- [x] Código segue padrões do projeto
- [x] Build passa sem erros
EOF
)"
```

A descrição do PR deve ser **em português**, detalhada e seguir o template em `.github/PULL_REQUEST_TEMPLATE.md`.
