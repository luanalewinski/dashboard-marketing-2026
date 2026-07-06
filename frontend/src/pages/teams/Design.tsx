import { useState } from 'react';
import TeamCommandCenter from '../../components/TeamCommandCenter';
import { getStatusStyle, getPriorityStyle, formatDue, CU, CUTask } from '../../lib/clickup';

// ── Designer config ───────────────────────────────────────────────────────────
const DESIGNERS = [
  {
    key: 'luana',
    name: 'Luana',
    initials: 'LL',
    color: '#3D7BFF',
    match: (t: CUTask) =>
      t.assignees.some(a =>
        a.username.toLowerCase().includes('luana') ||
        a.initials.toUpperCase() === 'LL'
      ),
  },
  {
    key: 'douglas',
    name: 'Douglas',
    initials: 'DG',
    color: '#4ADE80',
    match: (t: CUTask) =>
      t.assignees.some(a =>
        a.username.toLowerCase().includes('douglas') ||
        a.initials.toUpperCase() === 'DG' ||
        a.initials.toUpperCase() === 'DD'
      ),
  },
] as const;

// ── Micro-components (local to Design) ───────────────────────────────────────

function Skel({ w, h, r = 8 }: { w: string | number; h: number; r?: number }) {
  return (
    <div style={{
      width: typeof w === 'number' ? `${w}px` : w,
      height: h, borderRadius: r,
      background: 'rgba(255,255,255,.04)',
      animation: 'pulse 1.5s ease-in-out infinite',
      flexShrink: 0,
    }} />
  );
}

