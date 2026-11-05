import * as vscode from 'vscode';
import { BeeTaskApiClient } from './api';
import { AuthManager } from './authManager';
import { StatusBarManager } from './statusBarManager';
import { TaskTreeProvider } from './taskTreeProvider';
import { Task } from './types';

export class IdleDetector implements vscode.Disposable {
  private lastActivityTime: number = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private isPrompting: boolean = false;
  private disposables: vscode.Disposable[] = [];

  private api: BeeTaskApiClient;
  private authManager: AuthManager;
  private statusBar: StatusBarManager;
  private treeProvider: TaskTreeProvider;

  constructor(
    api: BeeTaskApiClient,
    authManager: AuthManager,
    statusBar: StatusBarManager,
    treeProvider: TaskTreeProvider
  ) {
    this.api = api;
    this.authManager = authManager;
    this.statusBar = statusBar;
    this.treeProvider = treeProvider;

    this.registerActivityListeners();
    this.startPeriodicCheck();
  }

  public recordActivity(): void {
    this.lastActivityTime = Date.now();
  }

  private registerActivityListeners(): void {
    // 1. Digitação ou alteração de código
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(() => this.recordActivity())
    );

    // 2. Movimentação de cursor ou seleção de texto
    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection(() => this.recordActivity())
    );

    // 3. Troca de arquivo / aba ativa
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(() => this.recordActivity())
    );

    // 4. Rolagem da página (scroll)
    this.disposables.push(
      vscode.window.onDidChangeTextEditorVisibleRanges(() => this.recordActivity())
    );

    // 5. Salvamento de arquivo
    this.disposables.push(
      vscode.workspace.onDidSaveTextDocument(() => this.recordActivity())
    );

    // 6. Janela do VS Code ganhou foco
    this.disposables.push(
      vscode.window.onDidChangeWindowState((state) => {
        if (state.focused) {
          this.recordActivity();
        }
      })
    );
  }

  private startPeriodicCheck(): void {
    // Checa a cada 15 segundos
    this.checkInterval = setInterval(async () => {
      await this.checkIdleStatus();
    }, 15000);
  }

  private async checkIdleStatus(): Promise<void> {
    const config = vscode.workspace.getConfiguration('beetask');
    const enabled = config.get<boolean>('enableIdleDetection', true);
    const timeoutMinutes = config.get<number>('idleTimeoutMinutes', 10);

    if (!enabled || timeoutMinutes <= 0) {
      return;
    }

    const activeTask = this.statusBar.getActiveTask();
    if (!activeTask) {
      // Se não há tarefa rodando, mantém o relógio zerado para a próxima
      this.lastActivityTime = Date.now();
      return;
    }

    if (this.isPrompting) {
      return;
    }

    const idleMillis = Date.now() - this.lastActivityTime;
    const idleMinutes = idleMillis / 60000;

    if (idleMinutes >= timeoutMinutes) {
      await this.handleIdlePause(activeTask, timeoutMinutes);
    }
  }

  private async handleIdlePause(task: Task, timeoutMinutes: number): Promise<void> {
    this.isPrompting = true;
    console.log(`[BeeTask] Inatividade de ${timeoutMinutes}min detectada. Pausando tarefa #${task.id}...`);

    try {
      // 1. Pausa imediatamente a tarefa no servidor
      await this.api.stopTask(task.id);
      this.statusBar.setActiveTask(null);
      this.treeProvider.refresh();

      // 2. Pergunta ao usuário se ele ainda está trabalhando nela
      const question = `Você ainda está trabalhando na tarefa #${task.id} - ${task.title}?`;
      const choice = await vscode.window.showWarningMessage(
        question,
        { modal: false },
        'Sim',
        'Não'
      );

      if (choice === 'Sim') {
        // Usuário confirmou que ainda está trabalhando -> retoma a tarefa
        await this.api.startTask(task.id);
        vscode.window.showInformationMessage(`▶️ Tarefa #${task.id} retomada!`);
      } else {
        // Clicou "Não" ou fechou a notificação -> mantém pausada
        vscode.window.showInformationMessage(`⏸️ Tarefa #${task.id} mantida pausada.`);
      }
    } catch (err: any) {
      console.error('[BeeTask] Erro ao processar pausa por inatividade:', err);
    } finally {
      // Reinicia o relógio de atividade para não dar loop
      this.recordActivity();
      this.isPrompting = false;

      // Sincroniza estado visual final
      try {
        const orgId = this.authManager.getActiveOrgId();
        const tasks = await this.api.listMyTasks(orgId);
        let runningTask = null;
        for (const t of tasks) {
          if (t.history && t.history.some(h => h.startAt && !h.endAt)) {
            runningTask = t;
            break;
          }
        }
        this.statusBar.setActiveTask(runningTask);
        this.treeProvider.refresh();
      } catch (_) {}
    }
  }

  public dispose(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
}
