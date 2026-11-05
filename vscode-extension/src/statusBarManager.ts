import * as vscode from 'vscode';
import { Task } from './types';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private activeTask: Task | null = null;
  private timerInterval: NodeJS.Timeout | null = null;
  private baseSeconds: number = 0;
  private ongoingStartTime: number | null = null;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'beetask.quickMenu';
    this.updateIdle();
    this.statusBarItem.show();
  }

  public setActiveTask(task: Task | null): void {
    this.activeTask = task;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (!task) {
      this.updateIdle();
      return;
    }

    // Calculate elapsed seconds from history
    let finishedSec = 0;
    let ongoingStart: string | null = null;

    if (task.history && task.history.length > 0) {
      for (const h of task.history) {
        if (h.elapsedSeconds !== undefined && h.elapsedSeconds !== null) {
          finishedSec += h.elapsedSeconds;
        } else if (h.startAt && !h.endAt) {
          ongoingStart = h.startAt;
        }
      }
    }

    this.baseSeconds = finishedSec;
    if (ongoingStart) {
      this.ongoingStartTime = new Date(ongoingStart).getTime();
    } else {
      this.ongoingStartTime = Date.now();
    }

    this.renderActiveTick();
    this.timerInterval = setInterval(() => {
      this.renderActiveTick();
    }, 1000);
  }

  public getActiveTask(): Task | null {
    return this.activeTask;
  }

  private updateIdle(): void {
    this.statusBarItem.text = '$(clock) BeeTask';
    this.statusBarItem.tooltip = 'BeeTask: Nenhuma tarefa em execução. Clique para iniciar.';
    this.statusBarItem.backgroundColor = undefined;
  }

  private renderActiveTick(): void {
    if (!this.activeTask) return;

    let currentSeconds = this.baseSeconds;
    if (this.ongoingStartTime) {
      const live = Math.max(0, Math.floor((Date.now() - this.ongoingStartTime) / 1000));
      currentSeconds += live;
    }

    const timeFormatted = this.formatSeconds(currentSeconds);
    const shortTitle = this.activeTask.title.length > 25
      ? this.activeTask.title.substring(0, 22) + '...'
      : this.activeTask.title;

    this.statusBarItem.text = `$(play) [BeeTask] #${this.activeTask.id} ${shortTitle} (${timeFormatted})`;
    this.statusBarItem.tooltip = `Tarefa em execução: #${this.activeTask.id} - ${this.activeTask.title}\nTempo total: ${timeFormatted}\nClique para ver opções.`;
    this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  }

  private formatSeconds(totalSec: number): string {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  public dispose(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.statusBarItem.dispose();
  }
}
