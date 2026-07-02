import { supabase } from './supabase';

// ── Tipos ClickUp ────────────────────────────────────────────────────
export interface CUAssignee {
  id: number;
  username: string;
  initials: string;
  color: string;
  profilePicture: string | null;
}

export interface CUStatus {
  status: string;
  color: string;
  type: 'open' | 'custom' | 'closed';
}

export interface CUPriority {
  id: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  color: string;
}

export interface CUTask {
  id: string;
  name: string;
  status: CUStatus;
  priority: CUPriority | null;
  assignees: CUAssignee[];
  due_date: string | null;        // Unix ms como string
  date_updated: string;
  url: string;
  description: string;
}

// ── Status → estilo visual ───────────────────────────────────────────
export const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  'a fazer':      { label: 'A fazer',      color: 'var(--nova-text-dim)', bg: 'rgba(93,104,128,.15)' },
  'em andamento': { label: 'Em andamento', color: '#3D7BFF',              bg: 'rgba(61,123,255,.12)' },
  'em aprovação': { label: 'Em aprovação', color: '#FBBF24',              bg: 'rgba(251,191,36,.12)' },
  'em ajustes':   { label: 'Em ajustes',   color: '#FF6B6B',              bg: 'rgba(255,107,107,.12)' },
  'concluído':    { label: 'Concluído',    color: '#4ADE80',              bg: 'rgba(74,222,128,.12)' },
  // fallback genérico
  open:           { label: 'A fazer',      color: 'var(--nova-text-dim)', bg: 'rgba(93,104,128,.15)' },
  custom:         { label: 'Em progresso', color: '#3D7BFF',              bg: 'rgba(61,123,255,.12)' },
  closed:         { label: 'Concluído',    color: '#4ADE80',              bg: 'rgba(74,222,128,.12)' },
};

export function getStatusStyle(task: CUTask) {
  return (
    STATUS_STYLE[task.status.status] ??
    STATUS_STYLE[task.status.type] ?? {
      label: task.status.status,
      color: task.status.color,
      bg: `${task.status.color}20`,
    }
  );
}

// ── Prioridade → estilo visual ───────────────────────────────────────
export const PRIORITY_STYLE: Record<string, { label: string; cls: string }> = {
  urgent: { label: 'Urgente', cls: 'badge-alta' },
  high:   { label: 'Alta',    cls: 'badge-alta' },
  normal: { label: 'Média',   cls: 'badge-media' },
  low:    { label: 'Baixa',   cls: 'badge-baixa' },
};

export function getPriorityStyle(task: CUTask) {
  if (!task.priority) return null;
  return PRIORITY_STYLE[task.priority.priority] ?? { label: task.priority.priority, cls: 'badge-media' };
}

// ── Formatar data ────────────────────────────────────────────────────
export function formatDue(dueDateMs: string | null): string | null {
  if (!dueDateMs) return null;
  const d = new Date(parseInt(dueDateMs));
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ── Proxy call ───────────────────────────────────────────────────────
async function cuFetch(path: string, method = 'GET', body?: object) {
  const { data, error } = await supabase.functions.invoke('clickup-proxy', {
    body: { path, method, body },
  });
  if (error) throw new Error(error.message ?? 'Erro ao chamar ClickUp');
  if (data?.error) throw new Error(data.error);
  return data;
}

// ── Buscar tarefas de uma lista ──────────────────────────────────────
export async function getListTasks(listId: string, page = 0, includeClosed = false): Promise<CUTask[]> {
  const data = await cuFetch(
    `/list/${listId}/task?page=${page}&subtasks=false&order_by=updated&reverse=true&include_closed=${includeClosed}`
  );
  return data.tasks ?? [];
}

// ── Criar tarefa ─────────────────────────────────────────────────────
export async function createTask(
  listId: string,
  task: { name: string; description?: string; priority?: number; due_date?: number }
) {
  return cuFetch(`/list/${listId}/task`, 'POST', task);
}

// ── Criar lista ──────────────────────────────────────────────────────
export async function createList(spaceId: string, name: string) {
  return cuFetch(`/space/${spaceId}/list`, 'POST', { name });
}

// ── Atualizar status de tarefa ───────────────────────────────────────
export async function updateTaskStatus(taskId: string, status: string) {
  return cuFetch(`/task/${taskId}`, 'PUT', { status });
}

// IDs fixos do workspace MKT NOVA
export const CU = {
  SPACE_ID:       '60965611',
  LIST_SOCIAL:    '901305808537',   // SOCIAL & DESIGN
  LIST_ANALYTICS: '901305808546',   // ANALÍTICOS
  LIST_EV002:     '901324650572',   // EV-002. Convenção Cartagena
  LIST_EV003:     '901326451930',   // EV-003. CORBAN 360
  LIST_TEMPLATE:  '901306225729',   // Live Template
} as const;
