import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BRANDS, getBrandConfig } from '../lib/brands';
import type { BrandSlug } from '../lib/brands';
import { getMockBrandTasks } from '../lib/brandData';
import BrandOverview from './marcas/BrandOverview';

type DashMode = 'geral' | BrandSlug;

// Sprint weeks S1–S17 cumulative delivery trend
const TREND_DATA = [
  { s: 'S1', v: 12 }, { s: 'S2', v: 28 }, { s: 'S3', v: 41 }, { s: 'S4', v: 58 },
  { s: 'S5', v: 72 }, { s: 'S6', v: 89 }, { s: 'S7', v: 104 }, { s: 'S8', v: 121 },
  { s: 'S9', v: 147 }, { s: 'S10', v: 168 }, { s: 'S11', v: 191 }, { s: 'S12', v: 214 },
  { s: 'S13', v: 238 }, { s: 'S14', v: 257 }, { s: 'S15', v: 278 }, { s: 'S16', v: 298 },
  { s: 'S17', v: 319 },
];

// Fixed sprint project cards (matching screenshot)
const SPRINT_CARDS = [
  { label: 'SOCIAL & DESIGN',   done: 73,  total: 100, inProg: 2,  color: '#3D7BFF', dot: '#3D7BFF' },
  { label: 'ANALÍTICOS',        done: 90,  total: 100, inProg: 2,  color: '#3D7BFF', dot: '#3D7BFF' },
  { label: 'CONV. CARTAGENA',   done: 24,  total: 74,  inProg: 22, color: '#FBBF24', dot: '#FBBF24' },
  { label: 'CORBAN 360',        done: 27,  total: 45,  inProg: 11, color: '#4ADE80', dot: '#4ADE80' },
];

// High priority tasks (matching screenshot)
const HIGH_PRI_TASKS = [
  { title: 'ASCOM – Nova logo para a colinha de bancos', icon: '↑' },
  { title: 'Planejamento de Posts: S1 de Março',         icon: '!' },
  { title: 'POST AUMENTO DE MARGEM',                     icon: '↑' },
  { title: 'Kit Corban – atualização de materiais',      icon: '↑' },
  { title: 'Stories campanha Black Friday Q3',           icon: '!' },
  { title: 'Aprovação identidade Convenção 2026',        icon: '↑' },
];

// ─── Design tokens (enterprise refinement) ────────────────────────────────────
const T = {
  surface:  '#0B0D14',          // card base
  surfaceEl:'#0F1219',          // slightly elevated hero
  border:   'rgba(255,255,255,.07)',
  text1:    '#F1F5F9',          // primary — big numbers, titles
  text2:    'rgba(241,245,249,.42)', // secondary — body
  text3:    'rgba(241,245,249,.22)', // tertiary — uppercase labels
  danger:   'rgba(220,68,68,.85)',
  dangerBg: 'rgba(220,68,68,.07)',
  dangerBorder: 'rgba(220,68,68,.14)',
  accent:   '#3D7BFF',          // used only on chart line + 1 interactive element
};

function SparklineSVG({ done, total }: { done: number; total: number }) {
  const pts = [[0,90],[50,78],[110,66],[170,58],[230,44],[290,35],[340,22],[390,10]];
  const d    = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = d + ` L${pts[pts.length-1][0]},100 L0,100 Z`;
  const pct  = Math.round(done / total * 100);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 390 100" style={{ width: '100%', height: 60, display: 'block' }}>
        <defs>
          <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3D7BFF" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#3D7BFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spkGrad)" />
        <path d={d} fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ position: 'absolute', top: 2, right: 0, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.22)', borderRadius: 6, padding: '3px 9px', fontSize: '.65rem', fontWeight: 600, color: '#4ADE80' }}>
        ↑ {pct}% concluído
      </div>
    </div>
  );
}

