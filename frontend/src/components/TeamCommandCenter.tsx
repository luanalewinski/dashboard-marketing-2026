import { useState, useEffect } from 'react';
import { getListTasks, getStatusStyle, formatDue, CUTask, CUAssignee } from '../lib/clickup';

// ── Public interface ───────────────────────────────────────────────────────────
export interface TeamConfig {
  name: string;
  subtitle: string;
  color: string;
  listId: string | null;
  listUrl?: string;
  icon?: React.ReactNode;
}

// ── Micro-components ──────────────────────────────────────────────────────────

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

function Chip({ color, bg, border = 'transparent', children }: {
  color: string; bg: string; border?: string; children: React.ReactNode;
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
      color, background: bg, border: `1px solid ${border}`,
      whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.6,
    }}>{children}</span>
  );
}

function Avatars({ assignees }: { assignees: CUAssignee[] }) {
  const top = assignees.slice(0, 3);
  if (!top.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {top.map((a, i) => (
        <div
          key={a.id}
          title={a.username}
          style={{
            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
            background: a.profilePicture ? undefined : a.color,
            backgroundImage: a.profilePicture ? `url(${a.profilePicture})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: '1.5px solid #0B0D1A',
            marginLeft: i > 0 ? -6 : 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.44rem', fontWeight: 700, color: '#fff',
          }}
        >
          {!a.profilePicture && a.initials}
        </div>
      ))}
    </div>
  );
}

function TaskRow({ task, accentColor }: { task: CUTask; accentColor: string }) {
  const st  = getStatusStyle(task);
  const due = formatDue(task.due_date);
  const todayMs = new Date().setHours(0, 0, 0, 0);
  const isOverdue = !!task.due_date && parseInt(task.due_date) < todayMs && task.status.type !== 'closed';

  return (
    <a href={task.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 12,
          background: 'rgba(255,255,255,.025)',
          borderTop: '1px solid rgba(255,255,255,.045)',
          borderRight: '1px solid rgba(255,255,255,.045)',
          borderBottom: '1px solid rgba(255,255,255,.045)',
          borderLeft: `3px solid ${accentColor}`,
          transition: 'background .15s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)')}
      >
        <span style={{
          flex: 1, fontSize: '.78rem', fontWeight: 500, color: '#EEF2F8',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          minWidth: 0,
        }}>
          {task.name}
        </span>
        <Avatars assignees={task.assignees} />
        {due && (
          <span style={{
            fontSize: '.62rem', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap',
            color: isOverdue ? '#FF6B6B' : 'rgba(238,242,248,.3)',
          }}>
            {isOverdue ? '⚠ ' : ''}{due}
          </span>
        )}
        <Chip color={st.color} bg={st.bg} border={`${st.color}30`}>{st.label}</Chip>
      </div>
    </a>
  );
}

function PrioritySection({ title, tasks, accentColor, badgeColor, badgeBg }: {
  title: string; tasks: CUTask[]; accentColor: string; badgeColor: string; badgeBg: string;
}) {
  const [expanded, setExpanded] = useState(true);
  if (!tasks.length) return null;

  return (
    <div style={{ marginBottom: 6 }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '6px 2px', marginBottom: expanded ? 8 : 4,
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
        <span style={{ fontSize: '.64rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          {title}
        </span>
        <span style={{
          fontSize: '.58rem', fontWeight: 700, padding: '1px 7px', borderRadius: 10,
          background: badgeBg, color: badgeColor,
        }}>
          {tasks.length}
        </span>
        <div style={{ flex: 1 }} />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="11" height="11"
          style={{ color: 'rgba(238,242,248,.18)', transform: expanded ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform .2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.map(t => <TaskRow key={t.id} task={t} accentColor={accentColor} />)}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function TeamCommandCenter({
  config,
  onTasksLoaded,
  children,
}: {
  config: TeamConfig;
  onTasksLoaded?: (tasks: CUTask[]) => void;
  children?: React.ReactNode;
}) {
  const [tasks, setTasks]   = useState<CUTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!config.listId) { setLoading(false); return; }
    getListTasks(config.listId, 0, true)
      .then(t => { setTasks(t); onTasksLoaded?.(t); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [config.listId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived data ─────────────────────────────────────────────────────────────
  const todayMs   = new Date().setHours(0, 0, 0, 0);
  const tomorrowMs = todayMs + 86_400_000;

  const closed   = tasks.filter(t => t.status.type === 'closed');
  const open     = tasks.filter(t => t.status.type !== 'closed');

  const doingTasks    = open.filter(t => t.status.status === 'em andamento');
  const approvalTasks = open.filter(t => t.status.status === 'em aprovação');
  const waitingTasks  = open.filter(t => t.status.status.toLowerCase().includes('aguard'));

  const highPriority  = open.filter(t => t.priority?.priority === 'urgent' || t.priority?.priority === 'high');
  const normalPriority = open.filter(t => t.priority?.priority === 'normal');
  const lowPriority   = open.filter(t => !t.priority || t.priority.priority === 'low');

  const dueToday = open.filter(t => {
    if (!t.due_date) return false;
    const ms = parseInt(t.due_date);
    return ms >= todayMs && ms < tomorrowMs;
  });
  const overdue = open.filter(t => !!t.due_date && parseInt(t.due_date) < todayMs);

  const upcoming = [...open]
    .filter(t => t.due_date && parseInt(t.due_date) >= todayMs)
    .sort((a, b) => parseInt(a.due_date!) - parseInt(b.due_date!))
    .slice(0, 7);

  const recentActivity = [...tasks]
    .sort((a, b) => parseInt(b.date_updated) - parseInt(a.date_updated))
    .slice(0, 6);

  const completionPct = tasks.length ? Math.round(closed.length / tasks.length * 100) : 0;
  const hasUrgent = highPriority.length > 0;
  const hasOverdue = overdue.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Sora, sans-serif' }}>

      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: `${config.color}12`, border: `1.5px solid ${config.color}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {config.icon ?? (
              <svg viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <circle cx="12" cy="8" r="4"/>
                <path d="M20 21a8 8 0 1 0-16 0"/>
              </svg>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.025em', margin: 0, lineHeight: 1.2 }}>
              {config.name}
            </h1>
            <p style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.32)', marginTop: 3, margin: '3px 0 0' }}>
              {config.subtitle}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {config.listUrl && (
            <a
              href={config.listUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,.07)',
                background: 'rgba(255,255,255,.03)',
                fontSize: '.7rem', fontWeight: 600, color: 'rgba(238,242,248,.45)',
                textDecoration: 'none', transition: 'all .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2F8'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.14)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.45)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Abrir no ClickUp
            </a>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: loading ? '#FBBF24' : error ? '#FF6B6B' : '#4ADE80',
              animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.38)' }}>
              {loading ? 'Carregando…' : error ? 'Erro' : `${tasks.length} tarefas`}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 16, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.18)', color: '#FF6B6B', fontSize: '.78rem', marginBottom: 14 }}>
          {error}
        </div>
      )}

      {/* Not connected */}
      {!config.listId && !loading && (
        <div style={{ padding: '32px', borderRadius: 20, background: '#0B0D1A', border: '1px solid rgba(255,255,255,.05)', textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'rgba(238,242,248,.35)', marginBottom: 6 }}>Lista do ClickUp não configurada</div>
          <div style={{ fontSize: '.75rem', color: 'rgba(238,242,248,.2)' }}>Adicione o LIST_ID em lib/clickup.ts para conectar</div>
        </div>
      )}

      {/* ── KPI ROW ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14, marginBottom: 14 }}>

        {/* 1 — Concluídas (verde) */}
        <div style={{
          gridColumn: 'span 3',
          borderRadius: 20, padding: '20px 22px',
          background: completionPct > 0
            ? 'linear-gradient(145deg, rgba(74,222,128,.09) 0%, rgba(74,222,128,.02) 50%, #0B0D1A 75%)'
            : '#0B0D1A',
          border: `1px solid ${completionPct > 0 ? 'rgba(74,222,128,.16)' : 'rgba(255,255,255,.05)'}`,
          position: 'relative', overflow: 'hidden',
        }}>
          {completionPct > 0 && (
            <div style={{ position: 'absolute', top: -50, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
          )}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: completionPct > 0 ? 'linear-gradient(90deg, #4ADE80, transparent)' : 'transparent', borderRadius: '20px 20px 0 0' }} />
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>
            Concluídas
          </div>
          {loading ? <Skel w="55%" h={44} r={10} /> : (
            <>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-.05em', color: completionPct > 0 ? '#4ADE80' : 'rgba(238,242,248,.25)', lineHeight: 1 }}>
                {closed.length}
              </div>
              <div style={{ fontSize: '.67rem', color: 'rgba(238,242,248,.28)', marginTop: 5 }}>
                {completionPct}% do total · {tasks.length} tarefas
              </div>
              <div style={{ marginTop: 14, height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${completionPct}%`, height: '100%', background: '#4ADE80', borderRadius: 2, transition: 'width .5s ease' }} />
              </div>
            </>
          )}
        </div>

        {/* 2 — Em andamento (azul analítico) */}
        <div style={{
          gridColumn: 'span 3',
          borderRadius: 20, padding: '20px 22px',
          background: 'linear-gradient(180deg, rgba(61,123,255,.07) 0%, rgba(61,123,255,.02) 40%, #0B0D1A 70%)',
          border: '1px solid rgba(61,123,255,.12)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,123,255,.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3D7BFF, transparent)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>
            Em andamento
          </div>
          {loading ? <Skel w="55%" h={44} r={10} /> : (
            <>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-.05em', color: doingTasks.length > 0 ? '#3D7BFF' : 'rgba(238,242,248,.25)', lineHeight: 1 }}>
                {doingTasks.length}
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Em aprovação', val: approvalTasks.length, color: '#FBBF24' },
                  { label: 'Aguardando',   val: waitingTasks.length,  color: 'rgba(238,242,248,.35)' },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <span style={{ fontSize: '.64rem', color: 'rgba(238,242,248,.28)' }}>{m.label}</span>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: m.color }}>{m.val}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 3 — Alta prioridade (vermelho) */}
        <div style={{
          gridColumn: 'span 3',
          borderRadius: 20, padding: '20px 22px',
          background: hasUrgent
            ? 'linear-gradient(145deg, rgba(255,107,107,.2) 0%, rgba(255,107,107,.07) 45%, #0B0D1A 72%)'
            : '#0B0D1A',
          border: `1px solid ${hasUrgent ? 'rgba(255,107,107,.32)' : 'rgba(255,255,255,.05)'}`,
          position: 'relative', overflow: 'hidden',
        }}>
          {hasUrgent && <>
            <div style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #FF6B6B, transparent)', borderRadius: '20px 20px 0 0' }} />
          </>}
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>
            Alta prioridade
          </div>
          {loading ? <Skel w="55%" h={44} r={10} /> : (
            <>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-.05em', color: hasUrgent ? '#FF6B6B' : 'rgba(238,242,248,.25)', lineHeight: 1 }}>
                {highPriority.length}
              </div>
              {highPriority.length > 0 ? (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {highPriority.slice(0, 3).map(t => (
                    <div key={t.id} style={{ fontSize: '.63rem', color: 'rgba(238,242,248,.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 8, borderLeft: '2px solid rgba(255,107,107,.35)' }}>
                      {t.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '.67rem', color: 'rgba(238,242,248,.25)', marginTop: 5 }}>Nenhuma urgência</div>
              )}
            </>
          )}
        </div>

        {/* 4 — Vence hoje */}
        <div style={{
          gridColumn: 'span 3',
          borderRadius: 20, padding: '20px 22px',
          background: '#0B0D1A',
          border: `1px solid ${dueToday.length > 0 ? 'rgba(251,191,36,.14)' : 'rgba(255,255,255,.05)'}`,
          position: 'relative', overflow: 'hidden',
        }}>
          {dueToday.length > 0 && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #FBBF24, transparent)', borderRadius: '20px 20px 0 0' }} />
          )}
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>
            Vence hoje
          </div>
          {loading ? <Skel w="55%" h={44} r={10} /> : (
            <>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-.05em', color: dueToday.length > 0 ? '#FBBF24' : 'rgba(238,242,248,.25)', lineHeight: 1 }}>
                {dueToday.length}
              </div>
              <div style={{ fontSize: '.67rem', marginTop: 5 }}>
                {hasOverdue
                  ? <span style={{ color: '#FF6B6B', fontWeight: 600 }}>{overdue.length} atrasada{overdue.length !== 1 ? 's' : ''}</span>
                  : <span style={{ color: 'rgba(238,242,248,.28)' }}>Sem atrasos</span>
                }
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── MAIN BENTO GRID ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14 }}>

        {/* LEFT — Tarefas por prioridade (8 cols) */}
        <div style={{
          gridColumn: 'span 8',
          background: '#0B0D1A', borderRadius: 20, padding: '24px 26px',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>Tarefas por prioridade</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: `🔴 ${highPriority.length}`,  show: !loading },
                { label: `🟡 ${normalPriority.length}`, show: !loading },
                { label: `⚪ ${lowPriority.length}`,   show: !loading },
              ].filter(b => b.show).map(b => (
                <span key={b.label} style={{ fontSize: '.62rem', fontWeight: 600, color: 'rgba(238,242,248,.28)' }}>{b.label}</span>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3,4,5].map(i => <Skel key={i} w="100%" h={48} r={12} />)}
            </div>
          ) : open.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(238,242,248,.18)', fontSize: '.8rem' }}>
              {!config.listId ? 'Conecte ao ClickUp para visualizar tarefas.' : 'Nenhuma tarefa aberta. ✓'}
            </div>
          ) : (
            <>
              <PrioritySection
                title="Alta prioridade"
                tasks={highPriority}
                accentColor="#FF6B6B"
                badgeColor="#FF6B6B"
                badgeBg="rgba(255,107,107,.12)"
              />
              <PrioritySection
                title="Média prioridade"
                tasks={normalPriority}
                accentColor="#FBBF24"
                badgeColor="#FBBF24"
                badgeBg="rgba(251,191,36,.12)"
              />
              <PrioritySection
                title="Baixa / sem prioridade"
                tasks={lowPriority}
                accentColor="rgba(238,242,248,.18)"
                badgeColor="rgba(238,242,248,.38)"
                badgeBg="rgba(255,255,255,.06)"
              />
            </>
          )}
        </div>

        {/* RIGHT — Sidebar (4 cols) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Próximos prazos */}
          <div style={{ background: '#0B0D1A', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>
              Próximos prazos
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <Skel key={i} w="100%" h={36} r={8} />)}
              </div>
            ) : upcoming.length === 0 ? (
              <div style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.2)', padding: '8px 0' }}>Nenhum prazo definido</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {upcoming.map(t => {
                  const dMs = parseInt(t.due_date!);
                  const isToday = dMs >= todayMs && dMs < tomorrowMs;
                  const isTmr = dMs >= tomorrowMs && dMs < tomorrowMs + 86_400_000;
                  const label = isToday ? 'Hoje' : isTmr ? 'Amanhã' : formatDue(t.due_date);
                  return (
                    <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10,
                          background: 'rgba(255,255,255,.025)',
                          border: `1px solid ${isToday ? 'rgba(251,191,36,.2)' : 'rgba(255,255,255,.04)'}`,
                          transition: 'background .15s',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)')}
                      >
                        <div style={{ flex: 1, fontSize: '.71rem', fontWeight: 500, color: '#EEF2F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.name}
                        </div>
                        <span style={{ fontSize: '.62rem', fontWeight: 700, color: isToday ? '#FBBF24' : isTmr ? 'rgba(251,191,36,.6)' : 'rgba(238,242,248,.28)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {label}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Em aprovação */}
          {(loading || approvalTasks.length > 0) && (
            <div style={{
              background: 'linear-gradient(145deg, rgba(251,191,36,.07) 0%, rgba(251,191,36,.02) 40%, #0B0D1A 70%)',
              borderRadius: 20, padding: '20px 22px',
              border: '1px solid rgba(251,191,36,.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF24', flexShrink: 0 }} />
                <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                  Em aprovação
                </span>
                {!loading && (
                  <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: 'rgba(251,191,36,.15)', color: '#FBBF24' }}>
                    {approvalTasks.length}
                  </span>
                )}
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[1,2].map(i => <Skel key={i} w="100%" h={32} r={8} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {approvalTasks.slice(0, 5).map(t => (
                    <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          fontSize: '.71rem', fontWeight: 500, color: '#EEF2F8',
                          padding: '7px 10px', borderRadius: 9,
                          background: 'rgba(251,191,36,.05)', border: '1px solid rgba(251,191,36,.1)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(251,191,36,.1)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(251,191,36,.05)')}
                      >
                        {t.name}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Atrasadas */}
          {!loading && hasOverdue && (
            <div style={{
              background: 'linear-gradient(145deg, rgba(255,107,107,.1) 0%, rgba(255,107,107,.03) 40%, #0B0D1A 70%)',
              borderRadius: 20, padding: '20px 22px',
              border: '1px solid rgba(255,107,107,.18)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', flexShrink: 0 }} />
                <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                  Atrasadas
                </span>
                <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: 'rgba(255,107,107,.15)', color: '#FF6B6B' }}>
                  {overdue.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {overdue.slice(0, 4).map(t => (
                  <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        padding: '7px 10px', borderRadius: 9,
                        background: 'rgba(255,107,107,.05)', border: '1px solid rgba(255,107,107,.1)',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,.1)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,.05)')}
                    >
                      <span style={{ fontSize: '.71rem', fontWeight: 500, color: '#EEF2F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {t.name}
                      </span>
                      <span style={{ fontSize: '.62rem', fontWeight: 700, color: '#FF6B6B', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {formatDue(t.due_date)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Atividade recente */}
          <div style={{ background: '#0B0D1A', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>
              Atividade recente
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <Skel key={i} w="100%" h={30} r={6} />)}
              </div>
            ) : recentActivity.length === 0 ? (
              <div style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.2)', padding: '4px 0' }}>Sem atividade</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentActivity.map((t, i) => {
                  const st = getStatusStyle(t);
                  const updMs = parseInt(t.date_updated);
                  const diffH = Math.floor((Date.now() - updMs) / 3_600_000);
                  const age = diffH < 1 ? 'agora' : diffH < 24 ? `${diffH}h` : `${Math.floor(diffH / 24)}d`;
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 0',
                        borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                      }}
                    >
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '.7rem', color: 'rgba(238,242,248,.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.name}
                      </span>
                      <span style={{ fontSize: '.59rem', color: 'rgba(238,242,248,.2)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {age}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extra slot (e.g. designer boards in Design page) */}
      {children}
    </div>
  );
}
