import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SPRINTS = [
  {
    id: 'sprint-3',
    name: 'Sprint 3',
    period: '23 Jun – 07 Jul 2026',
    status: 'active',
    progress: 62,
    tasks: [
      { id: 't1', name: 'Banner Black Friday', assignee: 'Ana Lima', team: 'Design', priority: 'alta', status: 'doing' },
      { id: 't2', name: 'Roteiro Reels', assignee: 'Carlos Mendes', team: 'Social', priority: 'alta', status: 'doing' },
      { id: 't3', name: 'Análise de concorrentes Q3', assignee: 'Beatriz Costa', team: 'Benchmarking', priority: 'media', status: 'review' },
      { id: 't4', name: 'Script de atendimento Black Friday', assignee: 'Rafael Souza', team: 'Atendimento', priority: 'media', status: 'todo' },
      { id: 't5', name: 'Posts Feed Instagram', assignee: 'Ana Lima', team: 'Social', priority: 'alta', status: 'done' },
      { id: 't6', name: 'Email marketing Natal', assignee: 'Carlos Mendes', team: 'Design', priority: 'baixa', status: 'todo' },
    ],
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2',
    period: '09 Jun – 22 Jun 2026',
    status: 'closed',
    progress: 100,
    tasks: [
      { id: 't7', name: 'Campanha Dia dos Namorados', assignee: 'Ana Lima', team: 'Design', priority: 'alta', status: 'done' },
      { id: 't8', name: 'Stories promoção', assignee: 'Carlos Mendes', team: 'Social', priority: 'media', status: 'done' },
      { id: 't9', name: 'Relatório de performance', assignee: 'Beatriz Costa', team: 'Benchmarking', priority: 'media', status: 'done' },
    ],
  },
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    period: '26 Mai – 08 Jun 2026',
    status: 'closed',
    progress: 100,
    tasks: [
      { id: 't10', name: 'Identidade visual Q2', assignee: 'Ana Lima', team: 'Design', priority: 'alta', status: 'done' },
      { id: 't11', name: 'Calendário editorial', assignee: 'Carlos Mendes', team: 'Social', priority: 'alta', status: 'done' },
    ],
  },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  todo:   { label: 'A fazer',   color: 'var(--nova-text-dim)',  bg: 'rgba(93,104,128,.15)' },
  doing:  { label: 'Em andamento', color: 'var(--nova-blue)',   bg: 'rgba(61,123,255,.12)' },
  review: { label: 'Em revisão',  color: 'var(--c-warning)',    bg: 'rgba(251,191,36,.12)' },
  done:   { label: 'Concluída',   color: 'var(--c-success)',    bg: 'rgba(74,222,128,.12)' },
};
const PRIORITY_CLASS: Record<string, string> = { alta: 'badge-alta', media: 'badge-media', baixa: 'badge-baixa' };
const PRIORITY_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

const TEAM_COLOR: Record<string, string> = {
  Social: '#3D7BFF', Benchmarking: '#6F9BFF', Atendimento: '#4ADE80', Design: '#FBBF24',
};

export default function Sprints() {
  const [open, setOpen] = useState<string>('sprint-3');
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.25rem' }}>Sprints</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--nova-text-muted)' }}>Acompanhe o progresso de cada ciclo de trabalho.</p>
        </div>
        <button className="btn-blue" onClick={() => navigate('/')} style={{ justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Campanha
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {SPRINTS.map((sprint) => {
          const isOpen = open === sprint.id;
          const doing = sprint.tasks.filter(t => t.status === 'doing').length;
          const done = sprint.tasks.filter(t => t.status === 'done').length;

          return (
            <div key={sprint.id} className="glass-card" style={{ overflow: 'hidden' }}>
              {/* Header do sprint */}
              <button
                onClick={() => setOpen(isOpen ? '' : sprint.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.125rem 1.25rem', cursor: 'pointer',
                  background: 'transparent', border: 'none', textAlign: 'left',
                }}
              >
                {/* Chevron */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"
                  style={{ color: 'var(--nova-text-dim)', flexShrink: 0, transition: 'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--nova-text)' }}>{sprint.name}</span>
                    <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>{sprint.period}</span>
                    {sprint.status === 'active' && (
                      <span style={{ fontSize: '.625rem', fontWeight: 700, color: 'var(--c-success)', background: 'rgba(74,222,128,.12)', border: '1px solid rgba(74,222,128,.25)', padding: '.15rem .5rem', borderRadius: '2rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Ativo
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ flex: 1, maxWidth: 200, height: 4, borderRadius: 2, background: 'var(--nova-bg-elev-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${sprint.progress}%`, height: '100%', background: sprint.progress === 100 ? 'var(--c-success)' : 'var(--nova-blue)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>{sprint.progress}%</span>
                    <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>{done}/{sprint.tasks.length} tarefas</span>
                    {doing > 0 && <span style={{ fontSize: '.6875rem', color: 'var(--nova-blue)' }}>{doing} em andamento</span>}
                  </div>
                </div>
              </button>

              {/* Tarefas expandidas */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--glass-brd)', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {sprint.tasks.map((task) => {
                      const st = STATUS_MAP[task.status];
                      return (
                        <div key={task.id} style={{
                          display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap',
                          padding: '.625rem .875rem', borderRadius: '.625rem',
                          background: 'rgba(255,255,255,.03)', border: '1px solid var(--glass-brd)',
                        }}>
                          {/* Status dot */}
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: st.color, flexShrink: 0 }} />

                          {/* Nome */}
                          <span style={{ flex: 1, fontSize: '.8125rem', fontWeight: 500, color: 'var(--nova-text)', minWidth: 160 }}>
                            {task.name}
                          </span>

                          {/* Time */}
                          <span style={{
                            fontSize: '.6875rem', fontWeight: 600, color: TEAM_COLOR[task.team],
                            padding: '.15rem .5rem', borderRadius: '.25rem',
                            background: `${TEAM_COLOR[task.team]}15`, border: `1px solid ${TEAM_COLOR[task.team]}30`,
                          }}>{task.team}</span>

                          {/* Assignee */}
                          <span style={{ fontSize: '.75rem', color: 'var(--nova-text-muted)', minWidth: 100 }}>
                            {task.assignee}
                          </span>

                          {/* Prioridade */}
                          <span className={`badge ${PRIORITY_CLASS[task.priority]}`}>{PRIORITY_LABEL[task.priority]}</span>

                          {/* Status */}
                          <span style={{
                            fontSize: '.6875rem', fontWeight: 600, color: st.color,
                            padding: '.15rem .625rem', borderRadius: '2rem', background: st.bg,
                          }}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
