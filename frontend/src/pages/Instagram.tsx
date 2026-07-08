import { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ── Mock data ─────────────────────────────────────────────────────────────────

type Periodo = '7' | '14' | '30';

const DADOS = {
  '30': {
    seguidores: 24791, publicacoes: 909,
    visualizacoes: 59192, alcancadas: 12387,
    interacoes: 735, engajamento: 284, visitas: 2213,
    deltaSeguidores: '+312', deltaPctSeg: '+1.3%', segPos: true,
    deltaViz: '+35%', vizPos: true,
    deltaPub: '-35%', pubPos: false,
    vizTipo: [
      { label: 'Stories',   valor: 37517, pct: 63.4 },
      { label: 'Carrossel', valor: 11667, pct: 19.7 },
      { label: 'Reels',     valor:  7732, pct: 13.1 },
      { label: 'Posts',     valor:  2272, pct:  3.8 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 37985, pct: 64.2 },
      { label: 'Não seguidores', valor: 20977, pct: 35.4 },
    ],
    alcanceDia: [
      { dia: '03/06', valor: 1820 }, { dia: '05/06', valor: 120  },
      { dia: '07/06', valor: 1100 }, { dia: '09/06', valor: 440  },
      { dia: '11/06', valor: 2400 }, { dia: '13/06', valor: 90   },
      { dia: '15/06', valor: 1980 }, { dia: '17/06', valor: 300  },
      { dia: '19/06', valor: 40   }, { dia: '21/06', valor: 60   },
      { dia: '23/06', valor: 90   }, { dia: '25/06', valor: 3780 },
      { dia: '27/06', valor: 400  }, { dia: '29/06', valor: 980  },
      { dia: '01/07', valor: 180  },
    ],
  },
  '14': {
    seguidores: 24791, publicacoes: 432,
    visualizacoes: 31200, alcancadas: 6840,
    interacoes: 382, engajamento: 148, visitas: 1104,
    deltaSeguidores: '+148', deltaPctSeg: '+0.6%', segPos: true,
    deltaViz: '+22%', vizPos: true,
    deltaPub: '-12%', pubPos: false,
    vizTipo: [
      { label: 'Stories',   valor: 19800, pct: 63.5 },
      { label: 'Carrossel', valor:  6150, pct: 19.7 },
      { label: 'Reels',     valor:  4100, pct: 13.1 },
      { label: 'Posts',     valor:  1150, pct:  3.7 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 20100, pct: 64.4 },
      { label: 'Não seguidores', valor: 10980, pct: 35.2 },
    ],
    alcanceDia: [
      { dia: '19/06', valor: 40   }, { dia: '21/06', valor: 60   },
      { dia: '23/06', valor: 90   }, { dia: '25/06', valor: 3780 },
      { dia: '27/06', valor: 400  }, { dia: '29/06', valor: 980  },
      { dia: '01/07', valor: 180  },
    ],
  },
  '7': {
    seguidores: 24791, publicacoes: 198,
    visualizacoes: 14800, alcancadas: 3210,
    interacoes: 188, engajamento: 72, visitas: 540,
    deltaSeguidores: '+74', deltaPctSeg: '+0.3%', segPos: true,
    deltaViz: '+18%', vizPos: true,
    deltaPub: '-8%', pubPos: false,
    vizTipo: [
      { label: 'Stories',   valor: 9400, pct: 63.5 },
      { label: 'Carrossel', valor: 2920, pct: 19.7 },
      { label: 'Reels',     valor: 1940, pct: 13.1 },
      { label: 'Posts',     valor:  540, pct:  3.7 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 9510, pct: 64.3 },
      { label: 'Não seguidores', valor: 5200, pct: 35.1 },
    ],
    alcanceDia: [
      { dia: '26/06', valor: 1200 }, { dia: '27/06', valor: 400 },
      { dia: '28/06', valor: 80   }, { dia: '29/06', valor: 980 },
      { dia: '30/06', valor: 600  }, { dia: '01/07', valor: 180 },
    ],
  },
};

// Crescimento mensal de seguidores (fixo)
const GROWTH_MONTHLY = [
  { mes: 'Jan', seg: 22100 },
  { mes: 'Fev', seg: 22580 },
  { mes: 'Mar', seg: 22940 },
  { mes: 'Abr', seg: 23310 },
  { mes: 'Mai', seg: 23780 },
  { mes: 'Jun', seg: 24200 },
  { mes: 'Jul', seg: 24791 },
];

// Heatmap: [dia][hora] 0–10, padrão realista de atividade
const DAYS  = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOURS = ['06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h'];
const HEATMAP: number[][] = [
  [1, 2, 5, 8, 7, 6, 9, 4],  // Seg
  [1, 3, 6, 9, 8, 7, 8, 3],  // Ter
  [2, 4, 7, 10, 9, 8, 9, 5], // Qua
  [2, 3, 6, 9, 8, 7, 9, 4],  // Qui
  [2, 4, 6, 8, 7, 9, 10, 6], // Sex
  [1, 2, 4, 6, 5, 7, 8, 5],  // Sáb
  [1, 1, 3, 5, 4, 5, 7, 4],  // Dom
];

// Demografia (fixa)
const DEMO_GENERO = [
  { label: 'Feminino',  pct: 75, color: '#3D7BFF' },
  { label: 'Masculino', pct: 25, color: '#4ADE80'  },
];
const DEMO_IDADE = [
  { label: '18–24', pct: 28 },
  { label: '25–34', pct: 42 },
  { label: '35–44', pct: 18 },
  { label: '45–54', pct:  8 },
  { label: '55+',   pct:  4 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function num(n: number) { return n.toLocaleString('pt-BR'); }
function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil';
  return n.toLocaleString('pt-BR');
}

// ── Tooltip dos gráficos ───────────────────────────────────────────────────────
function TipAlcance({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '7px 12px', fontSize: '.7rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#3D7BFF', fontWeight: 700 }}>{fmt(payload[0].value)} contas</div>
    </div>
  );
}
function TipGrowth({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '7px 12px', fontSize: '.7rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#4ADE80', fontWeight: 700 }}>{num(payload[0].value)} seguidores</div>
    </div>
  );
}


