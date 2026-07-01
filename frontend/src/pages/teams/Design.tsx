import AiSummaryCard from '../../components/AiSummaryCard';

const TASKS = [
  { id: '1', name: 'Banner principal Black Friday', assignee: 'Ana Lima', priority: 'alta', status: 'doing', due: '30 Jun' },
  { id: '2', name: 'Email marketing Natal', assignee: 'Ana Lima', priority: 'baixa', status: 'todo', due: '15 Jul' },
  { id: '3', name: 'Kit de identidade Q3', assignee: 'Ana Lima', priority: 'media', status: 'todo', due: '12 Jul' },
  { id: '4', name: 'Posts Feed Instagram', assignee: 'Ana Lima', priority: 'alta', status: 'done', due: '28 Jun' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  todo:   { label: 'A fazer',      color: 'var(--nova-text-dim)', bg: 'rgba(93,104,128,.15)' },
  doing:  { label: 'Em andamento', color: 'var(--nova-blue)',     bg: 'rgba(61,123,255,.12)' },
  review: { label: 'Em revisão',   color: 'var(--c-warning)',     bg: 'rgba(251,191,36,.12)' },
  done:   { label: 'Concluída',    color: 'var(--c-success)',     bg: 'rgba(74,222,128,.12)' },
};
const PRIORITY_CLASS: Record<string, string> = { alta: 'badge-alta', media: 'badge-media', baixa: 'badge-baixa' };
const PRIORITY_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const TEAM_COLOR = '#FBBF24';

export default function Design() {
  const doing = TASKS.filter(t => t.status === 'doing');
  const other = TASKS.filter(t => t.status !== 'doing');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '.625rem', flexShrink: 0,
          background: `${TEAM_COLOR}1A`, border: `1.5px solid ${TEAM_COLOR}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={TEAM_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)' }}>Time Design</h1>
          <p style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)' }}>Produção visual, identidade de marca e peças criativas.</p>
        </div>
      </div>

      <AiSummaryCard
        team="Design"
        summary="O time de Design está com o banner principal da Black Friday em produção, com prazo para hoje. Os Posts do Feed Instagram foram entregues com sucesso. A fila inclui ainda o email marketing de Natal e o kit de identidade do Q3."
        highlights={[
          'Banner Black Friday em produção — prazo crítico hoje',
          'Posts Feed Instagram entregues com sucesso',
          'Email marketing de Natal e kit Q3 na fila para Julho',
        ]}
        risks={['Banner principal com prazo vencendo hoje — prioridade máxima']}
      />

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.75rem' }}>
          Em andamento ({doing.length})
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
