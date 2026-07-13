import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { BrandConfig } from '../../lib/brands';
import { getMockBrandTasks, type BrandTask } from '../../lib/brandData';

// ─── Brand Theme System ────────────────────────────────────────────────────────
interface BrandTheme {
  // surfaces
  surface:       string;   // card background
  surfaceHero:   string;   // hero/progress card background (gradient)
  border:        string;   // card border
  borderHero:    string;   // hero card border (slightly more visible)
  // accent palette
  accent:        string;   // primary brand color for numbers/highlights
  accent2:       string;   // secondary (gradient end, details)
  accentMuted:   string;   // muted accent for subtle tints
  // chart
  chartStroke:   string;
  chartGradStop: string;   // gradient start (same as chartStroke, rgba)
  chartGradient: string;   // for progress bars (can be single or gradient)
  // typography
  numColor:      string;   // KPI number color
  labelColor:    string;   // uppercase label color
  bodyColor:     string;   // secondary body text
  // status tints (derived from brand, not generic green/yellow/red)
  doneTint:      string;   // concluído color
  doneBg:        string;
  activeTint:    string;   // em andamento color
  activeBg:      string;
  warnTint:      string;   // em aprovação
  warnBg:        string;
  dangerTint:    string;   // em ajustes / atrasado
  dangerBg:      string;
  // avatars
  avatarBg:      string;
  avatarBorder:  string;
  avatarText:    string;
  // progress bar fill
  progressFill:  string;   // CSS background value (can be gradient)
  // task row accent border
  taskBorderHigh: string;
  taskBorderMed:  string;
  // tooltip
  tipBg:         string;
  tipAccent:     string;
}

