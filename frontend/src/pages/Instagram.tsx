import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ── Mock data ─────────────────────────────────────────────────────────
const DADOS: Record<string, {
  seguidores: number; alcancadas: number; visualizacoes: number;
  interacoes: number; engajamento: number; visitas: number; toques: number;
  vizTipo: { label: string; valor: number; pct: number }[];
  vizPublico: { label: string; valor: number; pct: number }[];
  interFormato: { label: string; valor: number; pct: number }[];
  alcanceDia: { dia: string; valor: number }[];
}> = {
  '30': {
    seguidores: 24791, alcancadas: 12387, visualizacoes: 59192,
    interacoes: 735, engajamento: 284, visitas: 2213, toques: 14,
    vizTipo: [
      { label: 'Stories',   valor: 37517, pct: 63.4 },
      { label: 'Carrossel', valor: 11667, pct: 19.7 },
      { label: 'Reels',     valor:  7732, pct: 13.1 },
      { label: 'Posts',     valor:  2272, pct:  3.8 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 37985, pct: 64.2 },
      { label: 'Não seguidores', valor: 20977, pct: 35.4 },
      { label: 'Desconhecido',   valor:   230, pct:  0.4 },
    ],
    interFormato: [
      { label: 'Stories', valor: 357, pct: 48.6 },
      { label: 'Posts',   valor: 238, pct: 32.4 },
      { label: 'Reels',   valor: 140, pct: 19.0 },
    ],
    alcanceDia: [
      { dia: '03/06', valor: 1820 }, { dia: '04/06', valor: 950 },
      { dia: '05/06', valor: 120 },  { dia: '06/06', valor: 80 },
      { dia: '07/06', valor: 1100 }, { dia: '08/06', valor: 890 },
      { dia: '09/06', valor: 440 },  { dia: '10/06', valor: 200 },
      { dia: '11/06', valor: 2400 }, { dia: '12/06', valor: 1950 },
      { dia: '13/06', valor: 90 },   { dia: '14/06', valor: 60 },
      { dia: '15/06', valor: 1980 }, { dia: '16/06', valor: 1850 },
      { dia: '17/06', valor: 300 },  { dia: '18/06', valor: 50 },
      { dia: '19/06', valor: 40 },   { dia: '20/06', valor: 120 },
      { dia: '21/06', valor: 60 },   { dia: '22/06', valor: 70 },
      { dia: '23/06', valor: 90 },   { dia: '24/06', valor: 3780 },
      { dia: '25/06', valor: 2900 }, { dia: '26/06', valor: 1200 },
      { dia: '27/06', valor: 400 },  { dia: '28/06', valor: 80 },
      { dia: '29/06', valor: 980 },  { dia: '30/06', valor: 600 },
      { dia: '01/07', valor: 180 },
    ],
  },
  '14': {
    seguidores: 24791, alcancadas: 6840, visualizacoes: 31200,
    interacoes: 382, engajamento: 148, visitas: 1104, toques: 7,
    vizTipo: [
      { label: 'Stories',   valor: 19800, pct: 63.5 },
      { label: 'Carrossel', valor:  6150, pct: 19.7 },
      { label: 'Reels',     valor:  4100, pct: 13.1 },
      { label: 'Posts',     valor:  1150, pct:  3.7 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 20100, pct: 64.4 },
      { label: 'Não seguidores', valor: 10980, pct: 35.2 },
      { label: 'Desconhecido',   valor:   120, pct:  0.4 },
    ],
    interFormato: [
      { label: 'Stories', valor: 186, pct: 48.7 },
      { label: 'Posts',   valor: 124, pct: 32.5 },
      { label: 'Reels',   valor:  72, pct: 18.8 },
    ],
    alcanceDia: [
      { dia: '19/06', valor: 40 },   { dia: '20/06', valor: 120 },
      { dia: '21/06', valor: 60 },   { dia: '22/06', valor: 70 },
      { dia: '23/06', valor: 90 },   { dia: '24/06', valor: 3780 },
      { dia: '25/06', valor: 2900 }, { dia: '26/06', valor: 1200 },
      { dia: '27/06', valor: 400 },  { dia: '28/06', valor: 80 },
      { dia: '29/06', valor: 980 },  { dia: '30/06', valor: 600 },
      { dia: '01/07', valor: 180 },
    ],
  },
  '7': {
    seguidores: 24791, alcancadas: 3210, visualizacoes: 14800,
    interacoes: 188, engajamento: 72, visitas: 540, toques: 3,
    vizTipo: [
      { label: 'Stories',   valor: 9400, pct: 63.5 },
      { label: 'Carrossel', valor: 2920, pct: 19.7 },
      { label: 'Reels',     valor: 1940, pct: 13.1 },
      { label: 'Posts',     valor:  540, pct:  3.7 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 9510, pct: 64.3 },
      { label: 'Não seguidores', valor: 5200, pct: 35.1 },
      { label: 'Desconhecido',   valor:   90, pct:  0.6 },
    ],
    interFormato: [
      { label: 'Stories', valor: 91, pct: 48.4 },
      { label: 'Posts',   valor: 61, pct: 32.4 },
      { label: 'Reels',   valor: 36, pct: 19.2 },
    ],
    alcanceDia: [
      { dia: '26/06', valor: 1200 }, { dia: '27/06', valor: 400 },
      { dia: '28/06', valor: 80 },   { dia: '29/06', valor: 980 },
      { dia: '30/06', valor: 600 },  { dia: '01/07', valor: 180 },
    ],
  },
};

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil';
  return n.toLocaleString('pt-BR');
}

