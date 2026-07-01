import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const MEMBERS = [
  {
    name: 'Ana Lima', team: 'Design', teamColor: '#FBBF24', teamPath: '/time/design',
    avatar: 'AL',
    tasks: [
      { name: 'Banner principal Black Friday', status: 'doing', priority: 'alta' },
      { name: 'Posts Feed Instagram', status: 'done', priority: 'alta' },
      { name: 'Email marketing Natal', status: 'todo', priority: 'baixa' },
    ],
  },
  {
    name: 'Carlos Mendes', team: 'Social', teamColor: '#3D7BFF', teamPath: '/time/social',
    avatar: 'CM',
    tasks: [
      { name: 'Roteiro Reels Black Friday', status: 'doing', priority: 'alta' },
      { name: 'Stories promoção relâmpago', status: 'doing', priority: 'alta' },
      { name: 'Calendário editorial Agosto', status: 'todo', priority: 'media' },
    ],
  },
  {
    name: 'Beatriz Costa', team: 'Benchmarking', teamColor: '#6F9BFF', teamPath: '/time/benchmarking',
    avatar: 'BC',
    tasks: [
      { name: 'Análise de concorrentes Q3', status: 'review', priority: 'media' },
      { name: 'Relatório de share of voice', status: 'doing', priority: 'media' },
    ],
  },
  {
    name: 'Rafael Souza', team: 'Atendimento', teamColor: '#4ADE80', teamPath: '/time/atendimento',
    avatar: 'RS',
    tasks: [
      { name: 'Script atendimento Black Friday', status: 'doing', priority: 'media' },
      { name: 'FAQ de promoções', status: 'doing', priority: 'media' },
      { name: 'Treinamento equipe suporte', status: 'todo', priority: 'alta' },
    ],
  },
];

const TASK_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  todo:   { label: 'A fazer',      color: 'var(--nova-text-dim)', bg: 'rgba(93,104,128,.15)' },
  doing:  { label: 'Em andamento', color: 'var(--nova-blue)',     bg: 'rgba(61,123,255,.12)' },
  review: { label: 'Em revisão',   color: 'var(--c-warning)',     bg: 'rgba(251,191,36,.12)' },
  done:   { label: 'Concluída',    color: 'var(--c-success)',     bg: 'rgba(74,222,128,.12)' },
};

// ── Dados mockados ────────────────────────────────────────────────────────────

const SUMMARY = {
  totalSavedHours: 127.5,
  totalTasks: 48,
  closedTasks: 34,
  avgSavedPerTask: 2.25,
  modeDistribution: { ia: 68, hibrido: 20, manual: 12 },
  savedByCampaign: [
    { campaignName: 'Black Friday', savedHours: 42 },
    { campaignName: 'Natal 2025', savedHours: 31 },
    { campaignName: 'Dia das Mães', savedHours: 24 },
    { campaignName: 'Volta às Aulas', savedHours: 18 },
    { campaignName: 'Páscoa', savedHours: 12.5 },
  ],
  deadlineCompliance: { onTime: 84, late: 16 },
};

const CAMPAIGNS_TABLE = [
  { name: 'Black Friday', tasks: 12, closed: 12, mode: 'ia', hours: 42, status: 'synced' },
  { name: 'Natal 2025', tasks: 9, closed: 9, mode: 'hibrido', hours: 31, status: 'synced' },
  { name: 'Dia das Mães', tasks: 8, closed: 8, mode: 'ia', hours: 24, status: 'synced' },
  { name: 'Volta às Aulas', tasks: 7, closed: 5, mode: 'hibrido', hours: 18, status: 'reviewed' },
  { name: 'Páscoa', tasks: 6, closed: 0, mode: '—', hours: 0, status: 'draft' },
  { name: 'Dia dos Pais', tasks: 6, closed: 0, mode: '—', hours: 0, status: 'draft' },
];

// Sparkline simples (SVG mini)
const SPARKLINE_DATA = [30, 45, 28, 60, 72, 55, 80, 95, 88, 127];

const DONUT_DATA = [
  { name: 'IA 100%', value: SUMMARY.modeDistribution.ia, color: '#3D7BFF' },
  { name: 'Híbrido', value: SUMMARY.modeDistribution.hibrido, color: '#6F9BFF' },
  { name: 'Manual', value: SUMMARY.modeDistribution.manual, color: '#22304A' },
];