const THEMES: Record<string, BrandTheme> = {
  nova: {
    surface:      '#0B0D14',
    surfaceHero:  '#0B0D14',
    border:       'rgba(255,255,255,.07)',
    borderHero:   'rgba(255,255,255,.09)',
    accent:       '#3D7BFF',
    accent2:      '#6F9BFF',
    accentMuted:  'rgba(61,123,255,.08)',
    chartStroke:  '#3D7BFF',
    chartGradStop:'rgba(61,123,255,.25)',
    chartGradient:'#3D7BFF',
    numColor:     '#F1F5F9',
    labelColor:   'rgba(241,245,249,.22)',
    bodyColor:    'rgba(241,245,249,.42)',
    doneTint:     '#4ADE80',
    doneBg:       'rgba(74,222,128,.08)',
    activeTint:   '#3D7BFF',
    activeBg:     'rgba(61,123,255,.08)',
    warnTint:     '#FBBF24',
    warnBg:       'rgba(251,191,36,.08)',
    dangerTint:   '#FF6B6B',
    dangerBg:     'rgba(255,107,107,.08)',
    avatarBg:     'rgba(61,123,255,.1)',
    avatarBorder: 'rgba(61,123,255,.22)',
    avatarText:   '#3D7BFF',
    progressFill: '#3D7BFF',
    taskBorderHigh:'rgba(255,107,107,.7)',
    taskBorderMed: 'rgba(251,191,36,.5)',
    tipBg:        '#090C14',
    tipAccent:    '#3D7BFF',
  },

  vendeai: {
    // Deep space with lilac tint — glass, not neon
    surface:      'linear-gradient(145deg, #0E0B18 0%, #0C0A16 100%)',
    surfaceHero:  'linear-gradient(145deg, #120D20 0%, #0E0A1A 60%, #0C0A16 100%)',
    border:       'rgba(160,0,255,.13)',
    borderHero:   'rgba(160,0,255,.22)',
    accent:       '#B07FFF',   // desaturated lilac — not full A000FF
    accent2:      '#4FC9E8',   // desaturated cyan
    accentMuted:  'rgba(160,0,255,.07)',
    chartStroke:  '#9B5FE8',
    chartGradStop:'rgba(155,95,232,.22)',
    chartGradient:'linear-gradient(90deg, #A000FF, #00D9FF)',
    numColor:     '#C8A8FF',   // soft lilac — readable, not electric
    labelColor:   'rgba(200,168,255,.28)',
    bodyColor:    'rgba(200,168,255,.45)',
    doneTint:     '#A78BFA',
    doneBg:       'rgba(167,139,250,.1)',
    activeTint:   '#4FC9E8',
    activeBg:     'rgba(79,201,232,.08)',
    warnTint:     '#C4A1FF',
    warnBg:       'rgba(196,161,255,.08)',
    dangerTint:   '#F0ABFC',
    dangerBg:     'rgba(240,171,252,.07)',
    avatarBg:     'rgba(160,0,255,.12)',
    avatarBorder: 'rgba(160,0,255,.28)',
    avatarText:   '#B07FFF',
    progressFill: 'linear-gradient(90deg, #8B3FD4 0%, #3DBBDB 100%)',
    taskBorderHigh:'rgba(160,0,255,.7)',
    taskBorderMed: 'rgba(79,201,232,.5)',
    tipBg:        '#0C0916',
    tipAccent:    '#B07FFF',
  },

  pronto: {
    // Dark amber warmth — performance, not cartoon orange
    surface:      'linear-gradient(145deg, #120C07 0%, #0F0905 100%)',
    surfaceHero:  'linear-gradient(145deg, #180E07 0%, #130A05 60%, #0F0905 100%)',
    border:       'rgba(253,97,0,.14)',
    borderHero:   'rgba(253,97,0,.25)',
    accent:       '#FF8240',   // warm orange, slightly desaturated
    accent2:      '#D45A20',   // deep burnt orange
    accentMuted:  'rgba(253,97,0,.07)',
    chartStroke:  '#E86820',
    chartGradStop:'rgba(232,104,32,.22)',
    chartGradient:'linear-gradient(90deg, #FD6100, #D12B01)',
    numColor:     '#FFAA70',   // warm amber — legible, not blinding
    labelColor:   'rgba(255,170,112,.28)',
    bodyColor:    'rgba(255,170,112,.45)',
    doneTint:     '#FFA060',
    doneBg:       'rgba(255,160,96,.09)',
    activeTint:   '#FFB87A',
    activeBg:     'rgba(255,184,122,.08)',
    warnTint:     '#FFD080',
    warnBg:       'rgba(255,208,128,.07)',
    dangerTint:   '#FF7070',
    dangerBg:     'rgba(255,112,112,.07)',
    avatarBg:     'rgba(253,97,0,.12)',
    avatarBorder: 'rgba(253,97,0,.28)',
    avatarText:   '#FF8240',
    progressFill: 'linear-gradient(90deg, #FD6100 0%, #D12B01 100%)',
    taskBorderHigh:'rgba(253,97,0,.8)',
    taskBorderMed: 'rgba(255,208,128,.5)',
    tipBg:        '#0F0805',
    tipAccent:    '#FF8240',
  },
};

function getTheme(slug: string): BrandTheme {
  return THEMES[slug] ?? THEMES.nova;
}

// ── Status config (uses theme colors) ─────────────────────────────────────────
function getStatusCfg(th: BrandTheme): Record<BrandTask['status'], { label: string; color: string; bg: string }> {
  return {
    a_fazer:      { label: 'A fazer',      color: th.bodyColor,   bg: 'rgba(255,255,255,.04)' },
    em_andamento: { label: 'Em andamento', color: th.activeTint,  bg: th.activeBg },
    em_aprovacao: { label: 'Em aprovação', color: th.warnTint,    bg: th.warnBg },
    em_ajustes:   { label: 'Em ajustes',   color: th.dangerTint,  bg: th.dangerBg },
    concluido:    { label: 'Concluído',    color: th.doneTint,    bg: th.doneBg },
  };
}

// ── Shared style builders ──────────────────────────────────────────────────────
function cardStyle(th: BrandTheme, hero = false): React.CSSProperties {
  return {
    background: hero ? th.surfaceHero : th.surface,
    border: `1px solid ${hero ? th.borderHero : th.border}`,
    borderRadius: 16,
  };
}

