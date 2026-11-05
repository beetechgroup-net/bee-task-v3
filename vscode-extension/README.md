# BeeTask para VS Code 🐝⏱️

Extensão oficial do **BeeTask** para o Visual Studio Code. Gerencie suas demandas e rastreie o tempo trabalhado diretamente do seu editor de código, sem precisar alternar para o navegador.

---

## ✨ Recursos

- **⏱️ Cronômetro em Tempo Real:** Acompanhe o tempo trabalhado na tarefa ativa direto na Barra de Status (rodapé do VS Code).
- **🛑 Pausa Automática por Inatividade (10min):** Se você se ausentar do VS Code por mais de 10 minutos com uma tarefa rodando, a extensão pausa o cronômetro automaticamente e pergunta se você ainda está trabalhando nela ao retornar.
- **📋 Painel de Tarefas na Barra Lateral:** Visualize rapidamente suas tarefas pendentes, em execução e concluídas na aba BeeTask.
- **▶️ Play / ⏸️ Pause com 1 Clique:** Inicie e pause o cronômetro das suas tarefas direto do VS Code.
- **➕ Criação Rápida de Tarefas:** Crie novas tarefas associadas a projetos e categorias sem sair do editor.
- **✨ Criação com IA (Qwen Local):** Descreva a demanda em linguagem natural e o Qwen estrutura título, projeto e categoria automaticamente.
- **🌐 Acesso Direto:** Abra a tarefa no navegador web com um clique.

---

## 🚀 Como Instalar

### Opção 1: Instalação via arquivo `.vsix` (Recomendado)

1. No terminal, dentro da pasta `vscode-extension`, gere o pacote:
   ```bash
   npm run package
   ```
   *(Ou baixe o arquivo `beetask-vscode-1.0.0.vsix` pré-compilado).*

2. Instale no seu VS Code:
   - **Pelo Terminal:**
     ```bash
     code --install-extension beetask-vscode-1.0.0.vsix
     ```
   - **Pela Interface:**
     Abra o VS Code, vá na aba de Extensões (`Ctrl+Shift+X`), clique nos três pontinhos (`...`) no canto superior e selecione **"Install from VSIX..."** (*Instalar a partir de VSIX...*).

### Opção 2: Modo Desenvolvimento (Testar agora)

1. Abra a pasta `vscode-extension` no VS Code.
2. Execute `npm install`.
3. Pressione **`F5`** para iniciar a depuração em uma janela de testes.

---

## 🔑 Primeiro Acesso (Login)

1. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac) e digite:
   ```
   BeeTask: Conectar Conta (Login)
   ```
2. Informe:
   - **URL da API:** Padrão `https://api-task.beetech.dev`
   - **Email:** Seu email de acesso
   - **Senha:** Sua senha do BeeTask
3. Se você fizer parte de mais de uma organização, a extensão solicitará que escolha a organização ativa.

---

## ⌨️ Comandos Disponíveis (`Ctrl+Shift+P`)

| Comando | Descrição |
|---|---|
| `BeeTask: Iniciar Tarefa (Play)` | Seleciona e inicia o cronômetro de uma tarefa |
| `BeeTask: Pausar Tarefa (Pause)` | Pausa a contagem de tempo da tarefa ativa |
| `BeeTask: Concluir Tarefa` | Marca a tarefa como concluída |
| `BeeTask: Nova Tarefa` | Cria uma nova tarefa com título, projeto e categoria |
| `BeeTask: Criar Tarefa com IA` | Usa IA para interpretar texto livre e criar a tarefa |
| `BeeTask: Selecionar Organização` | Troca a organização de trabalho |
| `BeeTask: Atualizar Lista de Tarefas` | Recarrega as tarefas do servidor |
| `BeeTask: Abrir no Navegador` | Abre o BeeTask no seu navegador padrão |
| `BeeTask: Desconectar (Logout)` | Remove as credenciais salvas |

---

## ⚙️ Configurações

Acesse `Configurações` (`Ctrl+,`) e busque por `BeeTask`:

- `beetask.serverUrl`: URL da API backend (Padrão: `https://api-task.beetech.dev`).
- `beetask.webUrl`: URL do site web (Padrão: `https://task.beetech.dev`).
- `beetask.refreshIntervalSeconds`: Intervalo de sincronização automática em segundos (Padrão: `30`).
- `beetask.enableIdleDetection`: Ativar pausa automática da tarefa por inatividade (Padrão: `true`).
- `beetask.idleTimeoutMinutes`: Tempo limite de inatividade em minutos (Padrão: `10`).