const STATUS_LABELS: Record<string, string> = { draft: 'Rascunho', reviewed: 'Revisado', synced: 'Sincronizado' };
const STATUS_CLASSES: Record<string, string> = { draft: 'badge-baixa', reviewed: 'badge-media', synced: 'badge-synced' };
const MODE_LABELS: Record<string, string> = { ia: 'IA 100%', hibrido: 'Híbrido', manual: 'Manual', '—': '—' };

function Sparkline({ data, color = '#3D7BFF' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80; const h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(' ')[pts.split(' ').length - 1].split(',')[0]} cy={pts.split(' ')[pts.split(' ').length - 1].split(',')[1]} r="2.5" fill={color} />
    </svg>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--nova-bg-elev-2)', border: '1px solid var(--nova-border)', borderRadius: '.625rem', padding: '.625rem .875rem' }}>
        <div style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)', marginBottom: '.25rem' }}>{label}</div>
        <div style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--nova-blue)' }}>{payload[0].value}h economizadas</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const kpis = [
    { label: 'Horas economizadas', value: `${SUMMARY.totalSavedHours}h`, sub: '+12h este mês', color: 'var(--nova-blue)' },
    { label: 'Tarefas encerradas', value: `${SUMMARY.closedTasks}/${SUMMARY.totalTasks}`, sub: `${Math.round((SUMMARY.closedTasks / SUMMARY.totalTasks) * 100)}% concluídas`, color: 'var(--c-success)' },
    { label: 'Média por tarefa', value: `${SUMMARY.avgSavedPerTask}h`, sub: 'tempo economizado', color: 'var(--c-info)' },
    { label: 'Uso de IA', value: `${SUMMARY.modeDistribution.ia}%`, sub: 'das tarefas com IA', color: 'var(--nova-blue)' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.25rem' }}>Dashboard de IA</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--nova-text-muted)' }}>Métricas de produtividade e uso de IA nas campanhas.</p>
        </div>
        <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap' }}>
          <div style={{
            padding: '.375rem .875rem', borderRadius: '.5rem', fontSize: '.75rem', fontWeight: 600,
            background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', color: 'var(--c-warning)',
          }}>
            Modo demonstração
          </div>
          <button className="btn-blue" onClick={() => navigate('/')} style={{ justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova campanha
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card" style={{ padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.3rem' }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: '1.625rem', fontWeight: 700, color: kpi.color, lineHeight: 1.1 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--nova-text-muted)', marginTop: '.25rem' }}>{kpi.sub}</div>
              </div>
              <Sparkline data={SPARKLINE_DATA} color={kpi.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos — linha 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', marginBottom: '1rem' }}>

        {/* Barras: horas por campanha */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '.25rem' }}>Horas economizadas por campanha</div>
          <div style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)', marginBottom: '1rem' }}>Total acumulado de tempo salvo com IA</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SUMMARY.savedByCampaign} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="campaignName" tick={{ fill: 'var(--nova-text-dim)', fontSize: 11, fontFamily: 'Sora, sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--nova-text-dim)', fontSize: 11, fontFamily: 'Sora, sans-serif' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(61,123,255,.06)' }} />
              <Bar dataKey="savedHours" fill="#3D7BFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut: modo de produção */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '.25rem' }}>Modo de produção</div>
          <div style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)', marginBottom: '.5rem' }}>Distribuição de tarefas encerradas</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={DONUT_DATA}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {DONUT_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => <span style={{ fontSize: '.75rem', color: 'var(--nova-text-muted)', fontFamily: 'Sora, sans-serif' }}>{value}</span>}
                iconType="circle"
                iconSize={8}
              />
              <Tooltip formatter={(val: number) => [`${val}%`, '']} contentStyle={{ background: 'var(--nova-bg-elev-2)', border: '1px solid var(--nova-border)', borderRadius: '.5rem', fontFamily: 'Sora, sans-serif', fontSize: '.8125rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumprimento de prazos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3rem', height: '3rem', borderRadius: '.875rem', flexShrink: 0,
            background: 'rgba(74,222,128,.1)', border: '1.5px solid rgba(74,222,128,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--c-success)' }}>{SUMMARY.deadlineCompliance.onTime}%</div>
            <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--nova-text-muted)' }}>Entregues no prazo</div>
          </div>
          {/* Mini barra de progresso */}
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--nova-bg-elev-2)', overflow: 'hidden', marginLeft: '.5rem' }}>
            <div style={{ width: `${SUMMARY.deadlineCompliance.onTime}%`, height: '100%', background: 'var(--c-success)', borderRadius: 3, transition: 'width .8s ease' }} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3rem', height: '3rem', borderRadius: '.875rem', flexShrink: 0,
            background: 'rgba(255,107,107,.1)', border: '1.5px solid rgba(255,107,107,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--c-danger)' }}>{SUMMARY.deadlineCompliance.late}%</div>
            <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--nova-text-muted)' }}>Entregues com atraso</div>
          </div>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--nova-bg-elev-2)', overflow: 'hidden', marginLeft: '.5rem' }}>
            <div style={{ width: `${SUMMARY.deadlineCompliance.late}%`, height: '100%', background: 'var(--c-danger)', borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Tarefas por membro */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
          <div>
            <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)' }}>Tarefas em andamento por membro</div>
            <div style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>Sprint atual — visão consolidada</div>
          </div>
          <Link to="/sprints" style={{ fontSize: '.75rem', color: 'var(--nova-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
            Ver todos os sprints
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {MEMBERS.map((member) => {
            const activeTasks = member.tasks.filter(t => t.status === 'doing' || t.status === 'review');
            return (
              <div key={member.name} className="glass-card" style={{ padding: '1.125rem' }}>
                {/* Header do membro */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.875rem' }}>
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                    background: `${member.teamColor}20`, border: `1.5px solid ${member.teamColor}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.625rem', fontWeight: 700, color: member.teamColor,
                  }}>{member.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                    <Link to={member.teamPath} style={{ fontSize: '.6875rem', color: member.teamColor, textDecoration: 'none', fontWeight: 600 }}>{member.team}</Link>
                  </div>
                  <div style={{ fontSize: '.6875rem', fontWeight: 700, color: activeTasks.length > 0 ? 'var(--nova-blue)' : 'var(--nova-text-dim)', background: activeTasks.length > 0 ? 'rgba(61,123,255,.1)' : 'rgba(93,104,128,.1)', padding: '.15rem .5rem', borderRadius: '2rem' }}>
                    {activeTasks.length} ativas
                  </div>
                </div>

                {/* Tarefas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
                  {member.tasks.map((task, i) => {
                    const st = TASK_STATUS[task.status];
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.375rem .5rem', borderRadius: '.5rem', background: 'rgba(255,255,255,.03)', border: '1px solid var(--glass-brd)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '.75rem', color: 'var(--nova-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</span>
                        <span style={{ fontSize: '.6rem', fontWeight: 600, color: st.color, padding: '.1rem .4rem', borderRadius: '2rem', background: st.bg, flexShrink: 0 }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela de campanhas */}
      <div className="glass-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
        <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '1rem' }}>Campanhas</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8125rem' }}>
            <thead>
              <tr>
                {['Campanha', 'Tarefas', 'Progresso', 'Modo principal', 'Horas salvas', 'Status'].map((col) => (
                  <th key={col} style={{
                    textAlign: 'left', padding: '.5rem .75rem',
                    fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)',
                    textTransform: 'uppercase', letterSpacing: '.06em',
                    borderBottom: '1px solid var(--nova-border)',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS_TABLE.map((c, i) => (
                <tr key={i} style={{ borderBottom: i < CAMPAIGNS_TABLE.length - 1 ? '1px solid var(--glass-brd)' : 'none' }}>
                  <td style={{ padding: '.625rem .75rem', fontWeight: 600, color: 'var(--nova-text)' }}>{c.name}</td>
                  <td style={{ padding: '.625rem .75rem', color: 'var(--nova-text-muted)' }}>{c.closed}/{c.tasks}</td>
                  <td style={{ padding: '.625rem .75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <div style={{ width: 80, height: 5, borderRadius: 3, background: 'var(--nova-bg-elev-2)', overflow: 'hidden' }}>
                        <div style={{ width: `${c.tasks > 0 ? (c.closed / c.tasks) * 100 : 0}%`, height: '100%', background: '#3D7BFF', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>
                        {c.tasks > 0 ? Math.round((c.closed / c.tasks) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '.625rem .75rem', color: 'var(--nova-text-muted)' }}>{MODE_LABELS[c.mode]}</td>
                  <td style={{ padding: '.625rem .75rem', fontWeight: 600, color: c.hours > 0 ? 'var(--nova-blue)' : 'var(--nova-text-dim)' }}>
                    {c.hours > 0 ? `${c.hours}h` : '—'}
                  </td>
                  <td style={{ padding: '.625rem .75rem' }}>
                    <span className={`badge ${STATUS_CLASSES[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
