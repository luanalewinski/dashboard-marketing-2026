import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Tipos compartilhados ──────────────────────────────────────────────
export interface Subtask {
  id: string;
  taskId: string;
  name: string;
  status: string;
}

export interface ProductionLog {
  id: string;
  taskId: string;
  mode: 'ia' | 'hibrido' | 'manual';
  estimatedSavedMinutes: number;
  actualMinutes: number | null;
  closedAt: string;
}

export interface Task {
  id: string;
  campaignId: string;
  name: string;
  description: string | null;
  priority: 'alta' | 'media' | 'baixa';
  isOptional: boolean;
  dueDate: string | null;
  tags: string | null;
  clickupTaskId: string | null;
  status: string;
  subtasks: Subtask[];
  production?: ProductionLog | null;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string | null;
  sourceType: string;
  rawBrief: string;
  status: string;
  clickupListId: string | null;
  createdAt: string;
  tasks: Task[];
}

// ── Briefs / Campanhas ────────────────────────────────────────────────
export const briefsApi = {
  create: (rawBrief: string, sourceType = 'text') =>
    api.post<{ campaign: Campaign }>('/briefs', { rawBrief, sourceType }),

  list: () =>
    api.get<{ campaigns: Campaign[] }>('/briefs'),

  get: (id: string) =>
    api.get<{ campaign: Campaign }>(`/briefs/${id}`),

  interpret: (id: string) =>
    api.post<{ campaign: Campaign; tasks: Task[] }>(`/briefs/${id}/interpret`),
};

// ── Tarefas ───────────────────────────────────────────────────────────
export const tasksApi = {
  update: (id: string, data: Partial<Pick<Task, 'name' | 'description' | 'priority' | 'isOptional' | 'dueDate'> & { tags: string[] }>) =>
    api.patch<{ task: Task }>(`/tasks/${id}`, data),

  remove: (id: string) =>
    api.delete<{ ok: boolean }>(`/tasks/${id}`),

  addSubtask: (taskId: string, name: string) =>
    api.post<{ subtask: Subtask }>(`/tasks/${taskId}/subtasks`, { name }),

  removeSubtask: (subtaskId: string) =>
    api.delete<{ ok: boolean }>(`/tasks/subtasks/${subtaskId}`),
};

// ── ClickUp ───────────────────────────────────────────────────────────
export const clickupApi = {
  sync: (campaignId: string) =>
    api.post<{ tasks: Task[]; listUrl: string }>(`/clickup/sync/${campaignId}`),
};

// ── Produção ──────────────────────────────────────────────────────────
export const productionApi = {
  close: (taskId: string, mode: 'ia' | 'hibrido' | 'manual', estimatedSavedMinutes: number) =>
    api.post<{ log: ProductionLog; task: Task }>(`/production/${taskId}`, { mode, estimatedSavedMinutes }),
};

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardApi = {
  summary: () =>
    api.get('/dashboard/summary'),
};

export default api;
