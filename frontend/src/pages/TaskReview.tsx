import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type Campaign, type Task } from '../api/client';

const MOCK_TASKS: import('../api/client').Task[] = [
  {
    id: 'task-1', campaignId: 'mock-campaign-01',
    name: 'Banner principal Black Friday', description: 'Criar o banner hero para a landing page e e-commerce.',
    priority: 'alta', isOptional: false, dueDate: '2026-11-28T00:00:00.000Z',
    tags: 'design,banner,urgente', clickupTaskId: null, status: 'pending',
    subtasks: [
      { id: 'sub-1a', taskId: 'task-1', name: 'Versão desktop (1920×600)', status: 'pending' },
      { id: 'sub-1b', taskId: 'task-1', name: 'Versão mobile (390×300)', status: 'pending' },
    ],
  },
  {
    id: 'task-2', campaignId: 'mock-campaign-01',
    name: 'Posts para redes sociais', description: 'Pacote de posts para Instagram e Facebook.',
    priority: 'alta', isOptional: false, dueDate: '2026-11-27T00:00:00.000Z',
    tags: 'design,social,instagram', clickupTaskId: null, status: 'pending',
    subtasks: [
      { id: 'sub-2a', taskId: 'task-2', name: 'Feed Instagram (1080×1080)', status: 'pending' },
      { id: 'sub-2b', taskId: 'task-2', name: 'Stories (1080×1920)', status: 'pending' },
      { id: 'sub-2c', taskId: 'task-2', name: 'Post Facebook', status: 'pending' },
    ],
  },
  {
    id: 'task-3', campaignId: 'mock-campaign-01',
    name: 'Email marketing', description: 'Template HTML responsivo para disparo na Black Friday.',
    priority: 'media', isOptional: false, dueDate: '2026-11-25T00:00:00.000Z',
    tags: 'copy,email,html', clickupTaskId: null, status: 'pending',
    subtasks: [
      { id: 'sub-3a', taskId: 'task-3', name: 'Estrutura HTML', status: 'pending' },
      { id: 'sub-3b', taskId: 'task-3', name: 'Texto e CTA', status: 'pending' },
    ],
  },
  {
    id: 'task-4', campaignId: 'mock-campaign-01',
    name: 'Vídeo curto (Reels)', description: 'Se der tempo, produzir um Reels de 15 segundos.',
    priority: 'baixa', isOptional: true, dueDate: null,
    tags: 'video,reels', clickupTaskId: null, status: 'pending',
    subtasks: [
      { id: 'sub-4a', taskId: 'task-4', name: 'Roteiro', status: 'pending' },
    ],
  },
];

const PRIORITY_LABELS: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const PRIORITY_CLASSES: Record<string, string> = { alta: 'badge-alta', media: 'badge-media', baixa: 'badge-baixa' };

