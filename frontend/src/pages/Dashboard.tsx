import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getListTasks, CU, CUTask } from '../lib/clickup';
import GridLayout, { CardConfig } from '../components/layout/GridLayout';

// ── Types ──────────────────────────────────────────────────────────────
interface TeamData {
  key: string;
  label: string;
  color: string;
  path: string;
  tasks: CUTask[];
}

const TEAMS: Omit<TeamData, 'tasks'>[] = [
  { key: 'social',    label: 'Social & Design', color: '#3D7BFF', path: '/time/social' },
  { key: 'analytics', label: 'Analíticos',      color: '#6F9BFF', path: '/time/benchmarking' },
  { key: 'ev002',     label: 'Conv. Cartagena', color: '#FBBF24', path: '/eventos' },
  { key: 'ev003',     label: 'CORBAN 360',       color: '#4ADE80', path: '/eventos' },
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

const DASHBOARD_CARDS: CardConfig[] = [
  { id: 'dash-tasks-done',   label: 'Tarefas Concluídas',   defaultColSpan: 5 },
  { id: 'dash-in-progress',  label: 'Em Andamento',          defaultColSpan: 3 },
  { id: 'dash-status-geral', label: 'Status Geral',          defaultColSpan: 4 },
  { id: 'dash-teams',        label: 'Times',                  defaultColSpan: 12 },
  { id: 'dash-tendencia',    label: 'Tendência de Entrega',  defaultColSpan: 8 },
  { id: 'dash-alta-prio',    label: 'Alta Prioridade',        defaultColSpan: 4 },
];

// ── Helpers ────────────────────────────────────────────────────────────
function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

function Skel({ w, h, r = 8 }: { w: number | string; h: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.8s ease-in-out infinite',
    }} />
  );
}

