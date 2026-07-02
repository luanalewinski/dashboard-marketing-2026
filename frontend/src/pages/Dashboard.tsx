import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getListTasks, CU, CUTask, CUAssignee } from '../lib/clickup';

// ── Tipos internos ────────────────────────────────────────────────────
interface TeamData {
  key: string;
  label: string;
  color: string;
  path: string;
  tasks: CUTask[];
}

const TEAMS: Omit<TeamData, 'tasks'>[] = [
  { key: 'social',    label: 'Social & Design', color: '#3D7BFF', path: '/time/social' },
  { key: 'analytics', label: 'Analíticos',       color: '#6F9BFF', path: '/time/benchmarking' },
  { key: 'ev002',     label: 'Conv. Cartagena',  color: '#FBBF24', path: '/eventos' },
  { key: 'ev003',     label: 'CORBAN 360',        color: '#4ADE80', path: '/eventos' },
];

const LIST_IDS: Record<string, string> = {
  social:    CU.LIST_SOCIAL,
  analytics: CU.LIST_ANALYTICS,
  ev002:     CU.LIST_EV002,
  ev003:     CU.LIST_EV003,
};

const STATUS_COLOR: Record<string, string> = {
  'a fazer':      '#5D6880',
  'em andamento': '#3D7BFF',
  'em aprovação': '#FBBF24',
  'em ajustes':   '#FF6B6B',
  'concluído':    '#4ADE80',
};

// ── Helpers ───────────────────────────────────────────────────────────
function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

function Sparkline({ values, color = '#3D7BFF' }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const W = 80, H = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--nova-bg-elev)', border: '1px solid var(--nova-border)', borderRadius: '.625rem', padding: '.5rem .75rem', fontSize: '.75rem', color: 'var(--nova-text)' }}>
      <div style={{ fontWeight: 600, marginBottom: '.25rem' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: 'var(--nova-text-dim)' }}>{p.name}: <b style={{ color: 'var(--nova-text)' }}>{p.value}</b></div>)}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────