export default function TaskReview() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // taskId sendo salvo
  const [syncing, setSyncing] = useState(false);
  const [error, _setError] = useState('');

  // Campos de edição inline por tarefa
  const [edits, setEdits] = useState<Record<string, Partial<Task> & { tagsStr?: string; newSubtask?: string }>>({});

  useEffect(() => {
    if (!campaignId) return;
    setTimeout(() => {
      setCampaign({
        id: campaignId,
        name: 'Campanha Black Friday',
        objective: 'Aumentar as vendas em 30% durante o período de Black Friday com peças de design para todos os canais.',
        sourceType: 'text',
        rawBrief: '',
        status: 'reviewed',
        clickupListId: null,
        createdAt: new Date().toISOString(),
        tasks: MOCK_TASKS,
      });
      setTasks(MOCK_TASKS);
      setLoading(false);
    }, 600);
  }, [campaignId]);

  const getEdit = (taskId: string) => edits[taskId] ?? {};
  const setEdit = (taskId: string, patch: object) =>
    setEdits((prev) => ({ ...prev, [taskId]: { ...prev[taskId], ...patch } }));

  // Salvar edições de uma tarefa (mock — só atualiza estado local)
  const saveTask = async (task: Task) => {
    const edit = getEdit(task.id);
    setSaving(task.id);
    await new Promise((r) => setTimeout(r, 400));
    const updated: Task = {
      ...task,
      name: edit.name ?? task.name,
      description: edit.description ?? task.description ?? '',
      priority: (edit.priority ?? task.priority) as Task['priority'],
      isOptional: edit.isOptional ?? task.isOptional,
      dueDate: edit.dueDate !== undefined ? edit.dueDate : task.dueDate,
      tags: edit.tagsStr !== undefined ? edit.tagsStr : (task.tags ?? ''),
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    setEdits((prev) => { const next = { ...prev }; delete next[task.id]; return next; });
    setSaving(null);
  };

  // Remover tarefa (mock)
  const removeTask = async (taskId: string) => {
    if (!confirm('Remover esta tarefa?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Adicionar subtarefa (mock)
  const addSubtask = async (task: Task) => {
    const name = (getEdit(task.id).newSubtask ?? '').trim();
    if (!name) return;
    const newSub = { id: `sub-${Date.now()}`, taskId: task.id, name, status: 'pending' };
    setTasks((prev) => prev.map((t) =>
      t.id === task.id ? { ...t, subtasks: [...t.subtasks, newSub] } : t
    ));
    setEdit(task.id, { newSubtask: '' });
  };

  // Remover subtarefa (mock)
  const removeSubtask = async (taskId: string, subtaskId: string) => {
    setTasks((prev) => prev.map((t) =>
      t.id === taskId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) } : t
    ));
  };

  // Confirmar e ir para ClickUp
  const handleSync = () => {
    setSyncing(true);
    navigate(`/sync/${campaignId}`);
  };

  if (loading) return <LoadingState />;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.25rem' }}>
            {campaign?.name ?? 'Revisão de Tarefas'}
          </h1>
          {campaign?.objective && (
            <p style={{ fontSize: '.875rem', color: 'var(--nova-text-muted)', maxWidth: 600 }}>
              {campaign.objective}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '.625rem', flexShrink: 0 }}>
          <span style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)', alignSelf: 'center' }}>
            {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
          </span>
          <button
            className="btn-blue"
            onClick={handleSync}
            disabled={syncing || tasks.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            Confirmar e enviar ao ClickUp
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '.75rem 1rem', borderRadius: '.5rem', background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.25)', color: 'var(--c-danger)', fontSize: '.8125rem' }}>
          {error}
        </div>
      )}

      {/* Lista de tarefas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map((task) => {
          const edit = getEdit(task.id);
          const isDirty = Object.keys(edit).some((k) => k !== 'newSubtask' && edit[k as keyof typeof edit] !== undefined);

          return (
            <div key={task.id} className="glass-card" style={{ padding: '1.25rem' }}>
              {/* Linha 1: nome + prioridade + opcional + ações */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', marginBottom: '.875rem', flexWrap: 'wrap' }}>
                <input
                  className="nova-input"
                  style={{ flex: 1, minWidth: 200, fontWeight: 600, fontSize: '.9375rem' }}
                  value={edit.name ?? task.name}
                  onChange={(e) => setEdit(task.id, { name: e.target.value })}
                  aria-label="Nome da tarefa"
                />

                {/* Prioridade */}
                <select
                  className="nova-input"
                  style={{ width: 'auto', paddingRight: '1.5rem' }}
                  value={edit.priority ?? task.priority}
                  onChange={(e) => setEdit(task.id, { priority: e.target.value as Task['priority'] })}
                  aria-label="Prioridade"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>

                {/* Badge de prioridade visual */}
                <span className={`badge ${PRIORITY_CLASSES[edit.priority ?? task.priority]}`}>
                  {PRIORITY_LABELS[edit.priority ?? task.priority]}
                </span>

                {/* Opcional toggle */}
                <button
                  className={`badge ${(edit.isOptional ?? task.isOptional) ? 'badge-optional' : 'badge-synced'}`}
                  onClick={() => setEdit(task.id, { isOptional: !(edit.isOptional ?? task.isOptional) })}
                  style={{ cursor: 'pointer', border: 'none', background: undefined }}
                  aria-pressed={edit.isOptional ?? task.isOptional}
                  title="Marcar como opcional"
                >
                  {(edit.isOptional ?? task.isOptional) ? 'Opcional' : 'Obrigatória'}
                </button>

                {/* Remover */}
                <button className="btn-red" onClick={() => removeTask(task.id)} aria-label="Remover tarefa" style={{ padding: '.25rem .5rem' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>

              {/* Linha 2: descrição */}
              <div style={{ marginBottom: '.75rem' }}>
                <label style={{ fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '.3rem' }}>
                  Descrição
                </label>
                <textarea
                  className="nova-textarea"
                  style={{ minHeight: 60, fontSize: '.8125rem' }}
                  value={edit.description ?? task.description ?? ''}
                  onChange={(e) => setEdit(task.id, { description: e.target.value })}
                  aria-label="Descrição da tarefa"
                  rows={2}
                />
              </div>

              {/* Linha 3: data + tags */}
              <div style={{ display: 'flex', gap: '.75rem', marginBottom: '.875rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '.3rem' }}>
                    Prazo
                  </label>
                  <input
                    type="date"
                    className="nova-input"
                    value={edit.dueDate !== undefined
                      ? (edit.dueDate ? edit.dueDate.slice(0, 10) : '')
                      : (task.dueDate ? task.dueDate.slice(0, 10) : '')}
                    onChange={(e) => setEdit(task.id, { dueDate: e.target.value || null })}
                    aria-label="Prazo da tarefa"
                  />
                </div>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <label style={{ fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '.3rem' }}>
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    className="nova-input"
                    placeholder="design, copy, aprovação"
                    value={edit.tagsStr ?? (task.tags ?? '')}
                    onChange={(e) => setEdit(task.id, { tagsStr: e.target.value })}
                    aria-label="Tags da tarefa"
                  />
                </div>
              </div>

              {/* Subtarefas */}
              <div>
                <label style={{ fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '.5rem' }}>
                  Subtarefas ({task.subtasks.length})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem', marginBottom: '.5rem' }}>
                  {task.subtasks.map((sub) => (
                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .75rem', borderRadius: '.5rem', background: 'rgba(255,255,255,.03)', border: '1px solid var(--glass-brd)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" style={{ color: 'var(--nova-text-dim)', flexShrink: 0 }}>
                        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      <span style={{ flex: 1, fontSize: '.8125rem', color: 'var(--nova-text-muted)' }}>{sub.name}</span>
                      <button className="btn-ghost" onClick={() => removeSubtask(task.id, sub.id)} aria-label={`Remover subtarefa ${sub.name}`} style={{ padding: '.15rem .35rem' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {/* Adicionar subtarefa */}
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    className="nova-input"
                    placeholder="Nova subtarefa..."
                    value={edit.newSubtask ?? ''}
                    onChange={(e) => setEdit(task.id, { newSubtask: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addSubtask(task)}
                    aria-label="Nome da nova subtarefa"
                  />
                  <button className="btn-ghost" onClick={() => addSubtask(task)} style={{ flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Salvar edições */}
              {isDirty && (
                <div style={{ marginTop: '.875rem', display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
                  <button className="btn-ghost" onClick={() => setEdits((p) => { const n = { ...p }; delete n[task.id]; return n; })}>
                    Descartar
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => saveTask(task)}
                    disabled={saving === task.id}
                  >
                    {saving === task.id ? 'Salvando...' : 'Salvar edições'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão inferior de confirmação */}
      {tasks.length > 0 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-blue" onClick={handleSync} disabled={syncing} style={{ minWidth: 220, justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            Confirmar e enviar ao ClickUp
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: '1rem' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" style={{ color: 'var(--nova-blue)', animation: 'spin 1s linear infinite' }}>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span style={{ color: 'var(--nova-text-muted)', fontSize: '.875rem' }}>Carregando tarefas...</span>
    </div>
  );
}