function DonutChart({ pct, done, aFazer, emAndamento }: { pct: number; done: number; aFazer: number; emAndamento: number }) {
  const r = 40, cx = 50, cy = 50, sw = 6;
  const circ     = 2 * Math.PI * r;
  const dashDone = circ * pct / 100;
  const donutRows = [
    { label: 'concluído',    val: done,        color: '#4ADE80' },
    { label: 'a fazer',      val: aFazer,      color: 'rgba(241,245,249,.35)' },
    { label: 'em andamento', val: emAndamento, color: '#3D7BFF' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4ADE80" strokeWidth={sw}
          strokeDasharray={`${dashDone} ${circ}`} strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 3} textAnchor="middle" fill={T.text1} fontSize="14" fontWeight="700">{pct}%</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fill={T.text3} fontSize="7.5" fontWeight="500" letterSpacing="1">DONE</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {donutRows.map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
            <span style={{ fontSize: '.68rem', color: T.text2, flex: 1 }}>{row.label}</span>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: T.text1, minWidth: 28, textAlign: 'right' }}>{row.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '7px 12px', fontSize: '.7rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#3D7BFF', fontWeight: 700 }}>{payload[0].value} tasks</div>
    </div>
  );
}

// card shell — one consistent surface for all secondary cards
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, ...extra,
});

// label above every section
const sectionLabel: React.CSSProperties = {
  fontSize: '.6rem', fontWeight: 600, color: T.text3,
  textTransform: 'uppercase', letterSpacing: '.1em',
};