function fmtK(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil';
  return n.toLocaleString('pt-BR');
}

const CTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--nova-bg-elev)', border: '1px solid var(--nova-border)', borderRadius: '.625rem', padding: '.5rem .75rem', fontSize: '.75rem', color: 'var(--nova-text)' }}>
      <div style={{ fontWeight: 600, marginBottom: '.2rem' }}>{label}</div>
      <div style={{ color: '#3D7BFF' }}>{fmtK(payload[0].value)} contas</div>
    </div>
  );
};

// ── Barra horizontal ──────────────────────────────────────────────────
function BarraHoriz({ label, valor, pct, max }: { label: string; valor: number; pct: number; max: number }) {
  return (
    <div style={{ marginBottom: '.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.375rem' }}>
        <span style={{ fontSize: '.875rem', color: 'var(--nova-text)' }}>{label}</span>
        <span style={{ fontSize: '.8125rem', color: 'var(--nova-text-dim)' }}>{fmt(valor)} · {pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
        <div style={{ width: `${(valor / max) * 100}%`, height: '100%', background: '#3D7BFF', borderRadius: 3, transition: 'width .5s ease' }} />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────
export default function Instagram() {
  const [periodo, setPeriodo] = useState<'7' | '14' | '30'>('30');
  const [vizFiltro, setVizFiltro] = useState<'tudo' | 'seguidores' | 'nao_seguidores'>('tudo');
  const d = DADOS[periodo];

  const kpis = [
    { label: 'Seguidores',             valor: d.seguidores,    sub: 'total (hoje)',  icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { label: 'Contas alcançadas',      valor: d.alcancadas,    sub: `últimos ${periodo} dias`, icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0' },
    { label: 'Visualizações',          valor: d.visualizacoes, sub: `últimos ${periodo} dias`, icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
    { label: 'Interações',             valor: d.interacoes,    sub: `últimos ${periodo} dias`, icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
    { label: 'Contas com engajamento', valor: d.engajamento,   sub: `últimos ${periodo} dias`, icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-5-3.87M16 3.13a4 4 0 0 1 0 7.75M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { label: 'Visitas ao perfil',      valor: d.visitas,       sub: `últimos ${periodo} dias`, icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
    { label: 'Toques no endereço',     valor: d.toques,        sub: `últimos ${periodo} dias`, icon: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' },
  ];

  const maxViz  = Math.max(...d.vizTipo.map(x => x.valor));
  const maxPub  = Math.max(...d.vizPublico.map(x => x.valor));
  const maxInter = Math.max(...d.interFormato.map(x => x.valor));

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.625rem', marginBottom: '.375rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '.75rem', background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
              <circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="6.5" r="1"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--nova-text)', margin: 0 }}>Social — Instagram</h1>
        </div>
        <div style={{ fontSize: '.8125rem', color: '#3D7BFF', marginBottom: '.25rem' }}>@nova.promotora · métricas via Meta API</div>
        <div style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>Última sincronização: 02/07/2026</div>

        {/* Seletor de período */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginTop: '1rem' }}>
          <span style={{ fontSize: '.8125rem', color: 'var(--nova-text-dim)' }}>Período:</span>
          {(['7', '14', '30'] as const).map(p => (
            <button key={p} onClick={() => setPeriodo(p)} style={{
              padding: '.375rem .875rem', borderRadius: '.625rem', border: '1px solid',
              fontSize: '.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              background: periodo === p ? '#3D7BFF' : 'transparent',
              borderColor: periodo === p ? '#3D7BFF' : 'var(--nova-border)',
              color: periodo === p ? '#fff' : 'var(--nova-text-dim)',
            }}>
              {p} dias
            </button>
          ))}
        </div>
      </div>

      {/* Título da seção */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--nova-text)' }}>
          Visão geral do perfil · últimos {periodo} dias
        </span>
      </div>

      {/* KPI cards — 6 em linha + 1 abaixo */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '.75rem', marginBottom: '.75rem' }}>
          {kpis.slice(0, 6).map(kpi => (
            <div key={kpi.label} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <path d={kpi.icon}/>
                </svg>
                <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>{kpi.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--nova-text)', lineHeight: 1 }}>
                {kpi.valor.toLocaleString('pt-BR')}
              </div>
              {kpi.sub && <div style={{ fontSize: '.625rem', color: 'var(--nova-text-dim)' }}>{kpi.sub}</div>}
            </div>
          ))}
        </div>
        {/* Card "Toques no endereço" menor */}
        <div style={{ maxWidth: 240 }}>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d={kpis[6].icon}/>
              </svg>
              <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>{kpis[6].label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--nova-text)', lineHeight: 1 }}>
              {kpis[6].valor}
            </div>
          </div>
        </div>
      </div>

      {/* Visualizações por tipo + por público */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Visualizações por tipo de conteúdo */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--nova-text)' }}>Visualizações por tipo de conteúdo</span>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '.375rem', marginBottom: '1.25rem' }}>
            {[
              { key: 'tudo',          label: 'Tudo' },
              { key: 'seguidores',    label: 'Seguidores' },
              { key: 'nao_seguidores', label: 'Não seguidores' },
            ].map(f => (
              <button key={f.key} onClick={() => setVizFiltro(f.key as any)} style={{
                padding: '.3rem .75rem', borderRadius: '.5rem', border: '1px solid',
                fontSize: '.75rem', fontWeight: 600, cursor: 'pointer',
                background: vizFiltro === f.key ? '#3D7BFF' : 'transparent',
                borderColor: vizFiltro === f.key ? '#3D7BFF' : 'var(--nova-border)',
                color: vizFiltro === f.key ? '#fff' : 'var(--nova-text-dim)',
              }}>
                {f.label}
              </button>
            ))}
          </div>

          {d.vizTipo.map(item => (
            <BarraHoriz key={item.label} label={item.label} valor={item.valor} pct={item.pct} max={maxViz} />
          ))}
        </div>

        {/* Visualizações por público */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--nova-text)' }}>Visualizações por público</span>
          </div>

          {d.vizPublico.map(item => (
            <BarraHoriz key={item.label} label={item.label} valor={item.valor} pct={item.pct} max={maxPub} />
          ))}
        </div>
      </div>

      {/* Interações por formato */}
      <div className="glass-card" style={{ padding: '1.25rem', maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--nova-text)' }}>Interações por formato</span>
        </div>
        {d.interFormato.map(item => (
          <BarraHoriz key={item.label} label={item.label} valor={item.valor} pct={item.pct} max={maxInter} />
        ))}
      </div>

      {/* Alcance por dia */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginBottom: '1.5rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--nova-text)' }}>Alcance por dia</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={d.alcanceDia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAlcance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3D7BFF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3D7BFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'var(--nova-text-dim)' }} axisLine={false} tickLine={false} interval={Math.floor(d.alcanceDia.length / 7)} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--nova-text-dim)' }} axisLine={false} tickLine={false} width={40}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)} mil` : String(v)} />
            <Tooltip content={<CTooltip />} />
            <Area type="monotone" dataKey="valor" stroke="#3D7BFF" strokeWidth={2} fill="url(#gradAlcance)" dot={false} activeDot={{ r: 4, fill: '#3D7BFF' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
