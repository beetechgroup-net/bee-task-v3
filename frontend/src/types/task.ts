export type LegacyTaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  position: number;
  isDefault?: boolean;
  isCompleted?: boolean;
  isCanceled?: boolean;
  organizationId?: number;
  taskCount?: number;
}

export interface TaskHistoryItem {
  id: number;
  startAt: string;
  endAt: string | null;
  elapsedSeconds: number | null;
}

export interface Project {
  id: number;
  name: string;
  color?: string;
  icon?: string;
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
  status: string;
  taskStatus?: TaskStatus;
  project?: Project;
  category?: Category;
  user?: TaskUser;
  createdBy?: TaskUser;
  finishedAt?: string;
  history?: TaskHistoryItem[];
  externalUrl?: string;
}

export interface TaskHistoryItemInput {
  id?: number;
  startAt: string;
  endAt?: string | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: string;
  statusId?: number;
  organizationId: number;
  projectId?: number;
  categoryId?: number;
  assigneeUserId?: number;
  history?: TaskHistoryItemInput[];
  externalUrl?: string;
}

export interface ParsedAiTask {
  title: string;
  description: string;
  projectId?: number;
  categoryId?: number;
  assigneeUserId?: number;
  externalUrl?: string;
  status?: string;
}

export interface ListTasksFilter {
  organizationId?: number;
  text?: string;
  status?: string[];
  projectId?: number[];
  categoryId?: number[];
  userId?: number[];
}
