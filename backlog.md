# 📋 Product Backlog — TimeTrack

---

## 🟢 EPIC 1 — Autenticação e Organização

### 🧩 US-001 — Criar organização

**Como** dono
**Quero** criar uma organização
**Para** gerenciar meu time

**Prioridade:** MVP

**Critérios de Aceitação:**

* Deve ser possível criar uma organização com nome
* O criador deve automaticamente se tornar DONO
* Organização deve ter ID único

---

### 🧩 US-002 — Entrar em uma organização

**Como** colaborador
**Quero** solicitar entrada em uma organização
**Para** participar do time

**Prioridade:** MVP

**Critérios de Aceitação:**

* Usuário pode solicitar entrada
* Solicitação fica pendente
* Dono pode visualizar solicitações

---

### 🧩 US-003 — Aprovar solicitação

**Como** dono
**Quero** aprovar/rejeitar solicitações
**Para** controlar acesso

**Prioridade:** MVP

**Critérios de Aceitação:**

* Dono pode aprovar ou rejeitar
* Usuário aprovado entra como colaborador
* Status da solicitação é atualizado

---

### 🧩 US-004 — Gerenciar usuários

**Como** dono
**Quero** adicionar gestores e colaboradores
**Para** montar meu time

**Prioridade:** MVP

**Critérios de Aceitação:**

* Dono pode definir role (MANAGER / EMPLOYEE)
* Usuário fica vinculado à organização

---

## 🟢 EPIC 2 — Projetos, Categorias e Estrutura

### 🧩 US-005 — Criar projeto

**Como** gestor ou dono
**Quero** criar um projeto
**Para** organizar tarefas

**Prioridade:** MVP

**Critérios de Aceitação:**

* Projeto deve ter nome
* Projeto pertence a uma organização

---

### 🧩 US-006 — Associar gestores ao projeto

**Como** dono
**Quero** definir gestores responsáveis por um projeto
**Para** delegar acompanhamento

**Prioridade:** MVP

**Critérios de Aceitação:**

* Projeto pode ter múltiplos gestores
* Apenas gestores da organização podem ser vinculados

---

### 🧩 US-007 — Criar categorias

**Como** gestor
**Quero** criar categorias
**Para** classificar tarefas

**Prioridade:** Alta

**Critérios de Aceitação:**

* Categoria tem nome
* Categoria pertence à organização

---

## 🟢 EPIC 3 — Gestão de Tarefas

### 🧩 US-008 — Criar tarefa

**Como** colaborador
**Quero** criar uma tarefa
**Para** organizar meu trabalho

**Prioridade:** MVP

**Critérios de Aceitação:**

* Deve conter nome, categoria, projeto
* Status inicial: aberta

---

### 🧩 US-009 — Atualizar status da tarefa

**Como** colaborador
**Quero** atualizar o status
**Para** refletir progresso

**Prioridade:** Alta

**Critérios de Aceitação:**

* Status: aberta, em andamento, concluída

---

### 🧩 US-010 — Listar tarefas

**Como** colaborador
**Quero** visualizar minhas tarefas
**Para** acompanhar meu trabalho

**Prioridade:** MVP

**Critérios de Aceitação:**

* Listar tarefas do usuário
* Filtro por status

---

## 🟢 EPIC 4 — Controle de Tempo

### 🧩 US-011 — Iniciar tarefa

**Como** colaborador
**Quero** iniciar uma tarefa
**Para** registrar tempo

**Prioridade:** MVP

**Critérios de Aceitação:**

* Cria um TimeEntry com horário inicial
* Apenas uma tarefa ativa por usuário

---

### 🧩 US-012 — Pausar tarefa

**Como** colaborador
**Quero** pausar uma tarefa
**Para** interromper contagem

**Prioridade:** MVP

**Critérios de Aceitação:**

* Fecha o TimeEntry atual
* Tarefa fica pausada

---

### 🧩 US-013 — Retomar tarefa

**Como** colaborador
**Quero** retomar uma tarefa
**Para** continuar registro

**Prioridade:** Alta

**Critérios de Aceitação:**

* Novo TimeEntry é criado

---

### 🧩 US-014 — Finalizar tarefa

**Como** colaborador
**Quero** finalizar uma tarefa
**Para** concluir trabalho

**Prioridade:** Alta

**Critérios de Aceitação:**

* Status muda para concluída
* Não pode mais iniciar novamente

---

## 🟢 EPIC 5 — Dashboard do Colaborador

### 🧩 US-015 — Ver tarefas de ontem

**Como** colaborador
**Quero** ver tarefas de ontem
**Para** revisar meu trabalho

**Prioridade:** MVP

**Critérios de Aceitação:**

* Lista tarefas com atividade no dia anterior

---

### 🧩 US-016 — Ver tarefas abertas

**Como** colaborador
**Quero** ver tarefas abertas
**Para** planejar o dia

**Prioridade:** MVP

**Critérios de Aceitação:**

* Lista tarefas não concluídas

---

## 🟢 EPIC 6 — Relatórios do Colaborador

### 🧩 US-017 — Relatório mensal

**Como** colaborador
**Quero** ver relatório mensal
**Para** acompanhar meu desempenho

**Prioridade:** MVP

**Critérios de Aceitação:**

* Total de horas por mês
* Agrupamento por categoria
* Agrupamento por projeto

---

## 🟢 EPIC 7 — Monitoramento do Gestor

### 🧩 US-018 — Ver tempo por colaborador

**Como** gestor
**Quero** ver tempo gasto por colaborador
**Para** acompanhar produtividade

**Prioridade:** MVP

**Critérios de Aceitação:**

* Exibe horas por colaborador

---

### 🧩 US-019 — Ver tempo por projeto

**Como** gestor
**Quero** ver tempo por projeto
**Para** entender esforço

**Prioridade:** MVP

**Critérios de Aceitação:**

* Soma de horas por projeto

---

### 🧩 US-020 — Ver eficiência

**Como** gestor
**Quero** ver eficiência
**Para** avaliar performance

**Prioridade:** MVP

**Critérios de Aceitação:**

* Fórmula:

  * horas trabalhadas / horas disponíveis
* Visualização por dia, semana e mês

---

## 🟡 EPIC 8 — Configurações

### 🧩 US-021 — Definir horas disponíveis

**Como** dono/gestor
**Quero** configurar horas disponíveis
**Para** calcular eficiência

**Prioridade:** Média

**Critérios de Aceitação:**

* Pode ser por usuário ou organização

---

## 🔵 Sugestão de MVP (Sprint inicial)

Entregar primeiro:

* US-001 a US-006 (estrutura)
* US-008, 010 (tarefas)
* US-011, 012 (tempo)
* US-015, 016 (dashboard básico)
* US-017 (relatório simples)
* US-018, 019, 020 (gestor)

---

## 🚀 Observação importante

Esse backlog já está pronto para:

* Jira
* Notion
* GitHub Projects
* Ou alimentar uma IA (Cursor/Cline)

---