// ── Componente principal ───────────────────────────────────────────────────────
export default function Instagram() {
  const [periodo, setPeriodo] = useState<Periodo>('30');
  const d = DADOS[periodo];
  const engRate = ((d.interacoes / d.alcancadas) * 100).toFixed(2);
  const maxViz  = Math.max(...d.vizTipo.map(x => x.valor));

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Instagram icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
              <circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="6.5" r="1"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.02em', lineHeight: 1.2 }}>
              Instagram
            </div>
            <div style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.35)', marginTop: 2 }}>
              @nova.promotora · performance do perfil · última sync 02/07/2026
            </div>
          </div>
        </div>

        {/* Period filter — mesmo padrão do Dashboard */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 3 }}>
          {(['7', '14', '30'] as Periodo[]).map(p => (
            <button key={p} onClick={() => setPeriodo(p)} style={{
              padding: '.3rem .75rem', borderRadius: 7, border: 'none',
              fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
              background: periodo === p ? 'rgba(61,123,255,.18)' : 'transparent',
              color: periodo === p ? '#3D7BFF' : 'rgba(238,242,248,.35)',
            }}>
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* ══ LINHA 1 — 3 KPI CARDS ═══════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

        {/* Seguidores — verde */}
        <div style={{
          background: '#0C0F1C', borderRadius: 20, padding: '22px 24px',
          border: '1px solid rgba(74,222,128,.12)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #4ADE80, transparent)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Seguidores</span>
          </div>
          <div style={{ fontSize: '2.625rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.045em', lineHeight: 1, marginBottom: 10 }}>
            {num(d.seguidores)}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.18)', borderRadius: 20, padding: '3px 10px', fontSize: '.67rem', fontWeight: 700, color: '#4ADE80' }}>
            ↑ {d.deltaSeguidores} · {d.deltaPctSeg}
          </div>
        </div>

        {/* Visualizações — azul */}
        <div style={{
          background: '#0C0F1C', borderRadius: 20, padding: '22px 24px',
          border: '1px solid rgba(61,123,255,.12)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3D7BFF, transparent)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,123,255,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Visualizações</span>
          </div>
          <div style={{ fontSize: '2.625rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.045em', lineHeight: 1, marginBottom: 10 }}>
            {fmt(d.visualizacoes)}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.22)', borderRadius: 20, padding: '3px 10px', fontSize: '.67rem', fontWeight: 700, color: '#3D7BFF' }}>
            ↑ {d.deltaViz} vs período anterior
          </div>
        </div>

        {/* Publicações — vermelho quando queda */}
        <div style={{
          background: '#0C0F1C', borderRadius: 20, padding: '22px 24px',
          border: '1px solid rgba(255,107,107,.1)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #FF6B6B, transparent)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Publicações</span>
          </div>
          <div style={{ fontSize: '2.625rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.045em', lineHeight: 1, marginBottom: 10 }}>
            {num(d.publicacoes)}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 20, padding: '3px 10px', fontSize: '.67rem', fontWeight: 700, color: '#FF6B6B' }}>
            ↓ {d.deltaPub} vs período anterior
          </div>
        </div>
      </div>

      {/* ══ LINHA 2 — HEATMAP | CRESCIMENTO ═════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 12 }}>

        {/* Heatmap — Horários mais ativos */}
        <div style={{
          background: '#0C1425', borderRadius: 22, padding: '24px 28px',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
              Horários mais ativos
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#EEF2F8' }}>
              Atividade da audiência por dia e hora
            </div>
          </div>

          {/* Grade do heatmap */}
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 0 }}>
            {/* Labels dias */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 22 }}>
              {DAYS.map(d => (
                <div key={d} style={{
                  height: 22, display: 'flex', alignItems: 'center',
                  fontSize: '.6rem', fontWeight: 600, color: 'rgba(238,242,248,.3)', letterSpacing: '.02em',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Células */}
            <div>
              {/* Labels horas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginBottom: 6 }}>
                {HOURS.map(h => (
                  <div key={h} style={{ fontSize: '.58rem', fontWeight: 600, color: 'rgba(238,242,248,.25)', textAlign: 'center' }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {HEATMAP.map((row, di) => (
                <div key={di} style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginBottom: 5 }}>
                  {row.map((val, hi) => {
                    const intensity = val / 10;
                    const bg = intensity < 0.15
                      ? 'rgba(255,255,255,.04)'
                      : `rgba(61,123,255,${(intensity * 0.72).toFixed(2)})`;
                    const border = intensity > 0.7
                      ? 'rgba(61,123,255,.4)'
                      : 'rgba(255,255,255,.04)';
                    return (
                      <div
                        key={hi}
                        title={`${DAYS[di]} ${HOURS[hi]} — ${val * 10}% atividade`}
                        style={{
                          height: 22, borderRadius: 6,
                          background: bg,
                          border: `1px solid ${border}`,
                          transition: 'transform .1s',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <span style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.25)', fontWeight: 600 }}>Baixa</span>
            {[0.08, 0.2, 0.35, 0.5, 0.65, 0.8].map((op, i) => (
              <div key={i} style={{ width: 16, height: 10, borderRadius: 3, background: `rgba(61,123,255,${op})`, border: '1px solid rgba(255,255,255,.04)' }} />
            ))}
            <span style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.25)', fontWeight: 600 }}>Alta</span>
          </div>
        </div>

        {/* Crescimento de seguidores — gráfico de linha */}
        <div style={{
          background: '#0C1425', borderRadius: 22, padding: '24px 28px',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
              Crescimento de seguidores
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.03em' }}>
                {num(24791)}
              </span>
              <span style={{ fontSize: '.7rem', fontWeight: 600, color: '#4ADE80' }}>↑ +2.672 no ano</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={GROWTH_MONTHLY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#4ADE80" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)' }} axisLine={false} tickLine={false} width={48}
                domain={['auto', 'auto']}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip content={<TipGrowth />} cursor={{ stroke: 'rgba(74,222,128,.25)', strokeWidth: 1 }} />
              <Line
                type="monotone" dataKey="seg" stroke="#4ADE80" strokeWidth={2.5}
                dot={{ r: 4, fill: '#4ADE80', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#4ADE80', strokeWidth: 2, stroke: 'rgba(74,222,128,.3)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══ LINHA 3 — ALCANCE POR DIA ════════════════════════════════════════ */}
      <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
              Alcance por dia
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.03em' }}>
                {fmt(d.alcanceDia.reduce((s, x) => s + x.valor, 0))}
              </span>
              <span style={{ fontSize: '.8rem', fontWeight: 500, color: 'rgba(238,242,248,.3)' }}>contas alcançadas no período</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Alcance', val: fmt(d.alcancadas), color: '#3D7BFF' },
              { label: 'Interações', val: num(d.interacoes), color: '#FBBF24' },
              { label: 'Eng. rate', val: `${engRate}%`, color: '#4ADE80' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: s.color, letterSpacing: '-.02em' }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={d.alcanceDia} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="igAlcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3D7BFF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3D7BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.05)" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)' }} axisLine={false} tickLine={false} width={42}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
            <Tooltip content={<TipAlcance />} cursor={{ stroke: 'rgba(61,123,255,.3)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="valor" stroke="#3D7BFF" strokeWidth={2}
              fill="url(#igAlcGrad)" dot={false} activeDot={{ r: 4, fill: '#3D7BFF', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ══ LINHA 4 — DEMOGRAFIA ══════════════════════════════════════════════ */}
      <div style={{
        background: '#0C1425', borderRadius: 22, padding: '24px 28px',
        border: '1px solid rgba(255,255,255,.05)',
      }}>
        <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>
          Perfil da audiência
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

          {/* Gênero */}
          <div>
            <div style={{ fontSize: '.825rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 18 }}>Distribuição por gênero</div>
            {DEMO_GENERO.map(g => (
              <div key={g.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 500, color: 'rgba(238,242,248,.7)' }}>{g.label}</span>
                  <span style={{ fontSize: '.875rem', fontWeight: 800, color: g.color }}>{g.pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 5, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${g.pct}%`, height: '100%', background: g.color, borderRadius: 5, transition: 'width .6s ease', opacity: .85 }} />
                </div>
              </div>
            ))}

            {/* Métricas secundárias */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              {[
                { label: 'Visitas ao perfil', val: num(d.visitas), color: '#6F9BFF' },
                { label: 'Engajamento',        val: num(d.engajamento), color: '#FBBF24' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '14px 16px',
                  border: '1px solid rgba(255,255,255,.05)',
                }}>
                  <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, letterSpacing: '-.03em', lineHeight: 1 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Faixa etária */}
          <div>
            <div style={{ fontSize: '.825rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 18 }}>Faixa etária</div>
            {DEMO_IDADE.map((item, i) => {
              const colors = ['#3D7BFF', '#4ADE80', '#FBBF24', '#6F9BFF', 'rgba(238,242,248,.3)'];
              const color = colors[i] ?? '#3D7BFF';
              return (
                <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '46px 1fr 36px', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.5)', textAlign: 'right' }}>{item.label}</span>
                  <div style={{ height: 8, borderRadius: 5, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: color, borderRadius: 5, transition: 'width .6s ease', opacity: .8 }} />
                  </div>
                  <span style={{ fontSize: '.72rem', fontWeight: 800, color, textAlign: 'right' }}>{item.pct}%</span>
                </div>
              );
            })}

            {/* Visualizações por tipo */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 12 }}>
                Visualizações por formato
              </div>
              {d.vizTipo.map((item, i) => {
                const accents = ['#3D7BFF', '#4ADE80', '#FBBF24', '#6F9BFF'];
                return (
                  <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 80px', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'rgba(238,242,248,.5)' }}>{item.label}</span>
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.valor / maxViz) * 100}%`, height: '100%', background: accents[i] ?? '#3D7BFF', borderRadius: 3, transition: 'width .5s ease', opacity: .75 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 5 }}>
                      <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#EEF2F8' }}>{fmt(item.valor)}</span>
                      <span style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.28)' }}>{item.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER NOTICE ════════════════════════════════════════════════════ */}
      <div style={{
        background: '#0C0F1C', borderRadius: 16, padding: '14px 18px',
        border: '1px solid rgba(61,123,255,.1)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#EEF2F8' }}>Dados mockados — integração Meta API em breve · </span>
          <span style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.4)' }}>
            Simulados com base nas métricas reais de junho/2026. Conexão com a Meta Business API será ativada na próxima fase.
          </span>
        </div>
      </div>

    </div>
  );
}