function GeralView() {
  const allTasks  = BRANDS.flatMap(b => getMockBrandTasks(b.slug));
  const total     = 319;
  const done      = 214;
  const inProg    = 35;
  const aFazer    = total - done - inProg;
  const emAprov   = allTasks.filter(t => t.status === 'em_aprovacao').length;
  const emAjustes = allTasks.filter(t => t.status === 'em_ajustes').length;
  const pct       = Math.round(done / total * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Row 1: TAREFAS CONCLUÍDAS (wide) | EM ANDAMENTO | STATUS GERAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr', gap: 10 }}>

        {/* Card 1: Tarefas Concluídas com sparkline */}
        <div style={{ ...card(), padding: '24px 24px 16px', overflow: 'hidden' }}>
          <div style={{ ...sectionLabel, marginBottom: 14 }}>Tarefas Concluídas</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: T.text1, lineHeight: 1, letterSpacing: '-.05em' }}>{done}</span>
            <span style={{ fontSize: '1rem', fontWeight: 400, color: T.text3, letterSpacing: '-.01em' }}>/{total}</span>
          </div>
          <SparklineSVG done={done} total={total} />
        </div>

        {/* Card 2: Em Andamento */}
        <div style={{ ...card(), padding: '24px 22px' }}>
          <div style={{ ...sectionLabel, marginBottom: 14 }}>Em Andamento</div>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#3D7BFF', lineHeight: 1, letterSpacing: '-.05em', marginBottom: 6 }}>{inProg}</div>
          <div style={{ fontSize: '.7rem', color: T.text3, marginBottom: 16 }}>tarefas ativas agora</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 9px', borderRadius: 5, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.22)', fontSize: '.62rem', fontWeight: 600, color: '#4ADE80' }}>{emAprov} em aprovação</span>
            <span style={{ padding: '3px 9px', borderRadius: 5, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.22)', fontSize: '.62rem', fontWeight: 600, color: '#FF6B6B' }}>{emAjustes} em ajustes</span>
          </div>
        </div>

        {/* Card 3: Status Geral (donut) */}
        <div style={{ ...card(), padding: '24px 22px' }}>
          <div style={{ ...sectionLabel, marginBottom: 16 }}>Status Geral</div>
          <DonutChart pct={pct} done={done} aFazer={aFazer} emAndamento={inProg} />
        </div>
      </div>

      {/* Row 2: 4 sprint project cards — neutral, progress in white */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {SPRINT_CARDS.map(card2 => {
          const p = Math.round(card2.done / card2.total * 100);
          return (
            <div key={card2.label} style={{ ...card(), padding: '22px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: card2.dot, flexShrink: 0 }} />
                  <span style={{ ...sectionLabel, color: card2.dot }}>{card2.label}</span>
                </div>
                <span style={{ fontSize: '.62rem', fontWeight: 600, color: card2.color, background: `${card2.color}18`, border: `1px solid ${card2.color}30`, borderRadius: 6, padding: '2px 8px' }}>{card2.done}/{card2.total}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 14 }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: T.text1, lineHeight: 1, letterSpacing: '-.04em' }}>{p}%</span>
                <span style={{ fontSize: '.68rem', fontWeight: 400, color: T.text3 }}>concluído</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.07)', overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ width: `${p}%`, height: '100%', background: card2.color, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: '.65rem', color: T.text3, fontWeight: 400 }}>{card2.inProg} em andamento</div>
            </div>
          );
        })}
      </div>

      {/* Row 3: Trend chart + Alta Prioridade */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 10 }}>

        {/* Tendência de Entrega — accent color lives here (one per page) */}
        <div style={{ ...card(), padding: '28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ ...sectionLabel, marginBottom: 10 }}>Tendência de Entrega</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: T.text1, letterSpacing: '-.03em' }}>{total}</span>
                <span style={{ fontSize: '.7rem', color: T.text2, fontWeight: 400 }}>tasks totais</span>
              </div>
            </div>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 500, color: T.text2, padding: 0 }}>
              Ver no ClickUp →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={172}>
            <LineChart data={TREND_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="s" tick={{ fontSize: 9, fill: T.text3, fontWeight: 400 }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 9, fill: T.text3 }} axisLine={false} tickLine={false} width={26} ticks={[0, 80, 160, 240, 320]} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(255,255,255,.06)', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="v" stroke={T.accent} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: T.accent, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alta Prioridade */}
        <div style={{
          background: 'linear-gradient(160deg, rgba(220,40,40,.18) 0%, rgba(30,8,8,.95) 55%)',
          borderRadius: 16,
          border: '1px solid rgba(220,68,68,.2)',
          padding: '28px 22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ ...sectionLabel }}>Alta Prioridade</div>
            <span style={{ fontSize: '.65rem', fontWeight: 600, color: T.danger, background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 6, padding: '2px 8px' }}>
              {HIGH_PRI_TASKS.length}
            </span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: T.danger, lineHeight: 1, letterSpacing: '-.045em', marginBottom: 4 }}>{HIGH_PRI_TASKS.length}</div>
          <div style={{ fontSize: '.7rem', color: T.text3, fontWeight: 400, marginBottom: 22 }}>tarefas críticas</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {HIGH_PRI_TASKS.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i === 0 ? 'none' : `1px solid rgba(255,255,255,.05)`,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.danger, opacity: .7, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '.7rem', fontWeight: 400, color: T.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <span style={{ fontSize: '.6rem', fontWeight: 500, color: T.danger, opacity: .7, flexShrink: 0 }}>{t.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [mode, setMode] = useState<DashMode>('geral');

  const modes: { key: DashMode; label: string; color: string }[] = [
    { key: 'geral',   label: 'GERAL',   color: '#3D7BFF' },
    { key: 'nova',    label: 'NOVA',    color: getBrandConfig('nova')!.color },
    { key: 'vendeai', label: 'VENDEAÍ', color: getBrandConfig('vendeai')!.color },
    { key: 'pronto',  label: 'PRONTO',  color: getBrandConfig('pronto')!.color },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Switcher */}
      <div style={{ background: T.surface, borderRadius: 16, padding: '14px 20px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '.58rem', fontWeight: 500, color: T.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>Sprint Q3 · 2026</div>
          <div style={{ fontSize: '.8rem', fontWeight: 600, color: T.text1 }}>Dashboard</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,.03)', border: `1px solid ${T.border}`, borderRadius: 10, padding: 3 }}>
          {modes.map(m => {
            const active = m.key === mode;
            return (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                padding: '6px 16px', borderRadius: 7,
                border: active ? `1px solid rgba(255,255,255,.1)` : '1px solid transparent',
                background: active ? 'rgba(255,255,255,.07)' : 'transparent',
                color: active ? T.text1 : T.text2,
                fontSize: '.75rem', fontWeight: active ? 600 : 400,
                cursor: 'pointer', letterSpacing: '.02em', transition: 'all .12s',
              }}>
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'geral'
        ? <GeralView />
        : <BrandOverview brand={getBrandConfig(mode as BrandSlug)!} />
      }
    </div>
  );
}