function Spark({ total, color = '#3D7BFF' }: { total: number; color?: string }) {
  const seed = Math.max(total, 10);
  const pts = [.08,.12,.09,.18,.22,.28,.35,.42,.38,.50,.58,.65,.60,.74,.80,.88,.92,1].map((f, i) => ({
    dia: `S${i + 1}`, valor: Math.round(f * seed),
  }));
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="valor" stroke={color} strokeWidth={1.5}
          fill="url(#sparkGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '6px 10px', fontSize: '.7rem' }}>
      <span style={{ color: '#3D7BFF', fontWeight: 700 }}>{payload[0].value} tasks</span>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────
export default function Dashboard() {
  const [teams, setTeams]     = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const keys = TEAMS.map(t => t.key);
    Promise.all(keys.map(k => getListTasks(LIST_IDS[k], 0, true)))
      .then(results => setTeams(TEAMS.map((t, i) => ({ ...t, tasks: results[i] }))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const allTasks    = teams.flatMap(t => t.tasks);
  const total       = allTasks.length;
  const done        = allTasks.filter(t => t.status.type === 'closed').length;
  const inProg      = allTasks.filter(t => t.status.status === 'em andamento').length;
  const inReview    = allTasks.filter(t => t.status.status === 'em aprovação').length;
  const inAdj       = allTasks.filter(t => t.status.status === 'em ajustes').length;
  const pctDone     = pct(done, total);
  const circ        = 2 * Math.PI * 28;

  const statusCounts: Record<string, number> = {};
  allTasks.forEach(t => { const s = t.status.status; statusCounts[s] = (statusCounts[s] ?? 0) + 1; });
  const donutData = Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value, color: STATUS_COLOR[name] ?? '#5D6880' }))
    .sort((a, b) => b.value - a.value);

  const urgentTasks = allTasks
    .filter(t => (t.priority?.priority === 'urgent' || t.priority?.priority === 'high') && t.status.type !== 'closed')
    .slice(0, 6);

  const sparkSeed = Math.max(total, 10);
  const sparkData = [.08,.14,.10,.22,.30,.36,.42,.50,.46,.58,.64,.72,.68,.80,.86,.94,1].map((f, i) => ({
    s: i + 1, v: Math.round(f * sparkSeed),
  }));

  if (error) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <div style={{ padding: '1.25rem', borderRadius: 16, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.18)', color: '#FF6B6B', fontSize: '.8125rem' }}>
        Erro ao carregar dados do ClickUp: {error}
      </div>
    </div>
  );

  // ── Card render map ─────────────────────────────────────────────────
  function renderCard(id: string) {
    switch (id) {

      case 'dash-tasks-done':
        return (
          <div className="bento-card" style={{
            background: 'linear-gradient(145deg, rgba(74,222,128,.07) 0%, rgba(74,222,128,.02) 40%, #0B0D1A 70%)',
            borderRadius: 24, padding: '28px 30px',
            border: '1px solid rgba(74,222,128,.14)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 14,
            minHeight: 160,
          }}>
            <div style={{ position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 28, right: 28, height: 1, background: 'linear-gradient(90deg, transparent, rgba(74,222,128,.45), transparent)' }} />
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
              Tarefas concluídas
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              {loading ? <Skel w={110} h={52} r={10} /> : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#EEF2F8', lineHeight: 1, letterSpacing: '-.05em' }}>{done}</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 500, color: 'rgba(238,242,248,.3)', letterSpacing: '-.01em' }}>/{total}</span>
                </div>
              )}
              {!loading && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.18)', borderRadius: 20, padding: '5px 12px', fontSize: '.7rem', fontWeight: 700, color: '#4ADE80' }}>
                  ↑ {pctDone}% concluído
                </div>
              )}
            </div>
            <div style={{ flex: 1, minHeight: 48 }}>
              <Spark total={total} />
            </div>
          </div>
        );

      case 'dash-in-progress':
        return (
          <div className="bento-card" style={{
            background: '#0B0D1A', borderRadius: 24, padding: '24px 26px',
            border: '1px solid rgba(255,255,255,.05)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: 160,
          }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em' }}>Em andamento</div>
            {loading ? <Skel w={80} h={48} r={8} /> : (
              <div>
                <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#3D7BFF', lineHeight: 1, letterSpacing: '-.05em' }}>{inProg}</div>
                <div style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.3)', marginTop: 6 }}>tarefas ativas agora</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '.62rem', fontWeight: 700, color: '#FBBF24', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.18)', borderRadius: 20, padding: '3px 9px' }}>
                {loading ? '–' : inReview} em aprovação
              </div>
              <div style={{ fontSize: '.62rem', fontWeight: 700, color: '#FF6B6B', background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.18)', borderRadius: 20, padding: '3px 9px' }}>
                {loading ? '–' : inAdj} em ajustes
              </div>
            </div>
          </div>
        );

      case 'dash-status-geral':
        return (
          <div className="bento-card" style={{
            background: '#0B0D1A', borderRadius: 24, padding: '24px 26px',
            border: '1px solid rgba(255,255,255,.05)',
            display: 'flex', flexDirection: 'column', gap: 18,
            minHeight: 160,
          }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em' }}>Status geral</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {loading ? <Skel w={72} h={72} r={36} /> : (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="5" />
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#4ADE80" strokeWidth="5"
                      strokeDasharray={`${(pctDone / 100) * circ} ${circ}`}
                      transform="rotate(-90 36 36)" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#EEF2F8', lineHeight: 1, letterSpacing: '-.03em' }}>{pctDone}%</span>
                    <span style={{ fontSize: '.42rem', color: 'rgba(238,242,248,.25)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>done</span>
                  </div>
                </div>
              )}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {loading ? [1,2,3].map(i => <Skel key={i} w="100%" h={12} r={4} />) :
                  donutData.slice(0, 3).map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.4)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                      <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'rgba(238,242,248,.7)' }}>{d.value}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        );

      case 'dash-teams':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {loading
              ? [0,1,2,3].map(i => (
                <div key={i} className="bento-card" style={{
                  background: '#0B0D1A', borderRadius: 20, padding: '22px 24px',
                  border: '1px solid rgba(255,255,255,.05)',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  animationDelay: `${.15 + i * .05}s`,
                }}>
                  <Skel w={80} h={10} />
                  <Skel w={50} h={34} />
                  <Skel w="100%" h={4} r={4} />
                </div>
              ))
              : teams.map((t, i) => {
                const tDone = t.tasks.filter(tk => tk.status.type === 'closed').length;
                const tProg = pct(tDone, t.tasks.length);
                const tInP  = t.tasks.filter(tk => tk.status.status === 'em andamento').length;
                return (
                  <Link key={t.key} to={t.path} className="bento-card" style={{
                    background: '#0B0D1A', borderRadius: 20, padding: '22px 24px',
                    border: '1px solid rgba(255,255,255,.05)',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    textDecoration: 'none', transition: 'border-color .2s, transform .2s',
                    animationDelay: `${.15 + i * .05}s`,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${t.color}30`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'rgba(238,242,248,.4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{t.label}</span>
                      </div>
                      <span style={{ fontSize: '.58rem', fontWeight: 700, background: `${t.color}14`, color: t.color, border: `1px solid ${t.color}28`, borderRadius: 20, padding: '2px 8px' }}>
                        {tDone}/{t.tasks.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#EEF2F8', lineHeight: 1, letterSpacing: '-.04em' }}>{tProg}%</span>
                      <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.3)' }}>concluído</span>
                    </div>
                    <div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${tProg}%`, height: '100%', background: t.color, borderRadius: 4, transition: 'width .6s ease' }} />
                      </div>
                      {tInP > 0 && <div style={{ fontSize: '.6rem', color: 'rgba(238,242,248,.28)', marginTop: 6 }}>{tInP} em andamento</div>}
                    </div>
                  </Link>
                );
              })
            }
          </div>
        );

      case 'dash-tendencia':
        return (
          <div className="bento-card" style={{
            background: 'linear-gradient(180deg, rgba(61,123,255,.07) 0%, rgba(61,123,255,.02) 35%, #0B0D1A 65%)',
            borderRadius: 24, padding: '26px 28px',
            border: '1px solid rgba(61,123,255,.12)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 18,
          }}>
            <div style={{ position: 'absolute', top: -80, left: '30%', width: 300, height: 200, background: 'radial-gradient(ellipse, rgba(61,123,255,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>Tendência de entrega</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.03em' }}>
                  {loading ? '–' : total}
                  <span style={{ fontSize: '.875rem', fontWeight: 500, color: 'rgba(238,242,248,.3)', marginLeft: 6 }}>tasks totais</span>
                </div>
              </div>
              <a href={`https://app.clickup.com/${CU.SPACE_ID}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '.68rem', fontWeight: 600, color: '#3D7BFF', textDecoration: 'none', opacity: .7 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '.7')}
              >Ver no ClickUp →</a>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={sparkData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3D7BFF" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3D7BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,.04)" vertical={false} />
                <XAxis dataKey="s" tick={{ fontSize: 9, fill: 'rgba(238,242,248,.2)', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `S${v}`} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(238,242,248,.2)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(61,123,255,.2)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="v" stroke="#3D7BFF" strokeWidth={2} fill="url(#dashGrad)" dot={false} activeDot={{ r: 4, fill: '#3D7BFF', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'dash-alta-prio':
        return (
          <div className="bento-card" style={{
            background: urgentTasks.length > 0
              ? 'linear-gradient(145deg, rgba(255,107,107,.22) 0%, rgba(255,107,107,.08) 45%, #0B0D1A 72%)'
              : '#0B0D1A',
            borderRadius: 24, padding: '26px 28px',
            border: `1px solid ${urgentTasks.length > 0 ? 'rgba(255,107,107,.38)' : 'rgba(255,255,255,.05)'}`,
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            {urgentTasks.length > 0 && (
              <>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 28, right: 28, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,107,107,.5), transparent)' }} />
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em' }}>Alta prioridade</div>
              {!loading && urgentTasks.length > 0 && (
                <span style={{ fontSize: '.62rem', fontWeight: 700, color: '#FF6B6B', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 20, padding: '2px 8px' }}>
                  {urgentTasks.length}
                </span>
              )}
            </div>
            {loading ? <Skel w={60} h={48} r={8} /> : (
              <div>
                <div style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-.05em', color: urgentTasks.length > 0 ? '#FF6B6B' : '#EEF2F8' }}>
                  {urgentTasks.length}
                </div>
                <div style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.3)', marginTop: 6 }}>
                  {urgentTasks.length === 0 ? 'Nenhuma tarefa crítica' : `tarefa${urgentTasks.length !== 1 ? 's' : ''} crítica${urgentTasks.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            )}
            {!loading && urgentTasks.length > 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {urgentTasks.slice(0, 3).map(t => (
                  <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10, transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.03)')}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6B6B', flexShrink: 0 }} />
                    <span style={{ fontSize: '.68rem', color: '#EEF2F8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.name}</span>
                    <span style={{ fontSize: '.58rem', fontWeight: 700, color: '#FF6B6B', flexShrink: 0 }}>
                      {t.priority?.priority === 'urgent' ? '!' : '↑'}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .bento-card { animation: fadeUp .35s ease both; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.25)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>
              Sprint Q3 · 2026
            </div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.04em', lineHeight: 1 }}>
              Dashboard
            </h1>
          </div>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 10,
            background: '#3D7BFF', color: '#fff',
            fontSize: '.78rem', fontWeight: 700, textDecoration: 'none',
            transition: 'opacity .15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Brief
          </Link>
        </div>

        {/* ── BENTO GRID (with layout editor) ─────────────────────────── */}
        <GridLayout
          pageId="dashboard"
          cards={DASHBOARD_CARDS}
          renderCard={renderCard}
          gap={14}
        />
      </div>
    </>
  );
}
