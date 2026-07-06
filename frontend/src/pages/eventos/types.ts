export interface ChecklistItem {
  id: string; name: string; done: boolean; category: string; order_index: number;
}
export interface EventoLink {
  id: string; type: string; label: string; url: string;
}
export interface Edicao {
  id: string; evento_id: string; year: number;
  status: 'planejamento' | 'em_andamento' | 'concluido';
  notes: string | null; clickup_list_id: string | null;
  checklist: ChecklistItem[]; links: EventoLink[];
}
export interface Evento {
  id: string; name: string; description: string | null;
  category: string | null; is_recurring: boolean; editions: Edicao[];
}
export interface Fornecedor {
  id: string; name: string; category: string | null;
  contact_name: string | null; whatsapp: string | null;
  email: string | null; notes: string | null; status: string;
  created_at: string;
}
export interface EdicaoFornecedor {
  id: string; edicao_id: string; fornecedor_id: string;
  observations: string | null; fornecedor: Fornecedor;
}
export interface EventoItem {
  id: string; edicao_id: string; module: string;
  name: string; status: string; responsible: string | null;
  priority: string; due_date: string | null; notes: string | null;
  order_index: number; created_at: string;
}

export type WorkTab = 'overview' | 'checklist' | 'suppliers' | 'design' | 'social' | 'video';

export const TEAMS: { key: string; label: string; color: string }[] = [
  { key: 'design',      label: 'Design',      color: '#3D7BFF' },
  { key: 'organizacao', label: 'Organização', color: '#FBBF24' },
  { key: 'social',      label: 'Social',       color: '#4ADE80' },
];

export const STATUS_CFG = {
  planejamento: { label: 'Planejamento', color: 'rgba(238,242,248,.45)', bg: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.1)' },
  em_andamento: { label: 'Em andamento', color: '#3D7BFF',              bg: 'rgba(61,123,255,.1)',    border: 'rgba(61,123,255,.25)' },
  concluido:    { label: 'Concluído',    color: '#4ADE80',              bg: 'rgba(74,222,128,.1)',    border: 'rgba(74,222,128,.25)' },
} as const;

export const LINK_CFG: Record<string, { label: string; color: string; letter: string }> = {
  drive:  { label: 'Drive',  color: '#4ADE80', letter: 'G' },
  figma:  { label: 'Figma',  color: '#3D7BFF', letter: 'F' },
  form:   { label: 'Form',   color: '#6F9BFF', letter: 'F' },
  site:   { label: 'Site',   color: '#FBBF24', letter: 'S' },
  social: { label: 'Social', color: '#FBBF24', letter: 'S' },
  outro:  { label: 'Link',   color: 'rgba(238,242,248,.3)', letter: '↗' },
};
export const LINK_TYPES = ['drive','figma','form','site','social','outro'];

export const MODULE_CFG = {
  design: {
    label: 'Material Design', color: '#3D7BFF',
    templates: ['KV', 'Flyers', 'Camisetas', 'Pulseiras', 'Credenciais', 'Cardápios', 'Backdrops', 'Brindes', 'Press Kit'],
  },
  social: {
    label: 'Social Media', color: '#4ADE80',
    templates: ['Feed', 'Stories', 'Reels', 'Campanhas', 'Copy', 'Criativos'],
  },
  video: {
    label: 'Vídeos', color: '#FBBF24',
    templates: ['Briefing', 'Roteiros', 'Captação', 'Drone', 'Fotos', 'Edição', 'Aprovação', 'Entrega'],
  },
} as const;

export const ITEM_STATUSES = [
  { key: 'a_fazer',     label: 'A fazer',       color: 'rgba(238,242,248,.4)',  bg: 'rgba(255,255,255,.06)' },
  { key: 'em_andamento',label: 'Em andamento',  color: '#3D7BFF',               bg: 'rgba(61,123,255,.12)' },
  { key: 'em_aprovacao',label: 'Em aprovação',  color: '#FBBF24',               bg: 'rgba(251,191,36,.12)' },
  { key: 'concluido',   label: 'Concluído',     color: '#4ADE80',               bg: 'rgba(74,222,128,.12)' },
];

export function pct(items: ChecklistItem[]): number {
  if (!items.length) return 0;
  return Math.round((items.filter(i => i.done).length / items.length) * 100);
}
