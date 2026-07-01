import AiSummaryCard from '../../components/AiSummaryCard';

const TASKS = [
  { id: '1', name: 'Script de atendimento Black Friday', assignee: 'Rafael Souza', priority: 'media', status: 'doing', due: '04 Jul' },
  { id: '2', name: 'FAQ de promoções – atualização', assignee: 'Rafael Souza', priority: 'media', status: 'doing', due: '03 Jul' },
  { id: '3', name: 'Treinamento equipe de suporte', assignee: 'Rafael Souza', priority: 'alta', status: 'todo', due: '08 Jul' },
  { id: '4', name: 'Relatório NPS Junho', assignee: 'Rafael Souza', priority: 'baixa', status: 'done', due: '25 Jun' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  todo:   { label: 'A fazer',      color: 'var(--nova-text-dim)', bg: 'rgba(93,104,128,.15)' },
  doing:  { label: 'Em andamento', color: 'var(--nova-blue)',     bg: 'rgba(61,123,255,.12)' },
  review: { label: 'Em revisão',   color: 'var(--c-warning)',     bg: 'rgba(251,191,36,.12)' },
  done:   { label: 'Concluída',    color: 'var(--c-success)',     bg: 'rgba(74,222,128,.12)' },
};
const PRIORITY_CLASS: Record<string, string> = { alta: 'badge-alta', media: 'badge-media', baixa: 'badge-baixa' };
const PRIORITY_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const TEAM_COLOR = '#4ADE80';

export default function Atendimento() {
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)' }}>Time Atendimento</h1>
          <p style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)' }}>Suporte ao cliente e gestão de relacionamento.</p>
        </div>
      </div>

      <AiSummaryCard
        team="Atendimento"
        summary="O time de Atendimento está preparando a operação para o pico de Black Friday, com foco na atualização do script de atendimento e do FAQ de promoções. O treinamento da equipe de suporte está previsto para a próxima semana."
        highlights={[
          'Script de atendimento Black Friday em elaboração',
          'FAQ de promoções sendo atualizado com novas regras',
          'Treinamento de equipe de suporte agendado para início de Julho',
          'NPS de Junho entregue — resultado disponível para análise',
        ]}
        risks={['Volume de atendimento na Black Friday pode exigir reforço de equipe']}
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