// ── Designer board ────────────────────────────────────────────────────────────
function DesignerBoard({
  designer,
  tasks,
  loading,
}: {
  designer: typeof DESIGNERS[number];
  tasks: CUTask[];
  loading: boolean;
}) {
  const myTasks   = tasks.filter(designer.match);
  const open      = myTasks.filter(t => t.status.type !== 'closed');
  const closed    = myTasks.filter(t => t.status.type === 'closed');
  const todayMs   = new Date().setHours(0, 0, 0, 0);
  const weekAgoMs = todayMs - 7 * 86_400_000;

  const weekDeliveries = myTasks.filter(t =>
    t.status.type === 'closed' && parseInt(t.date_updated) >= weekAgoMs
  );

  const highP   = open.filter(t => t.priority?.priority === 'urgent' || t.priority?.priority === 'high');
  const openPct = myTasks.length ? Math.round(closed.length / myTasks.length * 100) : 0;

  const dueToday = open.filter(t => {
    if (!t.due_date) return false;
    const ms = parseInt(t.due_date);
    return ms >= todayMs && ms < todayMs + 86_400_000;
  });
  const overdue = open.filter(t => !!t.due_date && parseInt(t.due_date) < todayMs);

  const isOverloaded = open.length >= 6 || highP.length >= 3;

  return (
    <div style={{
      borderRadius: 20, padding: '24px 26px',
      background: '#0B0D1A',
      border: `1px solid ${isOverloaded ? 'rgba(255,107,107,.2)' : 'rgba(255,255,255,.05)'}`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Accent line top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${designer.color}, transparent)`, borderRadius: '20px 20px 0 0' }} />

      {/* Overload glow */}
      {isOverloaded && (
        <div style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: `${designer.color}18`, border: `2px solid ${designer.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '.72rem', fontWeight: 800, color: designer.color,
          letterSpacing: '.03em',
        }}>
          {designer.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.95rem', fontWeight: 700, color: '#EEF2F8', letterSpacing: '-.01em' }}>
            {designer.name}
          </div>
          <div style={{ fontSize: '.65rem', color: 'rgba(238,242,248,.3)', marginTop: 1 }}>
            Designer
          </div>
        </div>
        {isOverloaded && (
          <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,107,107,.12)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,.2)' }}>
            Sobrecarregada
          </span>
        )}
      </div>

      {/* KPI mini-row */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[1,2,3,4].map(i => <Skel key={i} w="100%" h={56} r={12} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Abertas',       val: open.length,            color: designer.color },
            { label: 'Alta prior.',   val: highP.length,           color: highP.length ? '#FF6B6B' : 'rgba(238,242,248,.3)' },
            { label: 'Vence hoje',    val: dueToday.length,        color: dueToday.length ? '#FBBF24' : 'rgba(238,242,248,.3)' },
            { label: 'Esta semana',   val: weekDeliveries.length,  color: '#4ADE80' },
          ].map(k => (
            <div key={k.label} style={{
              background: 'rgba(255,255,255,.03)', borderRadius: 12, padding: '12px 14px',
              border: '1px solid rgba(255,255,255,.05)',
            }}>
              <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
                {k.label}
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-.04em', color: k.color, lineHeight: 1 }}>
                {k.val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!loading && myTasks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: '.64rem', fontWeight: 600, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Progresso
            </span>
            <span style={{ fontSize: '.7rem', fontWeight: 700, color: designer.color }}>{openPct}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${openPct}%`, height: '100%', background: designer.color, borderRadius: 3, transition: 'width .5s ease', opacity: .85 }} />
          </div>
          <div style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.2)', marginTop: 4 }}>
            {closed.length} de {myTasks.length} concluídas
          </div>
        </div>
      )}

      {/* Alertas inline */}
      {!loading && overdue.length > 0 && (
        <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,107,107,.06)', border: '1px solid rgba(255,107,107,.14)', marginBottom: 14 }}>
          <span style={{ fontSize: '.67rem', color: '#FF6B6B', fontWeight: 600 }}>
            ⚠ {overdue.length} tarefa{overdue.length !== 1 ? 's' : ''} atrasada{overdue.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[1,2,3].map(i => <Skel key={i} w="100%" h={42} r={10} />)}
        </div>
      ) : open.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(238,242,248,.2)', fontSize: '.75rem' }}>
          Nenhuma tarefa aberta
        </div>
      ) : (
        <>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.2)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
            Tarefas abertas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {open.slice(0, 8).map(t => {
              const st  = getStatusStyle(t);
              const pri = getPriorityStyle(t);
              const due = formatDue(t.due_date);
              const isLate = !!t.due_date && parseInt(t.due_date) < todayMs;
              return (
                <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '9px 12px', borderRadius: 10,
                      background: 'rgba(255,255,255,.025)',
                      borderTop: '1px solid rgba(255,255,255,.04)',
                      borderRight: '1px solid rgba(255,255,255,.04)',
                      borderBottom: '1px solid rgba(255,255,255,.04)',
                      borderLeft: `3px solid ${pri?.cls === 'badge-alta' ? '#FF6B6B' : pri?.cls === 'badge-media' ? '#FBBF24' : 'rgba(255,255,255,.12)'}`,
                      transition: 'background .15s', cursor: 'pointer',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)')}
                  >
                    <span style={{ flex: 1, fontSize: '.73rem', fontWeight: 500, color: '#EEF2F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                      {t.name}
                    </span>
                    {due && (
                      <span style={{ fontSize: '.6rem', fontWeight: 600, color: isLate ? '#FF6B6B' : 'rgba(238,242,248,.28)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {isLate ? '⚠ ' : ''}{due}
                      </span>
                    )}
                    <span style={{
                      fontSize: '.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                      color: st.color, background: st.bg, border: `1px solid ${st.color}30`,
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {st.label}
                    </span>
                  </div>
                </a>
              );
            })}
            {open.length > 8 && (
              <div style={{ textAlign: 'center', fontSize: '.67rem', color: 'rgba(238,242,248,.25)', padding: '4px 0' }}>
                +{open.length - 8} tarefa{open.length - 8 !== 1 ? 's' : ''} no ClickUp
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TEAM_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="13.5" cy="6.5" r="3.5"/>
    <circle cx="8.5"  cy="20"  r="3.5"/>
    <line x1="13.5" y1="10" x2="13.5" y2="20"/>
    <line x1="13.5" y1="20" x2="5"    y2="20"/>
  </svg>
);

export default function Design() {
  const [teamTasks, setTeamTasks] = useState<CUTask[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  return (
    <TeamCommandCenter
      config={{
        name: 'Time Design',
        subtitle: 'Produção visual e peças criativas · ao vivo via ClickUp',
        color: '#FBBF24',
        listId: CU.LIST_SOCIAL,
        listUrl: `https://app.clickup.com/36941541/v/l/${CU.LIST_SOCIAL}`,
        icon: TEAM_ICON,
      }}
      onTasksLoaded={t => { setTeamTasks(t); setTasksLoaded(true); }}
    >
      {/* ── DESIGNER BOARDS ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 14 }}>
        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 26px',
          background: '#0B0D1A', borderRadius: 20,
          border: '1px solid rgba(255,255,255,.05)',
          marginBottom: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: 'rgba(251,191,36,.1)', border: '1.5px solid rgba(251,191,36,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>Carga por Designer</div>
            <div style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', marginTop: 2 }}>
              Visão individual de tarefas, prazos e progresso
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {DESIGNERS.map(d => {
              const count = teamTasks.filter(d.match).filter(t => t.status.type !== 'closed').length;
              return (
                <span key={d.key} style={{
                  fontSize: '.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                  background: `${d.color}12`, color: d.color, border: `1px solid ${d.color}20`,
                }}>
                  {d.name} · {count} abertas
                </span>
              );
            })}
          </div>
        </div>

        {/* Boards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {DESIGNERS.map(d => (
            <DesignerBoard
              key={d.key}
              designer={d}
              tasks={teamTasks}
              loading={!tasksLoaded}
            />
          ))}
        </div>
      </div>
    </TeamCommandCenter>
  );
}