function labelStyle(th: BrandTheme): React.CSSProperties {
  return { fontSize: '.6rem', fontWeight: 600, color: th.labelColor, textTransform: 'uppercase', letterSpacing: '.1em' };
}

// ── Chart tooltip ──────────────────────────────────────────────────────────────
function makeChartTip(th: BrandTheme) {
  return function ChartTip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: th.tipBg, border: `1px solid ${th.border}`, borderRadius: 10, padding: '7px 12px', fontSize: '.7rem' }}>
        <div style={{ color: th.bodyColor, fontWeight: 500, marginBottom: 3 }}>{label}</div>
        <div style={{ color: th.tipAccent, fontWeight: 700 }}>{payload[0].value} entregas</div>
      </div>
    );
  };
}

// ── Delivery chart data ────────────────────────────────────────────────────────
function buildDeliveryChart(tasks: BrandTask[]) {
  const today = new Date('2026-07-08');
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (7 - i));
    const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const isoDay = d.toISOString().slice(0, 10);
    return { dia: label, valor: tasks.filter(t => t.status === 'concluido' && t.dateUpdated.startsWith(isoDay)).length };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { brand: BrandConfig; }

export default function BrandOverview({ brand }: Props) {
  const th         = getTheme(brand.slug);
  const STATUS_CFG = getStatusCfg(th);
  const ChartTip   = makeChartTip(th);

  const tasks    = getMockBrandTasks(brand.slug);
  const total    = tasks.length;
  const done     = tasks.filter(t => t.status === 'concluido').length;
  const inProg   = tasks.filter(t => t.status === 'em_andamento').length;
  const highPri  = tasks.filter(t => t.priority === 'alta' && t.status !== 'concluido').length;
  const pctDone  = total ? Math.round(done / total * 100) : 0;
  const open     = tasks.filter(t => t.status !== 'concluido');
  const today    = new Date('2026-07-08');
  const overdue  = open.filter(t => t.dueDate && new Date(t.dueDate) < today);
  const deliveryData = buildDeliveryChart(tasks);

  const assigneeMap: Record<string, number> = {};
  open.forEach(t => { if (t.assignee) assigneeMap[t.assignee] = (assigneeMap[t.assignee] ?? 0) + 1; });
  const assignees = Object.entries(assigneeMap).sort((a, b) => b[1] - a[1]);

  const statusDist = Object.entries(STATUS_CFG).map(([key, cfg]) => ({
    status: key as BrandTask['status'],
    label: cfg.label, color: cfg.color,
    count: tasks.filter(t => t.status === key).length,
  })).filter(s => s.count > 0);

  // Progress bar: inject gradient via a wrapper div trick
  function ProgressBar({ pct }: { pct: number }) {
    return (
      <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: th.progressFill, borderRadius: 3, transition: 'width .6s ease' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── KPI ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total de tarefas', val: total,   color: th.bodyColor,   bg: 'rgba(255,255,255,.025)' },
          { label: 'Concluídas',       val: done,    color: th.doneTint,    bg: th.doneBg },
          { label: 'Em andamento',     val: inProg,  color: th.activeTint,  bg: th.activeBg },
          { label: 'Alta prioridade',  val: highPri, color: th.dangerTint,  bg: th.dangerBg },
        ].map(k => (
          <div key={k.label} style={{
            ...cardStyle(th),
            padding: '22px 22px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${k.color}, transparent)`, opacity: .5 }} />
            <div style={{ ...labelStyle(th), marginBottom: 14 }}>{k.label}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-.04em' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* ── HERO PROGRESS CARD ── */}
      <div style={{ ...cardStyle(th, true), padding: '26px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ ...labelStyle(th), marginBottom: 10 }}>Taxa de conclusão</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: th.numColor, letterSpacing: '-.045em', lineHeight: 1 }}>{pctDone}%</span>
              <span style={{ fontSize: '.75rem', color: th.bodyColor, fontWeight: 400 }}>{done} de {total} tarefas concluídas</span>
            </div>
          </div>
          {overdue.length > 0 && (
            <div style={{ padding: '8px 14px', borderRadius: 8, background: th.dangerBg, border: `1px solid ${th.dangerTint}25` }}>
              <span style={{ fontSize: '.7rem', color: th.dangerTint, fontWeight: 600 }}>⚠ {overdue.length} atrasada{overdue.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <ProgressBar pct={pctDone} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 18 }}>
          {statusDist.map(s => (
            <div key={s.status} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
              background: `${s.color}0D`, border: `1px solid ${s.color}22`,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '.65rem', fontWeight: 500, color: s.color }}>{s.label}</span>
              <span style={{ fontSize: '.65rem', fontWeight: 700, color: th.bodyColor }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHART + ASSIGNEES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 10 }}>

        <div style={{ ...cardStyle(th), padding: '26px 28px' }}>
          <div style={{ ...labelStyle(th), marginBottom: 6 }}>Entregas recentes</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: th.numColor, marginBottom: 20 }}>
            Volume de conclusões · últimos 8 dias
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={deliveryData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`bg-${brand.slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={th.chartStroke} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={th.chartStroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 9, fill: th.labelColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: th.labelColor }} axisLine={false} tickLine={false} width={22} allowDecimals={false} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: `${th.chartStroke}30`, strokeWidth: 1 }} />
              <Area type="monotone" dataKey="valor" stroke={th.chartStroke} strokeWidth={2}
                fill={`url(#bg-${brand.slug})`} dot={false}
                activeDot={{ r: 3, fill: th.chartStroke, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...cardStyle(th), padding: '26px 22px' }}>
          <div style={{ ...labelStyle(th), marginBottom: 18 }}>Responsáveis ativos</div>
          {assignees.length === 0 ? (
            <div style={{ fontSize: '.75rem', color: th.bodyColor }}>Sem responsáveis</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {assignees.map(([name, count]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: th.avatarBg, border: `1.5px solid ${th.avatarBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.62rem', fontWeight: 700, color: th.avatarText,
                  }}>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.76rem', fontWeight: 500, color: th.numColor, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <ProgressBar pct={Math.min((count / open.length) * 100, 100)} />
                  </div>
                  <div style={{
                    fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    background: th.avatarBg, color: th.avatarText, border: `1px solid ${th.avatarBorder}`,
                    flexShrink: 0,
                  }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── OPEN TASKS ── */}
      <div style={{ ...cardStyle(th), padding: '26px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ ...labelStyle(th) }}>Tarefas abertas</div>
          <span style={{ fontSize: '.65rem', color: th.bodyColor, fontWeight: 400 }}>{open.length} tarefas</span>
        </div>

        {open.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: th.bodyColor, fontSize: '.78rem' }}>
            Nenhuma tarefa aberta
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {open.map(t => {
              const sc     = STATUS_CFG[t.status];
              const isLate = t.dueDate ? new Date(t.dueDate) < today : false;
              const dueFmt = t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : null;
              const leftBorder = t.priority === 'alta' ? th.taskBorderHigh : t.priority === 'media' ? th.taskBorderMed : 'rgba(255,255,255,.1)';
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,.02)',
                  borderTop: '1px solid rgba(255,255,255,.04)',
                  borderRight: '1px solid rgba(255,255,255,.04)',
                  borderBottom: '1px solid rgba(255,255,255,.04)',
                  borderLeft: `2px solid ${leftBorder}`,
                }}>
                  <span style={{ flex: 1, fontSize: '.76rem', fontWeight: 400, color: th.numColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </span>
                  {t.assignee && (
                    <span style={{ fontSize: '.62rem', color: th.bodyColor, flexShrink: 0 }}>{t.assignee}</span>
                  )}
                  {dueFmt && (
                    <span style={{ fontSize: '.62rem', fontWeight: 600, color: isLate ? th.dangerTint : th.bodyColor, flexShrink: 0 }}>
                      {isLate ? '⚠ ' : ''}{dueFmt}
                    </span>
                  )}
                  <span style={{
                    fontSize: '.6rem', fontWeight: 500, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                    color: sc.color, background: `${sc.color}10`, border: `1px solid ${sc.color}20`,
                  }}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
