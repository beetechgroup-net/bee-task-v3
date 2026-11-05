import * as vscode from 'vscode';
import { Task } from './types';
import { BeeTaskApiClient } from './api';
import { AuthManager } from './authManager';

export type TreeItemType = 'category' | 'task';

export class TaskTreeItem extends vscode.TreeItem {
  public task?: Task;

  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    task?: Task,
    contextValue?: string
  ) {
    super(label, collapsibleState);
    this.task = task;
    if (contextValue) {
      this.contextValue = contextValue;
    }
  }
}

export class TaskTreeProvider implements vscode.TreeDataProvider<TaskTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TaskTreeItem | undefined | null | void> =
    new vscode.EventEmitter<TaskTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TaskTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private tasks: Task[] = [];
  private activeTaskId: number | null = null;
  private api: BeeTaskApiClient;
  private authManager: AuthManager;

  constructor(api: BeeTaskApiClient, authManager: AuthManager) {
    this.api = api;
    this.authManager = authManager;
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: TaskTreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: TaskTreeItem): Promise<TaskTreeItem[]> {
    const isAuth = await this.authManager.isAuthenticated();
    if (!isAuth) {
      const loginItem = new TaskTreeItem(
        'Clique aqui para conectar sua conta BeeTask...',
        vscode.TreeItemCollapsibleState.None
      );
      loginItem.iconPath = new vscode.ThemeIcon('sign-in');
      loginItem.command = {
        command: 'beetask.login',
        title: 'Conectar Conta',
      };
      return [loginItem];
    }

    if (!element) {
      // Root level - Fetch tasks
      try {
        const orgId = this.authManager.getActiveOrgId();
        this.tasks = await this.api.listMyTasks(orgId);
      } catch (err: any) {
        const errorItem = new TaskTreeItem(
          `Erro ao carregar: ${err.message}`,
          vscode.TreeItemCollapsibleState.None
        );
        errorItem.iconPath = new vscode.ThemeIcon('error');
        return [errorItem];
      }

      // Check which task is running (has ongoing history without endAt)
      this.activeTaskId = null;
      for (const t of this.tasks) {
        if (t.history && t.history.some(h => h.startAt && !h.endAt)) {
          this.activeTaskId = t.id;
          break;
        }
      }

      const items: TaskTreeItem[] = [];

      // Section 1: Running
      const runningTasks = this.tasks.filter(t => t.id === this.activeTaskId);
      if (runningTasks.length > 0) {
        const secRunning = new TaskTreeItem(
          `⏱️ EM EXECUÇÃO (${runningTasks.length})`,
          vscode.TreeItemCollapsibleState.Expanded
        );
        items.push(secRunning);
      }

      // Section 2: Pending / In Progress
      const pendingTasks = this.tasks.filter(
        t => t.id !== this.activeTaskId && t.status !== 'COMPLETED' && t.status !== 'CANCELED'
      );
      const secPending = new TaskTreeItem(
        `📋 A FAZER (${pendingTasks.length})`,
        vscode.TreeItemCollapsibleState.Expanded
      );
      items.push(secPending);

      // Section 3: Completed
      const completedTasks = this.tasks.filter(t => t.status === 'COMPLETED');
      if (completedTasks.length > 0) {
        const secCompleted = new TaskTreeItem(
          `✅ CONCLUÍDAS (${completedTasks.length})`,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        items.push(secCompleted);
      }

      return items;
    }

    // Children of sections
    if (element.label?.toString().startsWith('⏱️ EM EXECUÇÃO')) {
      const runningTasks = this.tasks.filter(t => t.id === this.activeTaskId);
      return runningTasks.map(t => this.createTaskItem(t, true));
    }

    if (element.label?.toString().startsWith('📋 A FAZER')) {
      const pendingTasks = this.tasks.filter(
        t => t.id !== this.activeTaskId && t.status !== 'COMPLETED' && t.status !== 'CANCELED'
      );
      if (pendingTasks.length === 0) {
        const emptyItem = new TaskTreeItem('Nenhuma tarefa pendente', vscode.TreeItemCollapsibleState.None);
        emptyItem.iconPath = new vscode.ThemeIcon('check');
        return [emptyItem];
      }
      return pendingTasks.map(t => this.createTaskItem(t, false));
    }

    if (element.label?.toString().startsWith('✅ CONCLUÍDAS')) {
      const completedTasks = this.tasks.filter(t => t.status === 'COMPLETED');
      return completedTasks.map(t => this.createTaskItem(t, false));
    }

    return [];
  }

  private createTaskItem(task: Task, isRunning: boolean): TaskTreeItem {
    const item = new TaskTreeItem(
      `#${task.id} ${task.title}`,
      vscode.TreeItemCollapsibleState.None,
      task
    );

    const parts: string[] = [];
    if (task.project?.name) parts.push(task.project.name);
    if (task.category?.name) parts.push(task.category.name);
    item.description = parts.join(' • ');

    if (isRunning) {
      item.iconPath = new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.green'));
      item.contextValue = 'task-running';
    } else if (task.status === 'COMPLETED') {
      item.iconPath = new vscode.ThemeIcon('pass', new vscode.ThemeColor('charts.green'));
      item.contextValue = 'task-completed';
    } else if (task.status === 'IN_PROGRESS') {
      item.iconPath = new vscode.ThemeIcon('play-circle', new vscode.ThemeColor('charts.yellow'));
      item.contextValue = 'task-stopped';
    } else {
      item.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.blue'));
      item.contextValue = 'task-not-started';
    }

    // Tooltip
    const tooltip = new vscode.MarkdownString();
    tooltip.appendMarkdown(`**#${task.id} ${task.title}**\n\n`);
    if (task.description) {
      tooltip.appendMarkdown(`${task.description}\n\n`);
    }
    tooltip.appendMarkdown(`- **Status:** ${task.status}\n`);
    if (task.project?.name) tooltip.appendMarkdown(`- **Projeto:** ${task.project.name}\n`);
    if (task.category?.name) tooltip.appendMarkdown(`- **Categoria:** ${task.category.name}\n`);
    item.tooltip = tooltip;

    // Command when item is clicked: show quick options
    item.command = {
      command: 'beetask.selectTaskItem',
      title: 'Opções da Tarefa',
      arguments: [task],
    };

    return item;
  }

  public getTasks(): Task[] {
    return this.tasks;
  }

  public getActiveTask(): Task | null {
    if (!this.activeTaskId) return null;
    return this.tasks.find(t => t.id === this.activeTaskId) || null;
  }
}
