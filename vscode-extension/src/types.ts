export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export interface TaskHistoryItem {
  id?: number;
  startAt: string;
  endAt?: string | null;
  elapsedSeconds?: number | null;
}

export interface Project {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

export interface TaskUser {
  id: number;
  name: string;
  email: string;
  photo?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  project?: Project;
  category?: Category;
  user?: TaskUser;
  createdBy?: TaskUser;
  finishedAt?: string;
  history?: TaskHistoryItem[];
  externalUrl?: string;
}

export interface Organization {
  id: number;
  name: string;
  roles?: string[];
}

export interface LoginResponse {
  name: string;
  email: string;
  photo?: string;
  jwt: string;
  refreshToken?: string;
  expiresIn?: number;
  issuedAt?: string;
  organizations?: Organization[];
}

export interface ParsedAiTask {
  title: string;
  description: string;
  projectId?: number;
  categoryId?: number;
  assigneeUserId?: number;
  externalUrl?: string;
  status?: TaskStatus;
}
