import * as vscode from 'vscode';
import { AuthManager } from './authManager';
import { BeeTaskApiClient } from './api';
import { StatusBarManager } from './statusBarManager';
import { TaskTreeProvider } from './taskTreeProvider';
import { IdleDetector } from './idleDetector';
import { registerCommands } from './commands';

let pollTimer: NodeJS.Timeout | null = null;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const authManager = new AuthManager(context);
  const api = new BeeTaskApiClient(authManager);
  const statusBar = new StatusBarManager();
  const treeProvider = new TaskTreeProvider(api, authManager);
  const idleDetector = new IdleDetector(api, authManager, statusBar, treeProvider);

  // Register Tree View & Status Bar & Idle Detector
  const treeView = vscode.window.createTreeView('beetask.tasksView', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);
  context.subscriptions.push(statusBar);
  context.subscriptions.push(idleDetector);

  // Register Commands
  registerCommands(context, api, authManager, statusBar, treeProvider, idleDetector);

  // Initial Sync
  if (await authManager.isAuthenticated()) {
    await vscode.commands.executeCommand('beetask.refreshTasks');
  }

  // Periodic Auto-refresh
  const config = vscode.workspace.getConfiguration('beetask');
  const intervalSec = config.get<number>('refreshIntervalSeconds', 30);
  if (intervalSec > 5) {
    pollTimer = setInterval(async () => {
      if (await authManager.isAuthenticated()) {
        try {
          const orgId = authManager.getActiveOrgId();
          const tasks = await api.listMyTasks(orgId);
          let runningTask = null;
          for (const t of tasks) {
            if (t.history && t.history.some(h => h.startAt && !h.endAt)) {
              runningTask = t;
              break;
            }
          }
          statusBar.setActiveTask(runningTask);
          treeProvider.refresh();
        } catch (_) {
          // Silent polling error
        }
      }
    }, intervalSec * 1000);
  }

  console.log('BeeTask VS Code extension activated successfully.');
}

export function deactivate(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
