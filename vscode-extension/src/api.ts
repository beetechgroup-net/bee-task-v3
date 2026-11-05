import * as vscode from 'vscode';
import { AuthManager } from './authManager';
import { Task, Project, Category, LoginResponse, TaskStatus, ParsedAiTask } from './types';

export class BeeTaskApiClient {
  private authManager: AuthManager;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
  }

  private getBaseUrl(): string {
    const config = vscode.workspace.getConfiguration('beetask');
    const url = config.get<string>('serverUrl', 'https://api-task.beetech.dev');
    return url.replace(/\/+$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const jwt = await this.authManager.getJwt();
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await this.authManager.clearAuth();
      vscode.window.showWarningMessage('Sessão do BeeTask expirada. Faça login novamente.');
      throw new Error('Não autenticado.');
    }

    if (!response.ok) {
      let errorText = '';
      try {
        const errJson = await response.json() as any;
        errorText = errJson.message || errJson.error || JSON.stringify(errJson);
      } catch (_) {
        errorText = await response.text();
      }
      throw new Error(`Erro na API (${response.status}): ${errorText || response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await this.authManager.saveAuth(data);
    return data;
  }

  public async listMyTasks(orgId?: number): Promise<Task[]> {
    const query = orgId ? `?organizationId=${orgId}` : '';
    return await this.request<Task[]>(`/tasks/mine${query}`, {
      method: 'GET',
    });
  }

  public async startTask(taskId: number): Promise<Task> {
    return await this.request<Task>(`/tasks/${taskId}/start`, {
      method: 'PUT',
    });
  }

  public async stopTask(taskId: number): Promise<Task> {
    return await this.request<Task>(`/tasks/${taskId}/stop`, {
      method: 'PUT',
    });
  }

  public async updateStatus(taskId: number, status: TaskStatus): Promise<Task> {
    return await this.request<Task>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    });
  }

  public async createTask(payload: {
    title: string;
    description?: string;
    organizationId: number;
    projectId?: number;
    categoryId?: number;
  }): Promise<Task> {
    return await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async parseTaskWithAi(organizationId: number, prompt: string): Promise<ParsedAiTask> {
    return await this.request<ParsedAiTask>('/tasks/ai/parse', {
      method: 'POST',
      body: JSON.stringify({ organizationId, prompt }),
    });
  }

  public async listProjects(orgId: number): Promise<Project[]> {
    try {
      return await this.request<Project[]>(`/organizations/${orgId}/projects`, {
        method: 'GET',
      });
    } catch (_) {
      return [];
    }
  }

  public async listCategories(orgId: number): Promise<Category[]> {
    try {
      return await this.request<Category[]>(`/organizations/${orgId}/categories`, {
        method: 'GET',
      });
    } catch (_) {
      return [];
    }
  }
}
