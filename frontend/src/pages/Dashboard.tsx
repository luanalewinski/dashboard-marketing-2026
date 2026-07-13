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

function SparklineSVG({ done, total }: { done: number; total: number }) {
  // simple rising sparkline path
  const pts = [
    [0, 90], [50, 78], [110, 66], [170, 58], [230, 44], [290, 35], [340, 22], [390, 10],
  ];
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = d + ` L${pts[pts.length - 1][0]},100 L0,100 Z`;
  const pct = Math.round(done / total * 100);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 390 100" style={{ width: '100%', height: 64, display: 'block' }}>
        <defs>
          <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3D7BFF" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3D7BFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spkGrad)" />
        <path d={d} fill="none" stroke="#3D7BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ position: 'absolute', top: 4, right: 0, background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 20, padding: '3px 10px', fontSize: '.68rem', fontWeight: 700, color: '#4ADE80' }}>
        ↑ {pct}% concluído
      </div>
    </div>
  );
}

function DonutChart({ pct, done, aFazer, emAndamento }: { pct: number; done: number; aFazer: number; emAndamento: number }) {
  const r = 42, cx = 52, cy = 52, stroke = 7;
  const circ = 2 * Math.PI * r;
  const dashDone = circ * pct / 100;
  const dashIP   = circ * (emAndamento / (done + aFazer + emAndamento));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width="104" height="104" viewBox="0 0 104 104" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3D7BFF" strokeWidth={stroke}
          strokeDasharray={`${dashIP} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} opacity={0.5} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4ADE80" strokeWidth={stroke}
          strokeDasharray={`${dashDone} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#EEF2F8" fontSize="13" fontWeight="800">{pct}%</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fill="rgba(238,242,248,.35)" fontSize="8" fontWeight="600">DONE</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { dot: '#4ADE80', label: 'concluído',    val: done },
          { dot: 'rgba(238,242,248,.25)', label: 'a fazer', val: aFazer },
          { dot: '#3D7BFF', label: 'em andamento', val: emAndamento },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: row.dot, flexShrink: 0 }} />
            <span style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.5)', flex: 1 }}>{row.label}</span>
            <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#EEF2F8', marginLeft: 12 }}>{row.val}</span>
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

