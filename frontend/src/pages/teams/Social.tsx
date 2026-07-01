import AiSummaryCard from '../../components/AiSummaryCard';

const TASKS = [
  { id: '1', name: 'Roteiro Reels Black Friday', assignee: 'Carlos Mendes', priority: 'alta', status: 'doing', due: '02 Jul' },
  { id: '2', name: 'Stories promoção relâmpago', assignee: 'Carlos Mendes', priority: 'alta', status: 'doing', due: '01 Jul' },
  { id: '3', name: 'Calendário editorial Agosto', assignee: 'Carlos Mendes', priority: 'media', status: 'todo', due: '07 Jul' },
  { id: '4', name: 'Posts Feed Instagram – Black Friday', assignee: 'Carlos Mendes', priority: 'alta', status: 'done', due: '28 Jun' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  todo:   { label: 'A fazer',      color: 'var(--nova-text-dim)', bg: 'rgba(93,104,128,.15)' },
  doing:  { label: 'Em andamento', color: 'var(--nova-blue)',     bg: 'rgba(61,123,255,.12)' },
  review: { label: 'Em revisão',   color: 'var(--c-warning)',     bg: 'rgba(251,191,36,.12)' },
  done:   { label: 'Concluída',    color: 'var(--c-success)',     bg: 'rgba(74,222,128,.12)' },
};
const PRIORITY_CLASS: Record<string, string> = { alta: 'badge-alta', media: 'badge-media', baixa: 'badge-baixa' };
const PRIORITY_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

const TEAM_COLOR = '#3D7BFF';

export default function Social() {
  const doing = TASKS.filter(t => t.status === 'doing');
  const other = TASKS.filter(t => t.status !== 'doing');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '.625rem', flexShrink: 0,
          background: `${TEAM_COLOR}1A`, border: `1.5px solid ${TEAM_COLOR}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={TEAM_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
            <circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="6.5" r="1"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)' }}>Time Social</h1>
          <p style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)' }}>Gestão de conteúdo e campanhas nas redes sociais.</p>
        </div>
      </div>

      {/* Resumo da IA */}
      <AiSummaryCard
        team="Social"
        summary="O time Social está focado na produção de conteúdo para a campanha Black Friday, com ênfase em Reels e Stories. As iniciativas seguem o calendário aprovado, com 2 entregas em andamento e 1 concluída neste sprint."
        highlights={[
          'Produção de Reels e Stories para Black Friday em andamento',
          'Calendário editorial de Agosto em planejamento',
          '1 tarefa de alto impacto concluída (Posts Feed Instagram)',
        ]}
        risks={['Prazo dos Stories é amanhã — verificar aprovação com a equipe']}
      />

      {/* Tarefas em andamento */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.75rem' }}>
          Em andamento ({doing.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {doing.map(task => <TaskRow key={task.id} task={task} />)}
        </div>
      </div>

      {/* Outras tarefas */}
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