export default function Dashboard() {
  const [teams, setTeams]   = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    const keys = TEAMS.map(t => t.key);
    Promise.all(keys.map(k => getListTasks(LIST_IDS[k], 0, true)))
      .then(results => {
        setTeams(TEAMS.map((t, i) => ({ ...t, tasks: results[i] })));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Agregados ────────────────────────────────────────────────────
  const allTasks  = teams.flatMap(t => t.tasks);
  const total     = allTasks.length;
  const done      = allTasks.filter(t => t.status.type === 'closed').length;
  const inProg    = allTasks.filter(t => t.status.status === 'em andamento').length;
  const inReview  = allTasks.filter(t => t.status.status === 'em aprovação').length;
  const pctDone   = pct(done, total);

  // Distribuição de status para gráfico de pizza
  const statusCounts: Record<string, number> = {};
  allTasks.forEach(t => {
    const s = t.status.status;
    statusCounts[s] = (statusCounts[s] ?? 0) + 1;
  });
  const donutData = Object.entries(statusCounts).map(([name, value]) => ({
    name, value, color: STATUS_COLOR[name] ?? '#5D6880',
  })).sort((a, b) => b.value - a.value);

  // Bar chart por time
  const barData = teams.map(t => ({
    name: t.label,
    total:  t.tasks.length,
    feitas: t.tasks.filter(tk => tk.status.type === 'closed').length,
    em_andamento: t.tasks.filter(tk => tk.status.status === 'em andamento').length,
  }));

  // Top assignees
  const assigneeMap: Record<number, { info: CUAssignee; count: number; done: number }> = {};
  allTasks.forEach(t => {
    t.assignees.forEach(a => {
      if (!assigneeMap[a.id]) assigneeMap[a.id] = { info: a, count: 0, done: 0 };
      assigneeMap[a.id].count++;
      if (t.status.type === 'closed') assigneeMap[a.id].done++;
    });
  });
  const topAssignees = Object.values(assigneeMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Sparkline data: tasks por time
  const sparkValues = teams.map(t => t.tasks.length);

  // ── KPI cards ────────────────────────────────────────────────────
  const kpis = [
    { label: 'Total de tarefas',   value: total,   sub: `em ${TEAMS.length} listas`, color: '#3D7BFF' },
    { label: 'Em andamento',       value: inProg,  sub: 'em progresso agora',          color: '#6F9BFF' },
    { label: 'Em aprovação',       value: inReview, sub: 'aguardando revisão',          color: '#FBBF24' },
    { label: 'Concluídas',         value: done,    sub: `${pctDone}% do total`,         color: '#4ADE80' },
  ];

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ padding: '1.25rem', borderRadius: '.75rem', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.2)', color: '#FF6B6B' }}>
          Erro ao carregar dados do ClickUp: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.25rem' }}>Dashboard</h1>
          <p style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)' }}>
            Visão geral ao vivo — dados do ClickUp atualizados em tempo real
          </p>
        </div>
        <a href={`https://app.clickup.com/36941541`} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '.75rem', color: '#3D7BFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.25rem', padding: '.4rem .75rem', border: '1px solid rgba(61,123,255,.25)', borderRadius: '.625rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Abrir ClickUp
        </a>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {loading
          ? [1,2,3,4].map(i => (
              <div key={i} style={{ height: 100, borderRadius: '1rem', background: 'rgba(255,255,255,.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))
          : kpis.map(kpi => (
            <div key={kpi.label} className="glass-card" style={{ padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: kpi.color, lineHeight: 1.1 }}>{kpi.value}</div>
                  <div style={{ fontSize: '.6875rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '.25rem' }}>{kpi.label}</div>
                </div>
                <Sparkline values={sparkValues} color={kpi.color} />
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)', marginTop: '.25rem' }}>{kpi.sub}</div>
            </div>
          ))
        }
      </div>

      {/* Barra geral de progresso */}
      {!loading && total > 0 && (
        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.625rem', flexWrap: 'wrap', gap: '.5rem' }}>
            <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)' }}>Progresso geral</span>
            <span style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>{done} de {total} tarefas concluídas</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
            <div style={{ width: `${pctDone}%`, height: '100%', background: pctDone === 100 ? '#4ADE80' : '#3D7BFF', borderRadius: 5, transition: 'width .4s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'A fazer', count: allTasks.filter(t => t.status.status === 'a fazer').length, color: '#5D6880' },
              { label: 'Em andamento', count: inProg, color: '#3D7BFF' },
              { label: 'Em aprovação', count: inReview, color: '#FBBF24' },
              { label: 'Em ajustes', count: allTasks.filter(t => t.status.status === 'em ajustes').length, color: '#FF6B6B' },
              { label: 'Concluídas', count: done, color: '#4ADE80' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>{s.label}</span>
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--nova-text)' }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>

        {/* Bar chart: tarefas por time */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '1.25rem' }}>Tarefas por lista</div>
          {loading ? (
            <div style={{ height: 200, background: 'rgba(255,255,255,.03)', borderRadius: '.75rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--nova-text-dim)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--nova-text-dim)' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CTooltip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                <Bar dataKey="em_andamento" name="Em andamento" stackId="a" fill="#3D7BFF" radius={[0,0,0,0]} />
                <Bar dataKey="feitas" name="Concluídas" stackId="a" fill="#4ADE80" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut: distribuição de status */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '1rem' }}>Por status</div>
          {loading ? (
            <div style={{ height: 200, background: 'rgba(255,255,255,.03)', borderRadius: '.75rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip content={<CTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Times: cards rápidos + top assignees */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' }}>

        {/* Cards de times */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div style={{ fontSize: '.6875rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Times & Projetos</div>
          {loading
            ? [1,2,3,4].map(i => <div key={i} style={{ height: 68, borderRadius: '.75rem', background: 'rgba(255,255,255,.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />)
            : teams.map(t => {
                const tDone  = t.tasks.filter(tk => tk.status.type === 'closed').length;
                const tProg  = pct(tDone, t.tasks.length);
                const tInP   = t.tasks.filter(tk => tk.status.status === 'em andamento').length;
                return (
                  <Link key={t.key} to={t.path} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '.875rem 1rem', borderRadius: '.75rem',
                      background: 'var(--glass)', border: '1px solid var(--glass-brd)',
                      transition: 'background .15s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--glass)')}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.375rem' }}>
                          <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)' }}>{t.label}</span>
                          <span style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>{tDone}/{t.tasks.length}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${tProg}%`, height: '100%', background: t.color, borderRadius: 2, transition: 'width .4s ease' }} />
                        </div>
                        <div style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)', marginTop: '.375rem' }}>
                          {tInP > 0 && `${tInP} em andamento · `}{tProg}% concluído
                        </div>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--nova-text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </Link>
                );
              })
          }
        </div>

        {/* Top responsáveis */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '1rem' }}>Top responsáveis</div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ height: 40, borderRadius: '.625rem', background: 'rgba(255,255,255,.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : topAssignees.length === 0 ? (
            <div style={{ fontSize: '.8125rem', color: 'var(--nova-text-dim)', textAlign: 'center', padding: '1rem' }}>
              Nenhum responsável encontrado.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {topAssignees.map(({ info: a, count, done: d }) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: a.profilePicture ? `url(${a.profilePicture}) center/cover` : a.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.5625rem', fontWeight: 700, color: '#fff', border: '1.5px solid var(--nova-bg-elev)',
                  }}>
                    {!a.profilePicture && a.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.8125rem', fontWeight: 500, color: 'var(--nova-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.username}
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginTop: '.25rem' }}>
                      <div style={{ width: `${pct(d, count)}%`, height: '100%', background: '#3D7BFF', borderRadius: 2 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tarefas urgentes */}
      {!loading && (() => {
        const urgent = allTasks
          .filter(t => t.priority?.priority === 'urgent' || t.priority?.priority === 'high')
          .filter(t => t.status.type !== 'closed')
          .slice(0, 6);
        if (!urgent.length) return null;
        return (
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '1rem' }}>
              Prioridade alta
              <span style={{ marginLeft: '.5rem', fontSize: '.6875rem', fontWeight: 600, color: '#FF6B6B', background: 'rgba(255,107,107,.1)', padding: '.15rem .5rem', borderRadius: '2rem' }}>
                {urgent.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
              {urgent.map(t => {
                const teamColor = teams.find(tm => tm.tasks.some(tk => tk.id === t.id))?.color ?? '#3D7BFF';
                return (
                  <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap',
                      padding: '.625rem .875rem', borderRadius: '.625rem',
                      background: 'rgba(255,107,107,.04)', border: '1px solid rgba(255,107,107,.12)',
                      transition: 'background .15s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,107,107,.04)')}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: teamColor, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '.8125rem', fontWeight: 500, color: 'var(--nova-text)', minWidth: 140 }}>{t.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {t.assignees.slice(0, 2).map((a, i) => (
                          <div key={a.id} title={a.username} style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            background: a.profilePicture ? `url(${a.profilePicture}) center/cover` : a.color,
                            border: '1.5px solid var(--nova-bg-elev)', marginLeft: i > 0 ? '-5px' : 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '.45rem', fontWeight: 700, color: '#fff',
                          }}>
                            {!a.profilePicture && a.initials}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: '.625rem', fontWeight: 700, color: '#FF6B6B', padding: '.15rem .5rem', borderRadius: '2rem', background: 'rgba(255,107,107,.12)', flexShrink: 0 }}>
                        {t.priority?.priority === 'urgent' ? 'Urgente' : 'Alta'}
                      </span>
                      <span style={{ fontSize: '.625rem', fontWeight: 600, color: '#5D6880', padding: '.15rem .5rem', borderRadius: '2rem', background: 'rgba(93,104,128,.12)', flexShrink: 0 }}>
                        {t.status.status}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
