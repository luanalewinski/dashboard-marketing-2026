import { useState, useEffect } from 'react';
import AiSummaryCard from '../../components/AiSummaryCard';
import { getListTasks, getStatusStyle, getPriorityStyle, formatDue, CU, CUTask } from '../../lib/clickup';

const TEAM_COLOR = '#6F9BFF';

export default function Benchmarking() {
  const [tasks, setTasks]     = useState<CUTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getListTasks(CU.LIST_ANALYTICS)
      .then(setTasks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const doing = tasks.filter(t => t.status.status === 'em andamento');
  const other = tasks.filter(t => !doing.includes(t));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '.625rem', flexShrink: 0,
          background: `${TEAM_COLOR}1A`, border: `1.5px solid ${TEAM_COLOR}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={TEAM_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)' }}>Time Analíticos</h1>
          <p style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)' }}>
            Tarefas ao vivo do ClickUp — lista ANALÍTICOS
          </p>
        </div>
        <a href={`https://app.clickup.com/36941541/v/l/${CU.LIST_ANALYTICS}`} target="_blank" rel="noopener noreferrer"
          style={{ marginLeft: 'auto', fontSize: '.75rem', color: TEAM_COLOR, display: 'flex', alignItems: 'center', gap: '.25rem', textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Abrir no ClickUp
        </a>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: '.75rem', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.2)', color: '#FF6B6B', fontSize: '.8125rem', marginBottom: '1rem' }}>
          Erro ao carregar tarefas do ClickUp: {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 272px', gap: '1.25rem', alignItems: 'start' }}>

        {/* Coluna esquerda: tarefas */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 52, borderRadius: '.75rem', background: 'rgba(255,255,255,.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.75rem' }}>
                  Em andamento ({doing.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {doing.length === 0
                    ? <div style={{ fontSize: '.8125rem', color: 'var(--nova-text-dim)', padding: '.75rem' }}>Nenhuma tarefa em andamento.</div>
                    : doing.map(t => <TaskRow key={t.id} task={t} teamColor={TEAM_COLOR} />)
                  }
                </div>
              </div>
              <div>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.75rem' }}>
                  Outras tarefas ({other.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {other.slice(0, 20).map(t => <TaskRow key={t.id} task={t} teamColor={TEAM_COLOR} />)}
                  {other.length > 20 && (
                    <a href={`https://app.clickup.com/36941541/v/l/${CU.LIST_ANALYTICS}`} target="_blank" rel="noopener noreferrer"
                      style={{ textAlign: 'center', fontSize: '.8125rem', color: TEAM_COLOR, padding: '.5rem', textDecoration: 'none' }}>
                      Ver todas no ClickUp ({other.length - 20} mais) →
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Coluna direita: resumo da IA */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          <AiSummaryCard
            team="Analíticos"
            summary="O time de Analíticos monitora métricas e produz relatórios de performance. Os dados abaixo refletem o estado atual da lista no ClickUp."
            highlights={[
              `${doing.length} análise${doing.length !== 1 ? 's' : ''} em andamento`,
              `${tasks.filter(t => t.status.status === 'em aprovação').length} em aprovação`,
              `${tasks.filter(t => t.status.type === 'closed').length} concluídas`,
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, teamColor }: { task: CUTask; teamColor: string }) {
  const st  = getStatusStyle(task);
  const pri = getPriorityStyle(task);
  const due = formatDue(task.due_date);

  return (
    <a href={task.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap',
        padding: '.75rem 1rem', borderRadius: '.75rem',
        background: 'var(--glass)', border: '1px solid var(--glass-brd)',
        transition: 'background .15s', cursor: 'pointer',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--glass)')}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: teamColor, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: '.8125rem', fontWeight: 500, color: 'var(--nova-text)', minWidth: 160 }}>{task.name}</span>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {task.assignees.slice(0, 3).map((a, i) => (
            <div key={a.id} title={a.username} style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: a.profilePicture ? `url(${a.profilePicture}) center/cover` : a.color,
              border: '1.5px solid var(--nova-bg-elev)',
              marginLeft: i > 0 ? '-6px' : 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.5rem', fontWeight: 700, color: '#fff',
            }}>
              {!a.profilePicture && a.initials}
            </div>
          ))}
        </div>

        {due && <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)', flexShrink: 0 }}>📅 {due}</span>}
        {pri && <span className={`badge ${pri.cls}`} style={{ flexShrink: 0 }}>{pri.label}</span>}
        <span style={{ fontSize: '.6875rem', fontWeight: 600, color: st.color, padding: '.15rem .625rem', borderRadius: '2rem', background: st.bg, flexShrink: 0 }}>
          {st.label}
        </span>
      </div>
    </a>
  );
}
