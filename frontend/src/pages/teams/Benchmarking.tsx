import AiSummaryCard from '../../components/AiSummaryCard';

const TASKS = [
  { id: '1', name: 'Análise de concorrentes Q3', assignee: 'Beatriz Costa', priority: 'media', status: 'review', due: '03 Jul' },
  { id: '2', name: 'Relatório de share of voice', assignee: 'Beatriz Costa', priority: 'media', status: 'doing', due: '05 Jul' },
  { id: '3', name: 'Dashboard de performance Black Friday', assignee: 'Beatriz Costa', priority: 'alta', status: 'todo', due: '10 Jul' },
  { id: '4', name: 'Relatório de performance Q2', assignee: 'Beatriz Costa', priority: 'media', status: 'done', due: '22 Jun' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  todo:   { label: 'A fazer',      color: 'var(--nova-text-dim)', bg: 'rgba(93,104,128,.15)' },
  doing:  { label: 'Em andamento', color: 'var(--nova-blue)',     bg: 'rgba(61,123,255,.12)' },
  review: { label: 'Em revisão',   color: 'var(--c-warning)',     bg: 'rgba(251,191,36,.12)' },
  done:   { label: 'Concluída',    color: 'var(--c-success)',     bg: 'rgba(74,222,128,.12)' },
};
const PRIORITY_CLASS: Record<string, string> = { alta: 'badge-alta', media: 'badge-media', baixa: 'badge-baixa' };
const PRIORITY_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const TEAM_COLOR = '#6F9BFF';

export default function Benchmarking() {
  const doing = TASKS.filter(t => t.status === 'doing' || t.status === 'review');
  const other = TASKS.filter(t => t.status !== 'doing' && t.status !== 'review');

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
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)' }}>Time Benchmarking</h1>
          <p style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)' }}>Análise comparativa de campanhas e performance de mercado.</p>
        </div>
      </div>

      <AiSummaryCard
        team="Benchmarking"
        summary="O time de Benchmarking está concluindo a análise de concorrentes do Q3, atualmente em revisão. Paralelamente, conduz o levantamento de share of voice para subsidiar as decisões da campanha Black Friday."
        highlights={[
          'Análise de concorrentes Q3 em fase de revisão',
          'Relatório de share of voice em produção',
          'Dashboard de performance Black Friday planejado para meados de Julho',
        ]}
      />

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.75rem' }}>
          Em andamento / revisão ({doing.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {doing.map(task => <TaskRow key={task.id} task={task} />)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.75rem' }}>
          Outras tarefas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {other.map(task => <TaskRow key={task.id} task={task} />)}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: typeof TASKS[0] }) {
  const st = STATUS_MAP[task.status];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap',
      padding: '.75rem 1rem', borderRadius: '.75rem',
      background: 'var(--glass)', border: '1px solid var(--glass-brd)',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '.8125rem', fontWeight: 500, color: 'var(--nova-text)', minWidth: 160 }}>{task.name}</span>
      <span style={{ fontSize: '.75rem', color: 'var(--nova-text-muted)' }}>{task.assignee}</span>
      <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>Prazo: {task.due}</span>
      <span className={`badge ${PRIORITY_CLASS[task.priority]}`}>{PRIORITY_LABEL[task.priority]}</span>
      <span style={{ fontSize: '.6875rem', fontWeight: 600, color: st.color, padding: '.15rem .625rem', borderRadius: '2rem', background: st.bg }}>{st.label}</span>
    </div>
  );
}
