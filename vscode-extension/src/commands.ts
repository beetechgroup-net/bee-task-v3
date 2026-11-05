import * as vscode from 'vscode';
import { BeeTaskApiClient } from './api';
import { AuthManager } from './authManager';
import { StatusBarManager } from './statusBarManager';
import { TaskTreeProvider, TaskTreeItem } from './taskTreeProvider';
import { Task } from './types';

export function registerCommands(
  context: vscode.ExtensionContext,
  api: BeeTaskApiClient,
  authManager: AuthManager,
  statusBar: StatusBarManager,
  treeProvider: TaskTreeProvider
): void {
  // 1. LOGIN
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.login', async () => {
      const config = vscode.workspace.getConfiguration('beetask');
      const defaultUrl = config.get<string>('serverUrl', 'https://api-task.beetech.dev');

      const serverUrl = await vscode.window.showInputBox({
        prompt: 'URL da API do BeeTask',
        value: defaultUrl,
        ignoreFocusOut: true,
      });
      if (!serverUrl) return;

      if (serverUrl !== defaultUrl) {
        await config.update('serverUrl', serverUrl, vscode.ConfigurationTarget.Global);
      }

      const email = await vscode.window.showInputBox({
        prompt: 'Email de acesso ao BeeTask',
        placeHolder: 'seu.email@empresa.com',
        ignoreFocusOut: true,
      });
      if (!email) return;

      const password = await vscode.window.showInputBox({
        prompt: 'Sua senha',
        password: true,
        ignoreFocusOut: true,
      });
      if (!password) return;

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Autenticando no BeeTask...',
            cancellable: false,
          },
          async () => {
            const loginRes = await api.login(email.trim(), password);
            vscode.window.showInformationMessage(`Conectado com sucesso como ${loginRes.name || loginRes.email}!`);
          }
        );

        await refreshAll(api, authManager, statusBar, treeProvider);

        // Prompt org selection if multiple
        const orgs = authManager.getOrganizations();
        if (orgs.length > 1) {
          await vscode.commands.executeCommand('beetask.selectOrg');
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Falha no login: ${err.message}`);
      }
    })
  );

  // 2. LOGOUT
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.logout', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Deseja realmente desconectar sua conta do BeeTask?',
        'Sim, Desconectar',
        'Cancelar'
      );
      if (confirm === 'Sim, Desconectar') {
        await authManager.clearAuth();
        statusBar.setActiveTask(null);
        treeProvider.refresh();
        vscode.window.showInformationMessage('Conta desconectada do BeeTask.');
      }
    })
  );

  // 3. SELECT ORGANIZATION
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.selectOrg', async () => {
      const orgs = authManager.getOrganizations();
      if (!orgs || orgs.length === 0) {
        vscode.window.showInformationMessage('Nenhuma organização encontrada.');
        return;
      }

      const activeId = authManager.getActiveOrgId();
      const items = orgs.map(o => ({
        label: o.name,
        description: o.id === activeId ? '(Ativa)' : '',
        orgId: o.id,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Selecione a Organização ativa',
      });

      if (selected) {
        await authManager.setActiveOrgId(selected.orgId);
        vscode.window.showInformationMessage(`Organização ativa alterada para: ${selected.label}`);
        await refreshAll(api, authManager, statusBar, treeProvider);
      }
    })
  );

  // 4. REFRESH TASKS
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.refreshTasks', async () => {
      await refreshAll(api, authManager, statusBar, treeProvider);
      vscode.window.setStatusBarMessage('BeeTask: Tarefas atualizadas.', 2000);
    })
  );

  // 5. START TASK (PLAY)
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.startTask', async (arg?: Task | TaskTreeItem) => {
      let task: Task | undefined;
      if (arg && 'task' in arg && arg.task) {
        task = arg.task;
      } else if (arg && 'id' in arg) {
        task = arg as Task;
      }

      if (!task) {
        // Show pick of pending tasks
        const tasks = treeProvider.getTasks().filter(t => t.status !== 'COMPLETED');
        if (tasks.length === 0) {
          vscode.window.showInformationMessage('Nenhuma tarefa pendente encontrada.');
          return;
        }

        const picked = await vscode.window.showQuickPick(
          tasks.map(t => ({
            label: `#${t.id} ${t.title}`,
            description: t.project?.name || '',
            task: t,
          })),
          { placeHolder: 'Selecione a tarefa para iniciar o cronômetro' }
        );
        if (!picked) return;
        task = picked.task;
      }

      try {
        await api.startTask(task.id);
        vscode.window.showInformationMessage(`▶️ Iniciada: #${task.id} ${task.title}`);
        await refreshAll(api, authManager, statusBar, treeProvider);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Falha ao iniciar tarefa: ${err.message}`);
      }
    })
  );

  // 6. STOP TASK (PAUSE)
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.stopTask', async (arg?: Task | TaskTreeItem) => {
      let task: Task | null = null;
      if (arg && 'task' in arg && arg.task) {
        task = arg.task;
      } else if (arg && 'id' in arg) {
        task = arg as Task;
      } else {
        task = statusBar.getActiveTask();
      }

      if (!task) {
        vscode.window.showInformationMessage('Nenhuma tarefa em execução para pausar.');
        return;
      }

      try {
        await api.stopTask(task.id);
        vscode.window.showInformationMessage(`⏸️ Pausada: #${task.id} ${task.title}`);
        await refreshAll(api, authManager, statusBar, treeProvider);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Falha ao pausar tarefa: ${err.message}`);
      }
    })
  );

  // 7. COMPLETE TASK
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.completeTask', async (arg?: Task | TaskTreeItem) => {
      let task: Task | undefined;
      if (arg && 'task' in arg && arg.task) {
        task = arg.task;
      } else if (arg && 'id' in arg) {
        task = arg as Task;
      } else {
        const active = statusBar.getActiveTask();
        if (active) task = active;
      }

      if (!task) {
        const tasks = treeProvider.getTasks().filter(t => t.status !== 'COMPLETED');
        const picked = await vscode.window.showQuickPick(
          tasks.map(t => ({ label: `#${t.id} ${t.title}`, task: t })),
          { placeHolder: 'Selecione a tarefa a ser concluída' }
        );
        if (!picked) return;
        task = picked.task;
      }

      try {
        await api.updateStatus(task.id, 'COMPLETED');
        vscode.window.showInformationMessage(`✔️ Tarefa #${task.id} concluída com sucesso!`);
        await refreshAll(api, authManager, statusBar, treeProvider);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Falha ao concluir tarefa: ${err.message}`);
      }
    })
  );

  // 8. CREATE TASK (STANDARD)
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.createTask', async () => {
      const orgId = authManager.getActiveOrgId();
      if (!orgId) {
        vscode.window.showWarningMessage('Selecione uma organização primeiro.');
        return;
      }

      const title = await vscode.window.showInputBox({
        prompt: 'Título da Nova Tarefa',
        placeHolder: 'Ex: Desenvolver componente de busca',
        ignoreFocusOut: true,
      });
      if (!title?.trim()) return;

      const description = await vscode.window.showInputBox({
        prompt: 'Descrição (opcional)',
        placeHolder: 'Critérios de aceitação, notas ou escopo...',
      });

      // Optional project selection
      let selectedProjectId: number | undefined;
      const projects = await api.listProjects(orgId);
      if (projects.length > 0) {
        const projPick = await vscode.window.showQuickPick(
          [{ label: '(Nenhum projeto)', id: undefined }, ...projects.map(p => ({ label: p.name, id: p.id }))],
          { placeHolder: 'Vincular a um Projeto? (opcional)' }
        );
        if (projPick && projPick.id) {
          selectedProjectId = projPick.id;
        }
      }

      // Optional category selection
      let selectedCategoryId: number | undefined;
      const categories = await api.listCategories(orgId);
      if (categories.length > 0) {
        const catPick = await vscode.window.showQuickPick(
          [{ label: '(Nenhuma categoria)', id: undefined }, ...categories.map(c => ({ label: c.name, id: c.id }))],
          { placeHolder: 'Vincular a uma Categoria? (opcional)' }
        );
        if (catPick && catPick.id) {
          selectedCategoryId = catPick.id;
        }
      }

      try {
        const created = await api.createTask({
          title: title.trim(),
          description: description?.trim() || undefined,
          organizationId: orgId,
          projectId: selectedProjectId,
          categoryId: selectedCategoryId,
        });

        vscode.window.showInformationMessage(`Tarefa #${created.id} criada com sucesso!`);
        await refreshAll(api, authManager, statusBar, treeProvider);

        const startNow = await vscode.window.showInformationMessage(
          `Deseja iniciar o cronômetro para #${created.id} agora?`,
          'Sim, Iniciar',
          'Não'
        );
        if (startNow === 'Sim, Iniciar') {
          await api.startTask(created.id);
          await refreshAll(api, authManager, statusBar, treeProvider);
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Falha ao criar tarefa: ${err.message}`);
      }
    })
  );

  // 9. CREATE TASK WITH AI
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.createTaskAi', async () => {
      const orgId = authManager.getActiveOrgId();
      if (!orgId) {
        vscode.window.showWarningMessage('Selecione uma organização primeiro.');
        return;
      }

      const prompt = await vscode.window.showInputBox({
        prompt: 'Descreva a tarefa em linguagem natural para o Qwen',
        placeHolder: 'Ex: Corrigir lentidão no relatório PDF, categoria Bugfix e vincular ao projeto BeeTask',
        ignoreFocusOut: true,
      });
      if (!prompt?.trim()) return;

      try {
        let parsed: any;
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Interpretando tarefa com IA (Qwen local)...',
            cancellable: false,
          },
          async () => {
            parsed = await api.parseTaskWithAi(orgId, prompt.trim());
          }
        );

        if (!parsed || !parsed.title) {
          vscode.window.showWarningMessage('Não foi possível interpretar os dados com a IA.');
          return;
        }

        // Preview confirmation
        const confirmMsg = `Criar tarefa: "${parsed.title}"?`;
        const action = await vscode.window.showInformationMessage(
          confirmMsg,
          { modal: false, detail: parsed.description || 'Sem descrição' },
          'Criar Tarefa',
          'Editar Título Antes',
          'Cancelar'
        );

        if (action === 'Cancelar' || !action) return;

        let finalTitle = parsed.title;
        if (action === 'Editar Título Antes') {
          const edited = await vscode.window.showInputBox({
            prompt: 'Editar título',
            value: parsed.title,
          });
          if (!edited?.trim()) return;
          finalTitle = edited.trim();
        }

        const created = await api.createTask({
          title: finalTitle,
          description: parsed.description,
          organizationId: orgId,
          projectId: parsed.projectId,
          categoryId: parsed.categoryId,
        });

        vscode.window.showInformationMessage(`✨ Tarefa #${created.id} criada via IA!`);
        await refreshAll(api, authManager, statusBar, treeProvider);

        const startNow = await vscode.window.showInformationMessage(
          `Deseja iniciar o cronômetro para #${created.id}?`,
          'Sim, Iniciar',
          'Não'
        );
        if (startNow === 'Sim, Iniciar') {
          await api.startTask(created.id);
          await refreshAll(api, authManager, statusBar, treeProvider);
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Falha na criação com IA: ${err.message}`);
      }
    })
  );

  // 10. OPEN IN BROWSER
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.openInBrowser', async (arg?: Task | TaskTreeItem) => {
      const config = vscode.workspace.getConfiguration('beetask');
      const webUrl = config.get<string>('webUrl', 'https://task.beetech.dev').replace(/\/+$/, '');

      let targetUrl = `${webUrl}/tasks`;
      if (arg && 'task' in arg && arg.task?.id) {
        targetUrl = `${webUrl}/tasks?taskId=${arg.task.id}`;
      } else if (arg && 'id' in arg) {
        targetUrl = `${webUrl}/tasks?taskId=${(arg as Task).id}`;
      }

      await vscode.env.openExternal(vscode.Uri.parse(targetUrl));
    })
  );

  // 11. QUICK MENU (Status Bar Click)
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.quickMenu', async () => {
      const isAuth = await authManager.isAuthenticated();
      if (!isAuth) {
        await vscode.commands.executeCommand('beetask.login');
        return;
      }

      const activeTask = statusBar.getActiveTask();
      const items: vscode.QuickPickItem[] = [];

      if (activeTask) {
        items.push({
          label: `$(debug-pause) Pausar Tarefa Ativa (#${activeTask.id})`,
          description: activeTask.title,
          detail: 'Pausa o cronômetro e salva o tempo trabalhado',
        });
        items.push({
          label: `$(check) Concluir Tarefa Ativa (#${activeTask.id})`,
          description: activeTask.title,
          detail: 'Marca a tarefa como COMPLETED e para o cronômetro',
        });
        items.push({
          label: `$(link-external) Abrir Tarefa Ativa no Navegador`,
        });
      }

      items.push({
        label: `$(play) Iniciar Outra Tarefa...`,
        detail: 'Escolha uma tarefa pendente para cronometrar',
      });
      items.push({
        label: `$(plus) Criar Nova Tarefa`,
        detail: 'Cria uma nova demanda no BeeTask',
      });
      items.push({
        label: `$(sparkle) Criar Tarefa com IA`,
        detail: 'Usa o Qwen local para estruturar uma demanda em linguagem natural',
      });
      items.push({
        label: `$(organization) Trocar Organização (${authManager.getActiveOrgName() || 'Nenhuma'})`,
      });
      items.push({
        label: `$(refresh) Atualizar Lista de Tarefas`,
      });
      items.push({
        label: `$(sign-out) Desconectar Conta`,
      });

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: activeTask
          ? `Tarefa em andamento: #${activeTask.id} ${activeTask.title}`
          : 'BeeTask - Nenhuma tarefa em execução',
      });

      if (!picked) return;

      if (picked.label.includes('Pausar Tarefa Ativa')) {
        await vscode.commands.executeCommand('beetask.stopTask');
      } else if (picked.label.includes('Concluir Tarefa Ativa')) {
        await vscode.commands.executeCommand('beetask.completeTask');
      } else if (picked.label.includes('Abrir Tarefa Ativa')) {
        await vscode.commands.executeCommand('beetask.openInBrowser', activeTask);
      } else if (picked.label.includes('Iniciar Outra Tarefa')) {
        await vscode.commands.executeCommand('beetask.startTask');
      } else if (picked.label.includes('Criar Nova Tarefa')) {
        await vscode.commands.executeCommand('beetask.createTask');
      } else if (picked.label.includes('Criar Tarefa com IA')) {
        await vscode.commands.executeCommand('beetask.createTaskAi');
      } else if (picked.label.includes('Trocar Organização')) {
        await vscode.commands.executeCommand('beetask.selectOrg');
      } else if (picked.label.includes('Atualizar')) {
        await vscode.commands.executeCommand('beetask.refreshTasks');
      } else if (picked.label.includes('Desconectar')) {
        await vscode.commands.executeCommand('beetask.logout');
      }
    })
  );

  // 12. ITEM CLICK HANDLER
  context.subscriptions.push(
    vscode.commands.registerCommand('beetask.selectTaskItem', async (task: Task) => {
      const isRunning = task.history && task.history.some(h => h.startAt && !h.endAt);

      const items: vscode.QuickPickItem[] = [];
      if (isRunning) {
        items.push({
          label: '$(debug-pause) Pausar Cronômetro',
          detail: 'Para o tempo da tarefa',
        });
      } else if (task.status !== 'COMPLETED') {
        items.push({
          label: '$(play) Iniciar Cronômetro',
          detail: 'Começa a cronometrar o tempo desta tarefa',
        });
      }

      if (task.status !== 'COMPLETED') {
        items.push({
          label: '$(check) Marcar como Concluída',
        });
      }

      items.push({
        label: '$(link-external) Ver no Navegador',
      });

      const choice = await vscode.window.showQuickPick(items, {
        placeHolder: `#${task.id} ${task.title}`,
      });

      if (!choice) return;

      if (choice.label.includes('Iniciar')) {
        await vscode.commands.executeCommand('beetask.startTask', task);
      } else if (choice.label.includes('Pausar')) {
        await vscode.commands.executeCommand('beetask.stopTask', task);
      } else if (choice.label.includes('Concluída')) {
        await vscode.commands.executeCommand('beetask.completeTask', task);
      } else if (choice.label.includes('Ver no Navegador')) {
        await vscode.commands.executeCommand('beetask.openInBrowser', task);
      }
    })
  );
}

async function refreshAll(
  api: BeeTaskApiClient,
  authManager: AuthManager,
  statusBar: StatusBarManager,
  treeProvider: TaskTreeProvider
): Promise<void> {
  const isAuth = await authManager.isAuthenticated();
  if (!isAuth) {
    statusBar.setActiveTask(null);
    treeProvider.refresh();
    return;
  }

  treeProvider.refresh();

  try {
    const orgId = authManager.getActiveOrgId();
    const tasks = await api.listMyTasks(orgId);
    let activeTask: Task | null = null;
    for (const t of tasks) {
      if (t.history && t.history.some(h => h.startAt && !h.endAt)) {
        activeTask = t;
        break;
      }
    }
    statusBar.setActiveTask(activeTask);
  } catch (_) {
    statusBar.setActiveTask(null);
  }
}