function GeralView() {
  const allTasks   = BRANDS.flatMap(b => getMockBrandTasks(b.slug));
  const total      = 319;
  const done       = 214;
  const inProg     = 35;
  const aFazer     = total - done - inProg;
  const emAprov    = allTasks.filter(t => t.status === 'em_aprovacao').length;
  const emAjustes  = allTasks.filter(t => t.status === 'em_ajustes').length;
  const pct        = Math.round(done / total * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Row 1: Hero + Em andamento + Status geral */}
      <div style={{ display: 'grid', gridTemplateColumns: '52% 1fr 1fr', gap: 12 }}>

        {/* Hero — Tarefas Concluídas */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 10 }}>Tarefas Concluídas</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: '3.25rem', fontWeight: 800, color: '#EEF2F8', lineHeight: 1, letterSpacing: '-.045em' }}>{done}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgba(238,242,248,.28)', letterSpacing: '-.02em' }}>/{total}</span>
          </div>
          <SparklineSVG done={done} total={total} />
        </div>

        {/* Em andamento */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 24px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>Em Andamento</div>
          <div style={{ fontSize: '3.25rem', fontWeight: 800, color: '#3D7BFF', lineHeight: 1, letterSpacing: '-.045em', marginBottom: 6 }}>{inProg}</div>
          <div style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.35)', fontWeight: 500, marginBottom: 18 }}>tarefas ativas agora</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.3)', fontSize: '.68rem', fontWeight: 700, color: '#FBBF24' }}>{emAprov} em aprovação</span>
            <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,107,107,.12)', border: '1px solid rgba(255,107,107,.3)', fontSize: '.68rem', fontWeight: 700, color: '#FF6B6B' }}>{emAjustes} em ajustes</span>
          </div>
        </div>

        {/* Status Geral */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 24px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18 }}>Status Geral</div>
          <DonutChart pct={pct} done={done} aFazer={aFazer} emAndamento={inProg} />
        </div>
      </div>

      {/* Row 2: 4 sprint project cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {SPRINT_CARDS.map(card => {
          const p = Math.round(card.done / card.total * 100);
          return (
            <div key={card.label} style={{ background: '#0C1425', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(255,255,255,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: card.dot }} />
                  <span style={{ fontSize: '.62rem', fontWeight: 700, color: card.dot, textTransform: 'uppercase', letterSpacing: '.06em' }}>{card.label}</span>
                </div>
                <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '2px 8px' }}>
                  {card.done}/{card.total}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#EEF2F8', lineHeight: 1, letterSpacing: '-.04em' }}>{p}%</span>
                <span style={{ fontSize: '.72rem', fontWeight: 500, color: 'rgba(238,242,248,.35)' }}>concluído</span>
              </div>
              <div style={{ height: 4, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${p}%`, height: '100%', background: card.color, borderRadius: 3, opacity: .85 }} />
              </div>
              <div style={{ fontSize: '.65rem', color: 'rgba(238,242,248,.3)', fontWeight: 500 }}>{card.inProg} em andamento</div>
            </div>
          );
        })}
      </div>

      {/* Row 3: Trend chart + Alta Prioridade */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>

        {/* Tendência de Entrega */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>Tendência de Entrega</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.03em' }}>{total}</span>
                <span style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.35)', fontWeight: 500 }}>tasks totais</span>
              </div>
            </div>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '.72rem', fontWeight: 700, color: '#3D7BFF', padding: '4px 0' }}>
              Ver no ClickUp →
            </button>
          </div>
          <div style={{ marginTop: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={TREND_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.04)" vertical={false} />
                <XAxis dataKey="s" tick={{ fontSize: 9, fill: 'rgba(238,242,248,.22)', fontWeight: 500 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(238,242,248,.22)' }} axisLine={false} tickLine={false} width={28} ticks={[0, 80, 160, 240, 320]} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(61,123,255,.3)', strokeWidth: 1 }} />
                <Line type="monotone" dataKey="v" stroke="#3D7BFF" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#3D7BFF', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alta Prioridade */}
        <div style={{ background: 'linear-gradient(160deg, #1a0c0c 0%, #0C1425 60%)', borderRadius: 22, padding: '24px 22px', border: '1px solid rgba(255,107,107,.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,107,107,.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em' }}>Alta Prioridade</div>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#FF6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: '#fff' }}>{HIGH_PRI_TASKS.length}</span>
          </div>
          <div style={{ fontSize: '3.25rem', fontWeight: 800, color: '#FF6B6B', lineHeight: 1, letterSpacing: '-.045em', marginBottom: 4 }}>{HIGH_PRI_TASKS.length}</div>
          <div style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.35)', fontWeight: 500, marginBottom: 18 }}>tarefas críticas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {HIGH_PRI_TASKS.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,107,107,.06)', border: '1px solid rgba(255,107,107,.1)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '.68rem', fontWeight: 500, color: 'rgba(238,242,248,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <span style={{ fontSize: '.65rem', fontWeight: 800, color: '#FF6B6B', flexShrink: 0 }}>{t.icon}</span>
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
  const activeColor = modes.find(m => m.key === mode)!.color;
  const activeBrand = mode !== 'geral' ? getBrandConfig(mode as BrandSlug) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Switcher */}
      <div style={{ background: '#0C0F1C', borderRadius: 22, padding: '16px 20px', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Dashboard</div>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.4)' }}>
            {mode === 'geral' ? 'Operação consolidada · NOVA · VENDEAÍ · PRONTO' : activeBrand?.description}
          </div>
        </div>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${activeColor}60, transparent)`, opacity: .5 }} />
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 4 }}>
          {modes.map(m => {
            const active = m.key === mode;
            return (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                padding: '7px 18px', borderRadius: 10,
                border: active ? `1px solid ${m.color}44` : '1px solid transparent',
                background: active ? `${m.color}18` : 'transparent',
                color: active ? m.color : 'rgba(238,242,248,.35)',
                fontSize: '.8rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '.03em', transition: 'all .15s',
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
