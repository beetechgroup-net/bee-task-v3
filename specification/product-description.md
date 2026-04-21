# 📄 PRD — Sistema de Gestão de Tempo e Tarefas

## 🧭 Nome do Projeto

TimeTrack (nome provisório)

---

## 🎯 Objetivo

Permitir que colaboradores registrem e acompanhem o tempo gasto em tarefas, enquanto gestores e donos da organização monitoram produtividade, alocação de tempo e eficiência operacional.

---

## 👥 Atores do Sistema

### 🔹 Dono (Owner)

* Nível mais alto da organização
* Responsável por gerenciar usuários e estrutura

### 🔹 Gestor (Manager)

* Acompanha desempenho do time
* Analisa métricas e relatórios

### 🔹 Colaborador (Employee)

* Registra tarefas
* Controla tempo de trabalho

---

## 🏢 Estrutura Organizacional

* O sistema deve suportar múltiplas organizações
* Cada organização contém:

  * Dono (1)
  * Gestores (N)
  * Colaboradores (N)

### Regras:

* Apenas o Dono pode:

  * Adicionar Gestores e Colaboradores
  * Aprovar pedidos de entrada na organização
* Colaboradores podem solicitar participação em uma organização

---

## 🧩 Funcionalidades Principais

### 👨‍💻 Colaborador

#### Registro de tarefas

* Criar tarefa com:

  * Nome
  * Descrição
  * Categoria
  * Projeto
  * Status (ex: aberta, em andamento, concluída)

#### Controle de tempo

* Iniciar tarefa
* Pausar tarefa
* Retomar tarefa
* Finalizar tarefa

#### Relatórios

* Relatório mensal:

  * Horas trabalhadas por mês
  * Agrupamento por categoria
  * Agrupamento por projeto

#### Dashboard diário

* Tarefas trabalhadas no dia anterior
* Tarefas abertas (planejamento do dia atual)

---

### 📊 Gestor

#### Monitoramento de equipe

* Tempo gasto por colaborador em tarefas
* Tempo gasto por projeto

#### Métricas de produtividade

* Relação:

  * Horas trabalhadas / horas disponíveis
* Visualização por:

  * Dia
  * Semana
  * Mês

---

### 👑 Dono

#### Gestão de usuários

* Criar colaboradores e gestores
* Aprovar solicitações de entrada

#### Gestão organizacional

* Criar e gerenciar organização
* Visão global de métricas (igual ou superior ao gestor)

---

## 🧠 Regras de Negócio

* Uma tarefa deve pertencer a:

  * Um colaborador
  * Um projeto
  * Uma categoria
* Uma tarefa pode ter múltiplos períodos de tempo (start/pause)
* O tempo total de uma tarefa = soma dos períodos ativos
* Apenas uma tarefa pode estar ativa por colaborador ao mesmo tempo (regra recomendada)
* Horas disponíveis podem ser:

  * Configuráveis por organização ou colaborador

### 📁 Projetos

* Um projeto pode ter:

  * Um ou mais gestores responsáveis
* Gestores associados a um projeto podem:

  * Visualizar métricas e tarefas relacionadas ao projeto
  * Acompanhar desempenho dos colaboradores naquele projeto

---

## 📊 Métricas e Indicadores

* Total de horas trabalhadas
* Horas por projeto
* Horas por categoria
* Eficiência:

  * horas trabalhadas / horas disponíveis
* Ranking de produtividade (opcional)

---

## 🗂️ Entidades Principais

* Organization
* User

  * role: OWNER | MANAGER | EMPLOYEE
* Project

  * relação N:N com gestores
* Task
* TimeEntry (períodos de tempo)
* Category
* MembershipRequest

---

## 🚫 Fora de Escopo (Inicial)

* Integração com folha de pagamento
* Controle financeiro
* Chat interno
* Notificações em tempo real
* App mobile (primeira versão web)

---

## ⚙️ Stack Sugerida (alinhada com seu perfil)

* Frontend: React + TypeScript
* Backend: Java + Quarkus
* Autenticação: Keycloak
* Banco: PostgreSQL

---

## 🔮 Possíveis Evoluções

* Integração com calendário (Google/Outlook)
* Alertas de produtividade
* IA para sugestão de tarefas
* Previsão de tempo de execução
* Relatórios avançados com BI

---

